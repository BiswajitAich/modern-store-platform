import prisma from "@/lib/prisma";

// export async function fetchRecentProducts() {
//     return prisma.product.findMany({
//         where: {
//             isActive: true,
//             variants: {
//                 some: {
//                     stock: { gt: 0 },
//                 },
//             },
//         },
//         orderBy: {
//             updatedAt: "desc",
//         },
//         take: 10,
//         select: {
//             id: true,
//             name: true,
//             slug: true,

//             admin: {
//                 select: {
//                     storeSlug: true,
//                 },
//             },

//             variants: {
//                 where: {
//                     stock: { gt: 0 },
//                 },
//                 orderBy: {
//                     price: "asc",
//                 },
//                 take: 1,

//                 select: {
//                     id: true,
//                     optionHash: true,
//                     price: true,
//                     originalPrice: true,

//                     images: {
//                         orderBy: [
//                             { isPrimary: "desc" },
//                             { sortOrder: "asc" },
//                         ],
//                         take: 1,
//                         select: {
//                             image: true,
//                         },
//                     },
//                 },
//             },
//         },
//     });
// }

export async function fetchAdminByStoreSlug(storeSlug: string) {
    return prisma.admin.findFirst({
        where: { storeSlug, isActive: true },
        select: { adminId: true },
    })
}
export async function fetchCategoryByAdmin(adminId: string) {
    return await prisma.category.findMany({
        where: { isActive: true, parentId: null, adminId: adminId },
        orderBy: { sortOrder: "asc" },
        select: {
            id: true,
            name: true,
            slug: true,
            image: true,
        },
        take: 15,
    });
}
// export async function fetchProductsByAdmin(adminId: string) {
//     return prisma.product.findMany({
//         where: {
//             isActive: true,
//             isFeatured: true,
//             adminId: adminId,
//             variants: {
//                 some: {
//                     stock: { gt: 0 },
//                 },
//             },
//         },
//         orderBy: { sortOrder: "asc" },
//         take: 10,
//         select: {
//             id: true,
//             name: true,
//             slug: true,
//             variants: {
//                 where: { stock: { gt: 0 } },
//                 orderBy: { price: "asc" },
//                 take: 1,
//                 select: {
//                     id: true,
//                     optionHash: true,
//                     price: true,
//                     originalPrice: true,
//                     images: {
//                         orderBy: { sortOrder: "asc" },
//                         take: 1,
//                         select: { image: true },
//                     },
//                 },
//             },
//         },
//     });

// }
// export async function fetchHeroData(storeSlug: string) {
//     const now = new Date();
//     return prisma.heroBanner.findMany({
//       where: {
//         isActive: true,
//         admin: {
//           storeSlug,
//           isActive: true,
//         },
//         AND: [
//           {
//             OR: [{ startDate: null }, { startDate: { lte: now } }],
//           },
//           {
//             OR: [{ endDate: null }, { endDate: { gte: now } }],
//           },
//         ],
//       },
//       select: {
//         id: true,
//         title: true,
//         subtitle: true,
//         image: true,
//         sortOrder: true,
//         buttonText: true,
//         product: {
//           select: {
//             slug: true,
//           },
//         },
//         category: {
//           select: {
//             slug: true,
//           },
//         },
//       },
//     orderBy: [
//       { sortOrder: "asc" },
//       { id: "asc" },
//     ],
//     take: 10,
//     });
// }