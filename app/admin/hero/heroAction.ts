"use server";

import cloudinary from "@/app/_lib/cloudinary";
import { tryIt } from "@/app/_lib/custom";
import { ErrorFormState } from "@/app/_lib/types";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

export const createHero = async (
  _prevState: ErrorFormState | undefined,
  formData: FormData,
): Promise<ErrorFormState> => {
  const session = await getServerSession(authOptions);
  const [error] = await tryIt(async () => {
    const title = formData.get("title") as string;
    if (!title || title.trim() === "") {
      throw new Error("Title is required");
    }
    const subtitle = formData.get("subtitle") as string | null;
    if (subtitle && subtitle.trim() === "") {
      throw new Error("Subtitle cannot be empty if provided");
    }

    const productIdRaw = formData.get("productId");
    const productId =
      productIdRaw && productIdRaw !== "" ? Number(productIdRaw) : null;

    const categoryIdRaw = formData.get("categoryId");
    const categoryId =
      categoryIdRaw && categoryIdRaw !== "" ? Number(categoryIdRaw) : null;
    if (productId && categoryId) {
      throw new Error(
        "Hero banner can link to either product or category, not both",
      );
    }

    const orderRaw = formData.get("order");
    const sortOrder = orderRaw ? Number(orderRaw) : 0;

    const isActive = formData.get("isActive") === "on";

    const heroImage = formData.get("heroImage") as File;
    if (!heroImage || heroImage.size === 0) {
      throw new Error("Hero image is required");
    }

    const buttonTextRaw = formData.get("buttonText") as string | null;
    const buttonText =
      buttonTextRaw && buttonTextRaw.trim() !== "" ? buttonTextRaw : null;

    const startDateRaw = formData.get("startDate") as string | null;
    const startDate =
      startDateRaw && startDateRaw.trim() !== ""
        ? new Date(startDateRaw)
        : null;

    const endDateRaw = formData.get("endDate") as string | null;
    const endDate =
      endDateRaw && endDateRaw.trim() !== "" ? new Date(endDateRaw) : null;

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    let imagePublicId: string | null = null;
    imagePublicId = await new Promise<string>(async (res, rej) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "commyfy/heroBanners",
        },
        (err, result) => (err ? rej(err) : res(result?.public_id || "")),
      );
      stream.end(Buffer.from(await heroImage.arrayBuffer()));
    });
    await prisma.heroBanner.create({
      data: {
        title,
        subtitle,
        buttonText,
        productId,
        categoryId,
        sortOrder,
        isActive,
        adminId: session.user.id,
        image: imagePublicId,
        startDate,
        endDate,
      },
    });
  });

  if (error) {
    console.log("Hero ServerAction error:" + error);

    return {
      error: "Failed to create hero banner. Please try again.",
      timestamp: new Date().toISOString(),
    };
  }
  if (session?.user.storeSlug)
    revalidateTag(`store-${session.user.storeSlug}-heroes`, "max");
  if (session?.user.id)
    revalidateTag(`admin-counts-${session.user.id}`, "max");
  return {
    error: undefined,
    timestamp: new Date().toISOString(),
  };
};
