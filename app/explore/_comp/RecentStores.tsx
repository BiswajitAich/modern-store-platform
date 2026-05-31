import StoreCard from "@/app/_components/store/StoreCard";
import prisma from "@/lib/prisma";
import { cacheLife, cacheTag } from "next/cache";
import { Suspense } from "react";
import styles from "../Explore.module.css";
import CardSkeleton from "@/app/_components/loaders/CardSkeleton";
import SectionHeading from "@/app/_components/common/SectionHeading";

interface Store {
    id: string;
    storeSlug: string;
    profileImage: string | null;
    productCount: number;
    categoryCount: number;
}

const getRecentStores = async (): Promise<Store[]> => {
    "use cache";
    cacheLife("hours");
    cacheTag("exploreStores")
    // try {
    const stores = await prisma.admin.findMany({
        where: {
            isActive: true,
        },
        select: {
            adminId: true,
            storeSlug: true,
            profileImage: true,

            _count: {
                select: {
                    products: true,
                    categories: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
        take: 12,
    });
    return stores.map((s: { adminId: any; storeSlug: any; profileImage: any; _count: { products: any; categories: any; }; }) => ({
        id: s.adminId,
        storeSlug: s.storeSlug,
        profileImage: s.profileImage,
        productCount: s._count.products,
        categoryCount: s._count.categories,
    }));
    // } catch (error) {
    //     console.error(error);
    //     return [];
    // }
}
const RecentStores = async () => {
    const stores = await getRecentStores();
    if (!stores) return null;
    return (
        <section className={styles.recentProductsSection}>
            <SectionHeading title="Stores" />
            <Suspense fallback={<CardSkeleton />}>
                <div className={styles.grid}>
                    {stores.map((store) => (
                        <StoreCard key={store.id} data={store} />
                    ))}
                </div>
            </Suspense>
        </section>

    );
}

export default RecentStores;