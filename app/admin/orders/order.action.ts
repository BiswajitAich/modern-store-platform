"use server";

import prisma from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { WhatsAppOrderStatus } from "@/app/_lib/types";

export async function updateOrderStatus(
  id: number,
  status: WhatsAppOrderStatus,
  storeSlug?: string,
  slug?: string
) {
  const order = await prisma.whatsAppOrder.findUnique({
    where: { id },
    select: {
      status: true,
      quantity: true,
      variantId: true,
    },
  });

  if (!order) {
    return {
      success: false,
      message: "Order not found"
    };
  }
  if (!order.variantId) {
    return {
      success: false,
      message: "Order has no variant"
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.whatsAppOrder.update({
      where: { id },
      data: { status },
    });
    if (
      order.status === "INITIATED" &&
      status === "RECEIVED" &&
      order.variantId
    ) {
      const variant = await tx.productVariant.findUnique({
        where: {
          id: order.variantId,
        },
        select: {
          stock: true,
        },
      });

      if (!variant) {
        return {
          success: false,
          message: "Variant not found"
        };
      }

      if (variant.stock < order.quantity) {
        return {
          success: false,
          message: "Insufficient stock"
        };
      }

      await tx.productVariant.update({
        where: {
          id: order.variantId,
        },
        data: {
          stock: {
            decrement: order.quantity,
          },
        },
      });
    }
  });

  revalidateTag(`admin-order-orderId-${id}`, "max");
  if (storeSlug && slug) revalidateTag(`s-${storeSlug}-p-${slug}`, "max");
  return {
    success: true,
  };
}