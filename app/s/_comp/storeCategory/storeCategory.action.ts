"use server";

import { getCategoryContext, categoryCardQuery } from "@/app/_lib/db/queries/category.query";
import { createCursorPagination } from "@/app/_lib/db/utils/createCursorPagination";
import { extractCursorPage } from "@/app/_lib/db/utils/extractCursorPage";
import { mapCategoryToCard } from "@/app/_lib/serializer";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";

export const loadMoreStoreCategoryAction = async ({
    storeSlug,
    slugs,
    cursor,
    take = 2,
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
        hasSlugs ?
            `store-categories-section-${storeSlug}-${slugs.join("-")}-${cursor ? cursor : 0}`
            : `store-categories-section-${storeSlug}`)
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
        const rawCategories = await prisma.category.findMany({
            where: hasSlugs ? {
                isActive: true,
                parentId: context!.category.id,
                adminId: context!.adminId,
            } : {
                isActive: true,
                parentId: null,
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
            ...categoryCardQuery,
        });
        const mappedCategory = rawCategories.map(mapCategoryToCard)
            .filter((p): p is NonNullable<typeof p> => Boolean(p));
        return extractCursorPage({
            items: mappedCategory,
            take,
        })
    } catch (error) {
        // console.error(error);
        throw new Error("Error while - load More Store Category Action")
        // return {
        //     items: [],
        //     nextCursor: null,
        //     hasMore: false,
        // };
    }
}
