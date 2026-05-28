import Link from "next/link";
import styles from "../styles/AdminDashboard.module.css";

const QuickAction = () => {
    return (
        <div className={styles.quickActions}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionsGrid}>
                <Link href="/admin/products/new" className={styles.actionCard}>
                    <div className={styles.actionIcon}>➕</div>
                    <div className={styles.actionContent}>
                        <div className={styles.actionTitle}>Add New Product</div>
                        <div className={styles.actionDescription}>
                            Create and configure a new product
                        </div>
                    </div>
                </Link>

                <Link href="/admin/categories/new" className={styles.actionCard}>
                    <div className={styles.actionIcon}>➕</div>
                    <div className={styles.actionContent}>
                        <div className={styles.actionTitle}>Add New Category</div>
                        <div className={styles.actionDescription}>
                            Organize products into categories
                        </div>
                    </div>
                </Link>

                <Link href="/admin/hero/new" className={styles.actionCard}>
                    <div className={styles.actionIcon}>➕</div>
                    <div className={styles.actionContent}>
                        <div className={styles.actionTitle}>Add New Hero</div>
                        <div className={styles.actionDescription}>
                            Organize Hero slides for landing page
                        </div>
                    </div>
                </Link>

                <Link href="/admin/products" className={styles.actionCard}>
                    <div className={styles.actionIcon}>📋</div>
                    <div className={styles.actionContent}>
                        <div className={styles.actionTitle}>Manage Products</div>
                        <div className={styles.actionDescription}>
                            View and edit all products
                        </div>
                    </div>
                </Link>

                <Link href="/admin/categories" className={styles.actionCard}>
                    <div className={styles.actionIcon}>📋</div>
                    <div className={styles.actionContent}>
                        <div className={styles.actionTitle}>Manage Categories</div>
                        <div className={styles.actionDescription}>
                            Edit and organize categories
                        </div>
                    </div>
                </Link>

                <Link href="/admin/hero" className={styles.actionCard}>
                    <div className={styles.actionIcon}>🗂️</div>
                    <div className={styles.actionContent}>
                        <div className={styles.actionTitle}>Manage Hero</div>
                        <div className={styles.actionDescription}>
                            View and edit all Hero Banners
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default QuickAction;