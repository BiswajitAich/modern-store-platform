import { CategoryCardDTO } from "@/app/_lib/db/types/category.types";
import styles from "../Explore.module.css";
import CatCard from "@/app/_components/card/CatCard";
import { categoryCardQuery } from "@/app/_lib/db/queries/category.query";
import { mapCategoryToCard } from "@/app/_lib/serializer";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import SectionHeading from "@/app/_components/common/SectionHeading";
export const getRecentCategories = async () => {
    "use cache";
    cacheLife("hours");
    cacheTag("exploreCategories");

    try {
        const recentcategoriesRaw = await prisma.category.findMany({
            where: {
                isActive: true,
                OR: [
                    {
                        products: {
                            some: {
                                isActive: true,
                            },
                        },
                    },
                    {
                        children: {
                            some: {
                                isActive: true,
                            },
                        },
                    },
                ],
            },

            orderBy: {
                updatedAt: "desc",
            },

            take: 10,
            ...categoryCardQuery,
        });

        return recentcategoriesRaw
            .map(mapCategoryToCard)
            .filter(Boolean) as CategoryCardDTO[];
    } catch (err) {
        // console.error("Error fetching recent products:", err);
        // return [];
        throw new Error("Unable to load data - Recent categories!");
    }
};
const RecentCategoriesExplore = async () => {
    const categories = await getRecentCategories();
    if (!categories.length) return null;

    return (
        <section className={styles.recentProductsSection}>
            <SectionHeading title="Recent categories" />
            {categories.length === 0 ? (
                <section style={{ height: "50vh" }}>
                    <h2>No categories Available</h2>
                    <p>
                        There are currently no categories available. Please
                        check back later.
                    </p>
                </section>
            ) : (
                <div className={styles.grid}>
                    {categories.map((cat, key) => {
                        return <CatCard key={key} categories={cat} />;
                    })}
                </div>
            )}
        </section>
    );
};

export default RecentCategoriesExplore;
