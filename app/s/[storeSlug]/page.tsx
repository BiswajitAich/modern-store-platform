import StoreProductsSection from "../_comp/storeProduct/StoreProductsSection";
import StoreCategoriesSection from "../_comp/storeCategory/StoreCategoriesSection";
import Hero from "@/app/_components/landing/Hero";
import CardSkeleton from "@/app/_components/loaders/CardSkeleton";
import { Suspense } from "react";
import HeroSkeleton from "@/app/_components/loaders/HeroSkeleton";
import { ErrorBoundary } from "@/app/_components/ErrorBoundary";
import SectionError from "@/app/_components/loaders/SectionError";
import styles from "../../explore/Explore.module.css";
const Storepage = async ({
    params,
}: {
    params: Promise<{ storeSlug: string }>;
}) => {
    const { storeSlug } = await params;

    return (
        <main className={styles.mainContainer}>
            <ErrorBoundary fallback={<SectionError name="Hero Banner" />}>
                <Suspense fallback={<HeroSkeleton />}>
                    <Hero storeSlug={storeSlug} />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<SectionError name="Categories" />}>
                <Suspense
                    fallback={<CardSkeleton name={"Categories"} num={15} />}
                >
                    <StoreCategoriesSection storeSlug={storeSlug} />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<SectionError name="Products" />}>
                <Suspense
                    fallback={<CardSkeleton name={"Products"} num={15} />}
                >
                    <StoreProductsSection storeSlug={storeSlug} />
                </Suspense>
            </ErrorBoundary>
        </main>
    );
};

export default Storepage;
