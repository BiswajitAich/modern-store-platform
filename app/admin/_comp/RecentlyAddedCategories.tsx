import prisma from "@/lib/prisma";
import styles from "../styles/AdminDashboard.module.css";
import { cacheLife, cacheTag } from "next/cache";

export const fetchRecentCategoryAdmin = async (adminId: string) => {
    "use cache";
    cacheLife("hours");
    cacheTag(`admin-recentCategories-${adminId}`);
    try {
        return prisma.category.findMany({
            where: { adminId },
            take: 5,
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        })
    } catch (error) {
        console.error(error);
        return [];
    }
}


const RecentlyAddedCategories = async ({ adminId }: { adminId: string }) => {
    const recentCategory = await fetchRecentCategoryAdmin(adminId);

    return (
        <>
            {recentCategory.length > 0 ? (
                <ul className={styles.productsList}>
                    {recentCategory.map((cat, index) => (
                        <li key={cat.id} className={styles.productItem}>
                            <div className={styles.productInfo}>
                                <div className={styles.productNumber}>{index + 1}</div>
                                <div className={styles.productDetails}>
                                    <div className={styles.productName}>{cat.name}</div>
                                    <div className={styles.productCategory}>
                                        <span>⌛</span>
                                        {cat.createdAt.toDateString()}
                                    </div>
                                    <div
                                        className={styles.productCategory}
                                        style={{ color: cat.isActive ? "green" : "red" }}
                                    >
                                        {cat.isActive ? "Active" : "Inactive"}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📭</div>
                    <div className={styles.emptyText}>No category added yet</div>
                </div>
            )}
        </>
    );
}

export default RecentlyAddedCategories;