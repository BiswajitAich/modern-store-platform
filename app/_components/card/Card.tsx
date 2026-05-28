import Link from "next/link";
import Image from "next/image";
import styles from "./Card.module.css";
import WishListBtn from "../btns/wishListBtn/WishListBtn";
import { buildProductUrl } from "@/app/s/[storeSlug]/p/utility";
import { ProductCardDTO } from "@/app/_lib/db/types/product.types";

interface CardProps {
  data: ProductCardDTO;
  hasDiscount?: boolean;
  discountPercentage?: number;
  showWishlistButton?: boolean;
}
const Card = ({ data, hasDiscount, discountPercentage, showWishlistButton}: CardProps) => {
  return (
    <div className={styles.card}>
      <Link
        key={data.id}
        href={buildProductUrl(
          data.storeSlug,
          data.slug,
          data.variant.options,
        )}
      >
        <div className={styles.imageWrapper}>
          {data.variant.image ? (
            <Image
              src={
                `/api/image?imageId=${encodeURIComponent(data.variant.image)}`
              }
              alt={data.name}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              className={styles.image}
            />
          ) : (
            <div className={styles.placeholder}>No Image</div>
          )}
          {hasDiscount && (
            <span className={styles.badge}>-{discountPercentage}%</span>
          )}
        </div>
        <div className={styles.content}>
          <p className={styles.storeName}>@{data.storeSlug}</p>
          <h3 className={styles.productName}>{data.name}</h3>

          <div className={styles.priceContainer}>
            <span className={styles.price}>
              &#x20B9;
              {data.variant.price
                ? data.variant.price.toLocaleString()
                : "unknown"}
            </span>
            {hasDiscount && (
              <span className={styles.originalPrice}>
                &#x20B9; {data.variant.originalPrice?.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
      {showWishlistButton && (
        <WishListBtn
          variantId={data.variant.id}
          productId={data.id}
          isLiked={data.isLiked ?? false}
        />
      )}
    </div>
  );
};

export default Card;
