import { tryIt } from "@/app/_lib/custom";
import {
  getAuthenticatedUser,
  isAuthenticatedUser,
} from "@/app/_lib/customForServerSide";
import { pushToAdmin } from "@/app/_lib/notificationConnections";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (request: NextRequest) => {
  const [err, data] = await tryIt(async () => {
    const searchParams = request.nextUrl.searchParams;
    const productId = Number(searchParams.get("productId"));
    if (!productId) {
      throw new Error("Product ID is required");
    }
    return await prisma.review.findMany({
      where: {
        productId,
        // isVerified: true,
        // isApproved: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            lastName: true,
            firstName: true,
          },
        },
      },
    });
  });
  if (err) {
    console.log("Failed to fetch reviews:", err);
    return NextResponse.json([], { status: 500 });
  }
  return NextResponse.json(data, { status: 200 });
};

export const POST = async (
  request: NextRequest,
): Promise<NextResponse<{ error?: string; success: boolean }>> => {
  const [err] = await tryIt(async () => {
    const body = await request.json();
    const { productId, rating, comment } = body;
    if (
      !productId ||
      typeof rating !== "number" ||
      rating < 1 ||
      rating > 5 ||
      typeof comment !== "string" ||
      !comment.trim()
    ) {
      throw new Error("Invalid review data");
    }
    if (!(await isAuthenticatedUser())) {
      throw new Error("User must be authenticated to submit a review");
    }
    const existing = await prisma.review.findFirst({
      where: {
        productId,
        userId: (await getAuthenticatedUser()).id,
      },
    });

    if (existing) {
      throw new Error("You have already reviewed this product");
    }

    const admin = await prisma.product.findUnique({
      where: { id: productId },
      select: { adminId: true },
    });
    if (!admin) {
      throw new Error("Product not found");
    }

    const review = await prisma.review.create({
      data: {
        productId,
        rating,
        comment,
        userId: await getAuthenticatedUser().then((user) => user.id),
      },
    });

    const notification = await prisma.adminNotification.create({
      data: {
        adminId: admin?.adminId,
        type: "REVIEW_CREATED",
        entityId: review.id,
        message: `New review submitted for ${review.productId}.`,
      },
    });
    pushToAdmin(admin?.adminId, {
      hasNew: true,
      notification: [notification],
    });
  });
  if (err) {
    console.log("Failed to submit review:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Failed to submit review",
        success: false,
      },
      { status: 400 },
    );
  }
  return NextResponse.json({ success: true }, { status: 201 });
};
