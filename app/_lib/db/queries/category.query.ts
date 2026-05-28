import type { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { cache } from "react";
import { buildTree } from "./buildTree";

export const resolveCategoryByPath = async (
  adminId: string,
  slugParts: string[]
) => {
  let parentId: number | null = null;
  let currentCategory = null;

  for (const slugPart of slugParts) {
    currentCategory =
      await prisma.category.findFirst({
        where: {
          slug: slugPart,
          adminId,
          parentId,
          isActive: true,
        },

        select: {
          id: true,
          name: true,
          slug: true,
          image: true,
        },
      });

    if (!currentCategory) {
      return null;
    }

    parentId = currentCategory.id;
  }

  return currentCategory;
};
export const getCategoryContext = cache(
  async (
    storeSlug: string,
    slugs: string[]
  ) => {
    const admin = await prisma.admin.findFirst({
      where: {
        storeSlug,
        isActive: true,
      },

      select: {
        adminId: true,
      },
    });

    if (!admin) return null;

    const category =
      await resolveCategoryByPath(
        admin.adminId,
        slugs
      );

    if (!category) return null;

    return {
      adminId: admin.adminId,
      category,
    };
  }
);

export const fetchFlatCategories = async (adminId: string) => {
  return prisma.category.findMany({
    where: {
      adminId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });
};

export const getFlatCategories = async (
  adminId: string,
  excludeId?: number,
) => {
  try {
    const flat = await fetchFlatCategories(adminId);
    const filtered = excludeId
      ? flat.filter((c) => c.id !== excludeId)
      : flat;
    const nodes = filtered.map((n) => ({
      ...n,
      children: [],
    }));
    return buildTree(nodes);
  } catch (error) {
    console.error(error);
    return [];
  }
};


export const categoryCardQuery = {
  select: {
    id: true,
    name: true,
    slug: true,

    admin: {
      select: {
        storeSlug: true,
      },
    },

    image: true,

    products: {
      where: {
        isActive: true,
        variants: {
          some: {
            stock: { gt: 0 },
          },
        },
      },

      take: 1,

      select: {
        variants: {
          take: 1,

          select: {
            images: {
              take: 1,

              select: {
                image: true,
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CategoryDefaultArgs;

export type CategoryCardData =
  Prisma.CategoryGetPayload<typeof categoryCardQuery>;

export const categoryAdminListQuery = {
  select: {
    id: true,
    name: true,
    slug: true,
    createdAt: true,
    isActive: true,
    image: true,
    updatedAt: true,

    parent: {
      select: {
        id: true,
        name: true,
      },
    },

    _count: {
      select: {
        products: true,
        children: true,
      },
    },
  },
} satisfies Prisma.CategoryDefaultArgs;

export type CategoryAdminListData =
  Prisma.CategoryGetPayload<typeof categoryAdminListQuery>;