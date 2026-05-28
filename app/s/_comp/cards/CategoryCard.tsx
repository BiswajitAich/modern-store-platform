// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import styles from "./card.module.css";
// import { StoreCategoriesSectionProps } from "../StoreCategoriesSection";
// // import { CategoryWithPath } from "../StoreCategoriesSection";

// // interface CardAProps {
// //   categories: CategoryWithPath[];
// //   storeSlug: string;
// // }

// // function flattenCategories(categories: CategoryWithPath[]): CategoryWithPath[] {
// //   return categories.flatMap((cat) => [
// //     cat,
// //     ...flattenCategories(cat.children || []),
// //   ]);
// // }

// const CategoryCard = ({
//   categories,
//   storeSlug,
//   baseSlug,
// }: StoreCategoriesSectionProps) => {
//   if (!categories || categories.length === 0) {
//     return (
//       <div className={styles.emptyState}>
//         <div className={styles.emptyIcon}>📂</div>
//         <p className={styles.emptyText}>No categories available</p>
//       </div>
//     );
//   }

//   // categories = flattenCategories(categories);
//   return (
//     <div className={styles.categoriesWrapper}>
//       <div className={styles.categoriesGrid}>
//         {categories.map((category) => {
//           const path = baseSlug
//             ? [...baseSlug, category.slug].join("/")
//             : category.slug;
//           return (
//             <Link
//               key={category.id}
//               href={`/s/${storeSlug}/c/${path}`}
//               className={styles.categoryCard}
//             >
//               <div className={styles.imageWrapper}>
//                 <Image
//                   src={
//                     category.image
//                       ? `/api/image?imageId=${encodeURIComponent(
//                           category.image
//                         )}`
//                       : "/placeholder.png"
//                   }
//                   alt={category.name}
//                   fill
//                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                   className={styles.categoryImage}
//                   onError={(e) => {
//                     (e.target as HTMLImageElement).src = "/placeholder.png";
//                   }}
//                 />
//                 <div className={styles.overlay} />
//               </div>

//               <div className={styles.categoryContent}>
//                 <h3 className={styles.categoryName}>{category.name}</h3>

//                 <div className={styles.shopNow}>
//                   <span>Shop Now</span>
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 16 16"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M6 12L10 8L6 4" />
//                   </svg>
//                 </div>
//               </div>
//             </Link>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default CategoryCard;
