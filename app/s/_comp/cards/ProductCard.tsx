// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import styles from "./card.module.css";
// import { ProductStorepageProp } from "@/app/_lib/types";
// interface CardAProps {
//   products: ProductStorepageProp[];
//   storeSlug: string;
// }

// const ProductCard = ({ products, storeSlug }: CardAProps) => {
//   if (!products || products.length === 0) {
//     return (
//       <div className={styles.emptyState}>
//         <div className={styles.emptyIcon}>📂</div>
//         <p className={styles.emptyText}>No Featured Products available now</p>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.categoriesWrapper}>
//       <div className={styles.categoriesGrid}>
//         {products.map((product) => (
//           <Link
//             key={product.id}
//             href={`/s/${storeSlug}/p/${product.slug}`}
//             className={styles.categoryCard}
//           >
//             <div className={styles.imageWrapper}>
//               <Image
//                 src={
//                   product.variants[0]?.images[0]?.image
//                     ? `/api/image?imageId=${encodeURIComponent(
//                         product.variants[0]?.images[0]?.image
//                       )}`
//                     : "/placeholder.png"
//                 }
//                 alt={product.name}
//                 fill
//                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                 className={styles.categoryImage}
//                 onError={(e) => {
//                   (e.target as HTMLImageElement).src = "/placeholder.png";
//                 }}
//               />
//               <div className={styles.overlay} />
//             </div>

//             <div className={styles.categoryContent}>
//               <h3 className={styles.categoryName}>{product.name}</h3>
//               {/* <span>{product.variants[0]?.price}</span>
//               {product.variants[0]?.originalPrice && (
//                 <span style={{ textDecoration: "line-through" }}>
//                   {product.variants[0]?.originalPrice}
//                 </span>
//               )} */}
//               <div className={styles.shopNow}>
//                 <span>Shop Now</span>
//                 <svg
//                   width="16"
//                   height="16"
//                   viewBox="0 0 16 16"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 >
//                   <path d="M6 12L10 8L6 4" />
//                 </svg>
//               </div>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ProductCard;
