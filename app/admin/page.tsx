import styles from "./styles/AdminDashboard.module.css";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import QuickAction from "./_comp/QuickAction";
import CountingStatus from "./_comp/CountingStatus";
import RecentlyAddedProducts from "./_comp/RecentlyAddedProducts";
import CardSkeleton from "../_components/loaders/CardSkeleton";
import RecentlyAddedCategories from "./_comp/RecentlyAddedCategories";


export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "admin") {
    redirect("/");
  }
  const adminId = session.user.id;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.subtitle}>
          Manage your products, categories, and inventory
        </p>
      </div>

      <Suspense fallback={<div style={{ minHeight: "400px", padding: "--spacing-lg" }}>Loading counting status...</div>}>
        <CountingStatus adminId={adminId} />
      </Suspense>
      <QuickAction />

      <div className={styles.recentSectionContainer}>
        {/* Recent Products */}
        <div className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Recently Added Products</h2>
          <Suspense fallback={<CardSkeleton num={3} />}>
            <RecentlyAddedProducts adminId={adminId} />
          </Suspense>
        </div>

        {/* Categories Products */}
        <div className={styles.recentSection}>
          <h2 className={styles.sectionTitle}>Recently Added Categories</h2>
          <Suspense fallback={<CardSkeleton num={3} />}>
            <RecentlyAddedCategories adminId={adminId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
// export const revalidate = 10;
