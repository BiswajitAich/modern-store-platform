import styles from "./Price.module.css";
const Price = ({
  price,
  originalPrice,
}: {
  price: number;
  originalPrice: number;
}) => {
  return (
    <div className={styles.priceSection}>
      <div className={styles.priceRow}>
        <span className={styles.currentPrice}>₹{price}</span>

        <span className={styles.originalPrice}>₹{originalPrice}</span>
        {originalPrice > price && (
          <span className={styles.discount}>
            {Math.round(
              ((Number(originalPrice) - Number(price)) /
                Number(originalPrice)) *
                100,
            )}
            % off
          </span>
        )}
      </div>

      <p className={styles.tax}>Inclusive of all taxes</p>
    </div>
  );
};

export default Price;
