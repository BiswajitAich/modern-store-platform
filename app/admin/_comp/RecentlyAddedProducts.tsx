import prisma from "@/lib/prisma";
import styles from "../styles/AdminDashboard.module.css";
import { cacheLife, cacheTag } from "next/cache";

export const fetchRecentProductsAdmin = async (adminId: string) => {
    "use cache";
    cacheLife("hours");
    cacheTag(`admin-recentProducts-${adminId}`);
    try {
        return prisma.product.findMany({
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

const RecentlyAddedProducts = async ({ adminId }: { adminId: string }) => {
    const recentProducts = await fetchRecentProductsAdmin(adminId);
    return (
        <>
            {recentProducts.length > 0 ? (
                <ul className={styles.productsList}>
                    {recentProducts.map((product, index) => (
                        <li key={product.id} className={styles.productItem}>
                            <div className={styles.productInfo}>
                                <div className={styles.productNumber}>{index + 1}</div>
                                <div className={styles.productDetails}>
                                    <div className={styles.productName}>{product.name}</div>
                                    <div className={styles.productCategory}>
                                        <span>⌛</span>
                                        {product.createdAt.toDateString()}
                                    </div>
                                    <div
                                        className={styles.productCategory}
                                        style={{ color: product.isActive ? "green" : "red" }}
                                    >
                                        {product.isActive ? "Active" : "Inactive"}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📭</div>
                    <div className={styles.emptyText}>No products added yet</div>
                </div>
            )}
        </>
    );
}

export default RecentlyAddedProducts;