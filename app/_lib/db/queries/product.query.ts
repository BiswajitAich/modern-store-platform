import prisma from "@/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import { serializeProduct } from "../../serializer";
import { ProductPageSerialized } from "../types/product.types";

export const productPageQuery = {
  select: {
    id: true,
    name: true,
    description: true,
    brand: true,
    updatedAt: true,

    attributes: {
      select: {
        id: true,
        key: true,
        value: true,
      },
    },

    variants: {
      where: { stock: { gt: 0 } },
      orderBy: { price: "asc" },
      select: {
        id: true,
        productId: true,
        price: true,
        originalPrice: true,
        stock: true,
        sku: true,
        optionHash: true,
        updatedAt: true,

        images: {
          orderBy: [
            { isPrimary: "desc" },
            { sortOrder: "asc" },
          ],
          select: {
            image: true,
          },
        },

        options: {
          select: {
            id: true,
            key: true,
            value: true,
          },
        },
      },
    },

    _count: {
      select: {
        reviews: true,
      },
    },
  },
} satisfies Prisma.ProductDefaultArgs;

export type ProductPageData =
  Prisma.ProductGetPayload<typeof productPageQuery>;

export const fetchPageProductDataBySlug = async (
  slug: string,
  storeSlug: string,
): Promise<ProductPageSerialized | null> => {

  try {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        isActive: true,
        admin: {
          storeSlug
        }
      },

      ...productPageQuery,
    });
    return product ? serializeProduct(product) : null;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const productCardQuery = {
  select: {
    id: true,
    name: true,
    slug: true,

    admin: {
      select: {
        storeSlug: true,
      },
    },

    variants: {
      where: {
        stock: {
          gt: 0,
        },
      },

      orderBy: {
        price: "asc",
      },

      take: 1,

      select: {
        id: true,

        price: true,
        originalPrice: true,

        images: {
          where: {
            isPrimary: true,
          },

          take: 1,

          select: {
            image: true,
          },
        },

        options: {
          select: {
            key: true,
            value: true,
          },
        },
      },
    },
  },
} satisfies Prisma.ProductDefaultArgs;

export type ProductCardData =
  Prisma.ProductGetPayload<
    typeof productCardQuery
  >;


export const wishlistItemQuery = {
  select: {
    product: {
      select: {
        id: true,
        name: true,
        slug: true,
        admin: { select: { storeSlug: true } },
      },
    },
    variant: {
      select: {
        id: true,
        price: true,
        originalPrice: true,
        images: {
          where: { isPrimary: true },
          take: 1,
          select: { image: true },
        },
        options: {
          select: { key: true, value: true },
        },
      },
    },
  },
} satisfies Prisma.WishlistItemDefaultArgs;

export type WishlistItemWithRelations = Prisma.WishlistItemGetPayload<typeof wishlistItemQuery>;

