import { CategoryCardDTO } from "@/app/_lib/db/types/category.types";
import styles from "./Card.module.css";
import { buildCategoryPath } from "@/app/s/[storeSlug]/p/utility";
import Link from "next/link";
import Image from "next/image";
interface CategoryCard {
    categories: CategoryCardDTO;
    slugs?: string[];
}
const CatCard = ({ categories, slugs }: CategoryCard) => {
    return (
        <div className={styles.card}>
            <Link
                key={categories.id}
                href={buildCategoryPath(
                    categories.storeSlug,
                    slugs,
                    categories.slug,
                )}
            >
                <div className={styles.imageWrapper}>
                    {categories.image ? (
                        <Image
                            src={
                                `/api/image?imageId=${encodeURIComponent(categories.image)}`
                            }
                            alt={categories.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                            className={styles.image}
                        />
                    ) : (
                        <div className={styles.placeholder}>No Image</div>
                    )}
                </div>
                <div className={styles.content}>
                    <p className={styles.storeName}>@{categories.storeSlug}</p>
                    <h3 className={styles.productName}>{categories.name}</h3>
                    <div className={styles.shopNow}>
                        <span>Shop Now</span>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M6 12L10 8L6 4" />
                        </svg>
                    </div>
                </div>
            </Link>
        </div>
    );
}
export default CatCard;