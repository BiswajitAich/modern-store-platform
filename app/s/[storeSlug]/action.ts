"use server";
import { tryIt } from "@/app/_lib/custom";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function addToWishListAction({
  variantId,
  productId,
  path,
}: {
  variantId: number | undefined;
  productId: number | undefined;
  path: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  // testing purpose
  console.log("Inside addToWishListAction");
  if (!variantId || !productId) {
    return {
      success: false,
      message: "INVALID_INPUT",
    };
  }
  const session = await getServerSession(authOptions);
  if (!session) {
    return {
      success: false,
      message: "LOGIN_REQUIRED",
    };
  }
  let isAdded = false;
  const [error] = await tryIt(async () => {
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId_variantId: {
          userId: session.user.id,
          productId,
          variantId,
        },
      },
    });
    if (existing) {
      await prisma.wishlistItem.delete({
        where: {
          userId_productId_variantId: {
            userId: session.user.id,
            productId,
            variantId,
          },
        },
      });
      isAdded = false;
    } else {
      await prisma.wishlistItem.upsert({
        where: {
          userId_productId_variantId: {
            userId: session.user.id,
            productId,
            variantId,
          },
        },
        create: {
          userId: session.user.id,
          productId,
          variantId,
        },
        update: {},
      });
      isAdded = true;
    }
  });
  if (error) {
    console.error("Error adding to wishlist:", error);
    return {
      success: false,
      message: "SERVER_ERROR",
    };
  }
  if (path === "/account/wishlist") {
    revalidatePath("/account/wishlist");
  }
  return {
    success: true,
    message: isAdded ? "ADDED" : "REMOVED",
  };
}
