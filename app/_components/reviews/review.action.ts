"use server"
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";


export const fetchIfUserCanGiveReview = async (productId: number, userId: string) => {
  "use cache"
  cacheLife("hours");
  try {
    return await prisma.whatsAppOrder.findFirst({
      where: {
        productId,
        userId,
        status: "DELIVERED",
      },
    });
  } catch (error) {
    return false;
  }
}

export const getReviews = async (productId: number) => {
  "use cache";
  cacheLife("hours");
  cacheTag(`product-reviews-${productId}`);

  try {
    return await prisma.review.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  } catch (err) {
    return null;
  }

};