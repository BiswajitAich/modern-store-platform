import type { Prisma } from "@/app/generated/prisma/client";

export const heroQuery = {
    select: {
        id: true,
        title: true,
        subtitle: true,
        image: true,
        sortOrder: true,
        buttonText: true,

        product: {
            select: {
                slug: true,
            },
        },

        category: {
            select: {
                slug: true,
            },
        },

        admin: {
            select: {
                storeSlug: true,
            }
        }
    },
} satisfies Prisma.HeroBannerDefaultArgs;
export type HeroBannerData = Prisma.HeroBannerGetPayload<typeof heroQuery>;