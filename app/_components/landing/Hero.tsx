import { heroQuery } from "@/app/_lib/db/queries/hero.query";
import Herocarousel from "./Herocarousel";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import HeroSkeleton from "../loaders/HeroSkeleton";
const now = new Date();

export const getHeroData = async (storeSlug: string) => {
  "use cache";
  cacheLife("hours");
  cacheTag(`store-${storeSlug}-heroes`)
  try {
    return await prisma.heroBanner.findMany({
      where: {
        isActive: true,
        admin: {
          storeSlug,
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
      ...heroQuery,
      orderBy: [
        { sortOrder: "asc" },
        { id: "asc" },
      ],
      take: 10,
    });
  } catch (err) {
    console.error("Failed to fetch hero data" + err);
    return [];
  }
}

const Hero = async ({ storeSlug }: { storeSlug: string }) => {
  const heroData = await getHeroData(storeSlug);

  if (!heroData) return null;
  return (
    <Suspense fallback={<HeroSkeleton />} >
      <Herocarousel data={heroData} />
    </Suspense>
  )
};

export default Hero;
