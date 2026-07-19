import { ProductCardDTO } from "@/app/_lib/db/types/product.types";
import styles from "../Explore.module.css";
import Card from "@/app/_components/card/Card";
import { productCardQuery } from "@/app/_lib/db/queries/product.query";
import { mapProductWithVariantToCard } from "@/app/_lib/serializer";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import SectionHeading from "@/app/_components/common/SectionHeading";

export const getRecentProducts = async () => {
    "use cache";
    cacheLife("hours");
    cacheTag("exploreProducts");

    try {
        const recentProductsRaw = await prisma.product.findMany({
            where: {
                isActive: true,
                variants: {
                    some: {
                        stock: { gt: 0 },
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
            ...productCardQuery,
            take: 10,
        });

        return recentProductsRaw
            .map(mapProductWithVariantToCard)
            .filter(Boolean) as ProductCardDTO[];
    } catch (err) {
        // console.error("Error fetching recent products:", err);
        // return [];
        throw new Error("Unable to load data - Recent Products");
    }
};

const RecentProductExplore = async () => {
    const explore = await getRecentProducts();
    if (!explore.length) return null;

    return (
        <section className={styles.recentProductsSection}>
            <SectionHeading title="Recent Products" />
            {explore.length === 0 ? (
                <section style={{ height: "50vh" }}>
                    <h2>No Products Available</h2>
                    <p>
                        There are currently no products available. Please check
                        back later.
                    </p>
                </section>
            ) : (
                <div className={styles.grid}>
                    {explore.map((exp, key) => {
                        const hasDiscount =
                            exp.variant.originalPrice &&
                            exp.variant.price &&
                            exp.variant.originalPrice > exp.variant.price;
                        const discountPercentage = hasDiscount
                            ? Math.round(
                                  ((exp.variant.originalPrice! -
                                      exp.variant.price!) /
                                      exp.variant.originalPrice!) *
                                      100,
                              )
                            : 0;
                        return (
                            <Card
                                key={key}
                                data={exp}
                                hasDiscount={hasDiscount ? true : false}
                                discountPercentage={discountPercentage}
                                showWishlistButton={false}
                            />
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default RecentProductExplore;
