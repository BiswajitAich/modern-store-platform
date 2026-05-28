import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import styles from "../styles/AdminDashboard.module.css";

const fetchTotalCountsAdmin = async (adminId: string) => {
    "use cache";
    cacheLife("hours");
    cacheTag(`admin-counts-${adminId}`);
    try {
        return Promise.all([
            prisma.product.count({ where: { adminId } }),
            prisma.category.count({ where: { adminId } }),
            prisma.productVariant.count({
                where: {
                    product: { adminId },
                },
            }),
            prisma.heroBanner.count({ where: { adminId } }),
        ]);

    } catch (error) {
        console.error(error);
        return [];
    }
}

const CountingStatus = async ({ adminId }: { adminId: string }) => {
    const [totalProducts, totalCategories, recentProductVarient, totalHero] = await fetchTotalCountsAdmin(adminId);
    return (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statLabel}>Total Products</div>
                <div className={styles.statValue}>{totalProducts ?? "UnAvailable"}</div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statLabel}>Categories</div>
                <div className={styles.statValue}>{totalCategories ?? "UnAvailable"}</div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statLabel}>Product Variants</div>
                <div className={styles.statValue}>
                    {recentProductVarient ?? "UnAvailable"}
                </div>
            </div>

            <div className={`${styles.statCard} ${styles.warning}`}>
                <div className={styles.statLabel}>Hero Count</div>
                <div className={styles.statValue}>{totalHero ?? "UnAvailable"}</div>
            </div>
        </div>
    );
}

export default CountingStatus;