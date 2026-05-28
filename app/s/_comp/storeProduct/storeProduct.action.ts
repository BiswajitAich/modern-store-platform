"use server";

import { getCategoryContext } from "@/app/_lib/db/queries/category.query";
import { productCardQuery } from "@/app/_lib/db/queries/product.query";
import { createCursorPagination } from "@/app/_lib/db/utils/createCursorPagination";
import { extractCursorPage } from "@/app/_lib/db/utils/extractCursorPage";
import { mapProductWithVariantToCard } from "@/app/_lib/serializer";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export const loadMoreStoreProductsAction = async ({
  storeSlug,
  slugs,
  cursor,
  take = 21,
}: {
  storeSlug: string;
  slugs?: string[];
  cursor?: number;
  take?: number;
}) => {
  "use cache";
  cacheLife("hours");
  const hasSlugs = !!slugs?.length;
  cacheTag(
    hasSlugs ? `store-Products-section-${storeSlug}-${slugs.join("-")}-${cursor ? cursor : 0}` :
      `store-Products-section-${storeSlug}`
  )

  try {
    let context = null;
    if (hasSlugs) {
      context = await getCategoryContext(
        storeSlug,
        slugs
      );

      if (!context) {
        return {
          items: [],
          nextCursor: null,
          hasMore: false,
        };
      };
    }
    const rawProducts = await prisma.product.findMany({
      where: hasSlugs ? {
        isActive: true,
        adminId: context!.adminId,
        categoryId: context!.category.id,
      } : {
        isActive: true,
        admin: {
          storeSlug: storeSlug,
          isActive: true,
        }
      },
      ...createCursorPagination({
        cursor,
        take,
        orderBy: "desc"
      }),
      ...productCardQuery,
    });
    const mappedProducts = rawProducts
      .map(mapProductWithVariantToCard)
      .filter((p): p is NonNullable<typeof p> => Boolean(p));
    return extractCursorPage({
      items: mappedProducts,
      take,
    })
  } catch (error) {
    console.error(error);
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
  }
}