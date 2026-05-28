import Herocarousel from "@/app/_components/landing/Herocarousel";
import HeroSkeleton from "@/app/_components/loaders/HeroSkeleton";
import { heroQuery } from "@/app/_lib/db/queries/hero.query";
import { HeroDTO } from "@/app/_lib/db/types/hero.types";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";

const now = new Date();
export const getRecentHero = async () => {
    "use cache";
    cacheLife("hours");
    cacheTag("exploreHero");

    try {
        const heroRaw = await prisma.heroBanner.findMany({
            where: {
                isActive: true,
                admin: {
                    isActive: true,
                },
                AND: [
                    {
                        OR: [{ startDate: null }, { startDate: { lte: now } }],
                    },
                    {
                        OR: [{ endDate: null }, { endDate: { gte: now } }],
                    },
                ],
            },
            orderBy: [
                { sortOrder: "asc" },
                { id: "asc" },
            ],
            ...heroQuery,
            take: 10,
        });

        return heroRaw as HeroDTO[];

    } catch (err) {
        console.error("Error fetching recent hero:", err);
        return [];
        // throw new Error((err as Error).message);
    }
};
const RecentHero = async () => {

    return (
        <Suspense fallback={<HeroSkeleton />} >
            <Herocarousel data={await getRecentHero()} />
        </Suspense>
    )
}

export default RecentHero;