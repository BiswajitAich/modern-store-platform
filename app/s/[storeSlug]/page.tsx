import StoreProductsSection from "../_comp/storeProduct/StoreProductsSection";
import StoreCategoriesSection from "../_comp/storeCategory/StoreCategoriesSection";
import Hero from "@/app/_components/landing/Hero";
import CardSkeleton from "@/app/_components/loaders/CardSkeleton";
import { Suspense } from "react";
import HeroSkeleton from "@/app/_components/loaders/HeroSkeleton";

const Storepage = async ({
  params,
}: {
  params: Promise<{ storeSlug: string }>;
}) => {
  const { storeSlug } = await params;

  return (
    <>
      <Suspense fallback={<HeroSkeleton />} >
        <Hero storeSlug={storeSlug} />
      </Suspense>
      <Suspense fallback={<CardSkeleton name={"Categories"} num={15} />} >
        <StoreCategoriesSection storeSlug={storeSlug} />
      </Suspense>
      <Suspense fallback={<CardSkeleton name={"Products"} num={15} />} >
        <StoreProductsSection storeSlug={storeSlug} />
      </Suspense>
    </>
  );
};

export default Storepage;
