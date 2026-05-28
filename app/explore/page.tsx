import RecentProductExplore from "./_comp/RecentsProducts";
import RecentCategoriesExplore from "./_comp/RecentCategories";
import styles from "./Explore.module.css";
import RecentHero from "./_comp/RecentHero";
import RecentStores from "./_comp/RecentStores";
import { Suspense } from "react";
import HeroSkeleton from "../_components/loaders/HeroSkeleton";
import CardSkeleton from "../_components/loaders/CardSkeleton";

const ExplorePage = async () => {

  return (
    <div>
      <main className={styles.mainContainer}>
        <Suspense fallback={<HeroSkeleton />}>
          <RecentHero />
        </Suspense>
        <Suspense fallback={<CardSkeleton name="Loading Stores" num={5} />} >
          <RecentStores />
        </Suspense>
        <Suspense fallback={<CardSkeleton name="Loading Categories" num={10} />} >
          <RecentCategoriesExplore />
        </Suspense>
        <Suspense fallback={<CardSkeleton name="Loading Product" num={10} />} >
        <RecentProductExplore />
        </Suspense>
      </main>
    </div >
  );
};

export default ExplorePage;

