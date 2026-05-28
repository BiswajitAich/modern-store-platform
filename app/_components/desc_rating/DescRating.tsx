import styles from "./DescRating.module.css";
import { ProductPageSerialized } from "@/app/_lib/db/types/product.types";
const DescRating = ({ productData }: { productData: ProductPageSerialized }) => {
  return (
    <div className={styles.header}>
      {productData.brand && (
        <span className={styles.brand}>{productData.brand}</span>
      )}
      <h1 className={styles.productName}>{productData.name}</h1>
      {/* Attributes */}
      {productData.attributes && productData.attributes.length > 0 && (
        <div className={styles.attributes}>
          {productData.attributes.map((attr) => (
            <span key={attr.id} className={styles.attribute}>
              {attr.key}: {attr.value}
            </span>
          ))}
        </div>
      )}
      {productData.description ? (
        <p>
          {productData.description?.length > 100
            ? productData.description.slice(0, 100) + "..."
            : productData.description}
        </p>
      ) : (
        "No description available."
      )}

      {/* Rating */}
      {productData._count.reviews > 0 ? (
        <div className={styles.ratingContainer}>
          <div className={styles.rating}>
            <span className={styles.ratingValue}>4.5</span>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={styles.star}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={i < 4 ? "currentColor" : "none"}
                  stroke="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
          <span className={styles.reviewCount}>
            1,234 Ratings & 234 Reviews
          </span>
        </div>
      ) : (
        <div className={styles.ratingContainer}>
          <span className={styles.noReviews}>⭐ No reviews yet ⭐</span>
        </div>
      )}
    </div>
  );
};

export default DescRating;
