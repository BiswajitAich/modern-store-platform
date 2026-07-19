import RecentProductExplore from "./_comp/RecentsProducts";
import RecentCategoriesExplore from "./_comp/RecentCategories";
import styles from "./Explore.module.css";
import RecentHero from "./_comp/RecentHero";
import RecentStores from "./_comp/RecentStores";
import { Suspense } from "react";
import HeroSkeleton from "../_components/loaders/HeroSkeleton";
import CardSkeleton from "../_components/loaders/CardSkeleton";
import { ErrorBoundary } from "../_components/ErrorBoundary";
import SectionError from "../_components/loaders/SectionError";

const ExplorePage = async () => {
    return (
        <main className={styles.mainContainer}>
            <ErrorBoundary fallback={<SectionError name="Hero Banner" />}>
                <Suspense fallback={<HeroSkeleton />}>
                    <RecentHero />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<SectionError name="Stores" />}>
                <Suspense
                    fallback={<CardSkeleton name="Loading Stores" num={5} />}
                >
                    <RecentStores />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<SectionError name="Categories" />}>
                <Suspense
                    fallback={
                        <CardSkeleton name="Loading Categories" num={10} />
                    }
                >
                    <RecentCategoriesExplore />
                </Suspense>
            </ErrorBoundary>
            <ErrorBoundary fallback={<SectionError name="Products" />}>
                <Suspense
                    fallback={<CardSkeleton name="Loading Product" num={10} />}
                >
                    <RecentProductExplore />
                </Suspense>
            </ErrorBoundary>
        </main>
    );
};

export default ExplorePage;
