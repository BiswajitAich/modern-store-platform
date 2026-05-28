"use server";

import prisma from "@/lib/prisma";
import { cache } from "react";
import { tryIt } from "./custom";


export const getWishlistItems = cache(
  async (productId: number, userId: string) => {
    // "use cache";
    // cacheLife("hours");
    // cacheTag(`wishlist-items-product-${productId}-user-${userId}`);
    const [err, data] = await tryIt(async () => {
      if (!userId) {
        return [];
      }
      return await prisma.wishlistItem.findMany({
        where: {
          userId,
          productId,
        },
        select: {
          variantId: true,
        },
      });
    });
    if (err) {
      console.error("Error fetching wishlist items:", err);
      return [];
    }
    return data as { variantId: number }[];
  },
);

export const getUserWishlistVariantIds = cache(async (
  userId: string,
): Promise<Set<number>> => {
  // "use cache";
  // cacheLife("hours");
  // cacheTag(`user-wishlist-variant-ids-${userId}`);
  if (!userId) {
    return new Set<number>();
  }
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    select: { variantId: true },
  });

  return new Set(items.map((i) => i.variantId));
});

// /explore/page.tsx
// export const getRecentProducts = async () => {
//   "use cache";
//   cacheLife("hours");
//   cacheTag("explore");

//   const [err, data] = await tryIt(async () => {
//     const recentProductsRaw = await fetchRecentProducts();
//     const products = recentProductsRaw
//       .filter((p) => p.variants.length > 0)
//       .map((p) => mapProductWithVariantToCard(p as any))
//       .filter(Boolean) as ProductCardDTO[];
//     return products;
//   });
//   if (err) {
//     console.error("Error fetching recent products:", err);
//     return [];
//   }
//   return data as ProductCardDTO[];
// };

// /s/[storeSlug]/p/[...slug]/page.tsx
// export const getProductPageData = async (storeSlug: string) => {
//   "use cache";
//   cacheLife("hours");
//   cacheTag(`product-s-${storeSlug}`);
//   const [adminErr, admin] = await tryIt(async () => {
//     return await fetchAdminByStoreSlug(storeSlug);
//   }
//   );
//   if (adminErr || !admin) {
//     console.error("Admin fetch error:", adminErr);

//     return {
//       categories: [],
//       products: [],
//     };
//   }

//   const [categoriesErr, categories] = await tryIt(() =>
//     fetchCategoryByAdmin(admin.adminId),
//   );

//   const [productsErr, productsRaw] = await tryIt(() =>
//     prisma.product.findMany({
//         where: {
//             isActive: true,
//             isFeatured: true,
//             adminId: admin.adminId,
//             variants: {
//                 some: {
//                     stock: { gt: 0 },
//                 },
//             },
//         },
//         orderBy: { sortOrder: "asc" },
//         ...productCardQuery,
//         take: 10,
//       }),
//   );

//   if (categoriesErr) {
//     console.error("Categories fetch error:", categoriesErr);
//   }

//   if (productsErr) {
//     console.error("Products fetch error:", productsErr);
//   }

//   const products =
//     productsRaw
//       ?.filter((p) => p.variants.length > 0)
//       .map(mapProductWithVariantToCard)
//       .filter(Boolean) ?? [];

//   return {
//     categories: categories ?? [],
//     products: products ?? [],
//   };
// };

// /account/wishlist/page.tsx
// export const getWishlistPageData = cache(async (userId: string) => {
//   const [err, data] = await tryIt(async () => {
//     if (!userId) {
//       return [];
//     }
//     const items = await prisma.wishlistItem.findMany({
//       where: { userId },
//       orderBy: { createdAt: "desc" },
//       include: {
//         product: {
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//             admin: {
//               select: { storeSlug: true },
//             },
//           },
//         },
//         variant: {
//           select: {
//             id: true,
//             price: true,
//             originalPrice: true,
//             images: {
//               where: { isPrimary: true },
//               take: 1,
//               select: { image: true },
//             },
//           },
//         },
//       },
//     });

//     return items
//       .map(mapWishlistItemToCard)
//       .filter((p): p is ProductCardDTOWithLike => p !== null);
//   });
//   if (err) {
//     console.error("Error fetching wishlist data:", err);
//     return [];
//   }
//   return data as ProductCardDTOWithLike[];
// });

// /s/[storeSlug]/c/[...slug]/page.tsx
// export const getCategoryPageData = cache(
//   async (storeSlug: string, slug: string[]) => {
//     "use cache";
//     cacheLife("hours");
//     const [err, data] = await tryIt(async () => {
//       const admin = await prisma.admin.findFirst({
//         where: { storeSlug, isActive: true },
//         select: { adminId: true },
//       });

//       let parentId: number | null = null;
//       let currentCategory = null;

//       for (const slugPart of slug) {
//         currentCategory = await prisma.category.findFirst({
//           where: {
//             isActive: true,
//             slug: slugPart,
//             adminId: admin?.adminId,
//             parentId: parentId,
//           },
//           select: {
//             id: true,
//             name: true,
//             slug: true,
//             image: true,
//           },
//         });

//         if (!currentCategory) {
//           return { childCategories: [], products: [] };
//         }
//         parentId = currentCategory.id;
//       }
//       const finalCategoryId = currentCategory?.id;
//       const childCategories = await prisma.category.findMany({
//         where: {
//           parentId: finalCategoryId,
//           adminId: admin?.adminId,
//           isActive: true,
//         },
//         orderBy: { sortOrder: "asc" },
//         select: {
//           id: true,
//           name: true,
//           slug: true,
//           image: true,
//           parentId: true,
//           _count: {
//             select: { products: true },
//           },
//         },
//       });

  

//       const products = productsRaw.map((p: any) =>
//         mapProductWithVariantToCard(p, storeSlug),
//       );
//       return { childCategories, products };
//     });
//     if (err) {
//       console.error("Error fetching category page data:", err);
//       return { childCategories: [], products: [] };
//     }
//     return data as { childCategories: any[]; products: wishlistItemDTO[] };
//   },
// );
