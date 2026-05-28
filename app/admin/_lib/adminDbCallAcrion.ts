"use server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";

export const updateDbHeroStatus = async (heroId: number, isActive: boolean) => {
    const data = prisma.heroBanner.update({
        where: {
            id: heroId
        },
        data: {
            isActive
        }
    })
    const session = await getServerSession(authOptions);
    if (session?.user.storeSlug)
        revalidateTag(`store-${session.user.storeSlug}-heroes`, "max");
    return data;
}
export const deleteDbHero = async (heroId: number) => {
    const data = prisma.heroBanner.delete({
        where: {
            id: heroId
        }
    })
    const session = await getServerSession(authOptions);
    if (session?.user.storeSlug)
        revalidateTag(`store-${session.user.storeSlug}-heroes`, "max");
    if (session?.user.id)
        revalidateTag(`admin-counts-${session.user.id}`, "max");
    return data
}
export const fetchCategoriesForOptions = async (adminId: string) => {
    return prisma.category.findMany({
        where: { adminId: adminId, isActive: true },
        select: {
            id: true,
            name: true,
            parentId: true,
        },
        orderBy: { name: "asc" },
    });
}
export const fetchProductsforOptions = async (adminId: string) => {
    return prisma.product.findMany({
        where: {
            adminId: adminId,
            isActive: true,
        },
        select: {
            id: true,
            name: true,
        },
        orderBy: {
            name: "asc",
        },
    });
}


// export const fetchRecentProductsAdmin = async (adminId: string) => {
//     return prisma.product.findMany({
//         where: { adminId },
//         take: 5,
//         select: {
//             id: true,
//             name: true,
//             isActive: true,
//             createdAt: true,
//             _count: { select: { variants: true } },
//         },
//         orderBy: { createdAt: "desc" },
//     })
// }
// export const fetchRecentCategoryAdmin = async (adminId: string) => {
//     "use cache";
//     cacheLife("hours");
//     return prisma.category.findMany({
//         where: { adminId },
//         take: 5,
//         select: {
//             id: true,
//             name: true,
//             isActive: true,
//             createdAt: true,
//         },
//         orderBy: { createdAt: "desc" },
//     })
// }

// export const fetchPageProductData = async (slug: string, adminId: string) => {
//     "use cache";
//     cacheLife("hours");
//     return prisma.product.findFirst({
//         where: { slug: slug, isActive: true, adminId: adminId },
//         select: {
//             id: true,
//             name: true,
//             description: true,
//             brand: true,
//             updatedAt: true,

//             attributes: {
//                 select: {
//                     id: true,
//                     key: true,
//                     value: true,
//                 },
//             },

//             variants: {
//                 where: { stock: { gt: 0 } },
//                 orderBy: { price: "asc" },
//                 select: {
//                     id: true,
//                     productId: true,
//                     price: true,
//                     originalPrice: true,
//                     stock: true,
//                     sku: true,
//                     optionHash: true,
//                     updatedAt: true,
//                     images: {
//                         orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
//                         select: { image: true },
//                     },
//                     options: {
//                         select: {
//                             id: true,
//                             key: true,
//                             value: true,
//                         },
//                     },
//                 },
//             },
//             _count: {
//                 select: {
//                     reviews: true,
//                 },
//             },
//         },
//     });
// }
export const fetchHeroEditData = async (id: number) => {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin" || !session.user.id) {
        throw new Error("fetchHeroEditData error");
    }
    return prisma.heroBanner.findUnique({
        where: { id, adminId: session?.user.id },
        select: {
            id: true,
            isActive: true,
            productId: true,
            title: true,
            categoryId: true,
            subtitle: true,
            image: true,
            sortOrder: true,
            buttonText: true,
            startDate: true,
            endDate: true,
        }
    })
}