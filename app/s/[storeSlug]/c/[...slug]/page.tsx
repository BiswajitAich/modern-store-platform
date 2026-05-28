import StoreCategoriesSection from "@/app/s/_comp/storeCategory/StoreCategoriesSection";
import StoreProductsSection from "@/app/s/_comp/storeProduct/StoreProductsSection";
import styles from "../../../_comp/cards/card.module.css";
import Link from "next/link";
import { Suspense } from "react";
import CardSkeleton from "@/app/_components/loaders/CardSkeleton";

interface PagePropSlug {
  params: Promise<{ slug: string[]; storeSlug: string }>;
}

const CategoryPage = async ({ params }: PagePropSlug) => {
  const { slug, storeSlug } = await params;

  return (
    <div>
      <Link href={`/s/${storeSlug}`} className={styles.backLink}>
        ← Back
      </Link>
      <Suspense fallback={<CardSkeleton name="Category" />} >
        <StoreCategoriesSection storeSlug={storeSlug} slugs={slug} />
      </Suspense>
      <Suspense fallback={<CardSkeleton name="Products" />} >
        <StoreProductsSection storeSlug={storeSlug} slugs={slug} />
      </Suspense>
    </div>
  );
};

export default CategoryPage;

// export const generateMetadata = async ({
//   params,
// }: PagePropSlug): Promise<Metadata> => {
//   const { slug } = await params;
//   if (!slug) return {};
//   const cat = await prisma.category.findFirst({
//     where: { slug, isActive: true },
//     select: { name: true, description: true, image: true },
//   });

//   if (!cat) return {};

//   return {
//     title: cat.name,
//     description: cat.description
//       ? cat.description
//       : `Products under ${cat.name} category`,
//     openGraph: {
//       title: cat.name,
//       url: `https://commyfy.vercel.app/c/${slug}`,
//       description: cat.description
//         ? cat.description
//         : `Products under ${cat.name} category`,
//       images: cat.image ? [`/api/image?imageId=${cat.image}`] : [],
//     },
//   };
// };
