import ProductList from "./_comp/ProductList";
import styles from "../styles/New.module.css";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { categoryAdminListQuery } from "@/app/_lib/db/queries/category.query";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import { cacheTag, cacheLife } from "next/cache";

const getCategoryListPageData = async (adminId: string) => {
    "use cache";
    cacheTag(`admin-categories-${adminId}`);
    cacheLife("minutes");
    try {
        return await prisma.category.findMany({
            where: {
                adminId,
            },
            ...categoryAdminListQuery,
            orderBy: {
                createdAt: "desc",
            },
            // take: 10,
        });
    } catch (error) {
        // console.error(error);
        // return [];
        throw new Error("Error Fetching the data! - getCategoryListPageData");
    }
};

const ProductListPage = async () => {
    const admin = await getAuthenticatedAdmin();
    const initialProducts = await getCategoryListPageData(admin.id);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href="/admin" className={styles.backLink}>
                    ← Back to admin
                </Link>
                <h1 className={styles.title}>Manage Categories</h1>
                <p className={styles.subtitle}>
                    Manage your product catalog and inventory
                </p>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: "var(--spacing-2xl)" }}>
                <Link
                    href="/admin/products/new"
                    className={`${styles.button} ${styles.buttonPrimary}`}
                    style={{ display: "inline-flex", width: "auto" }}
                >
                    <span>+</span> Add Product
                </Link>
            </div>
            <ProductList categories={initialProducts} />
        </div>
    );
};
export default ProductListPage;

// export const revalidate = 600;
