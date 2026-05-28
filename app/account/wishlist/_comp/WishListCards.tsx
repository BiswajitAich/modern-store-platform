import styles from "@/app/_components/card/Card.module.css";
import Card from "@/app/_components/card/Card";
import { ProductCardDTO } from "@/app/_lib/db/types/product.types";

interface ProductProp {
  wishlist: ProductCardDTO[];
}

const WishListCards = ({ wishlist }: ProductProp) => {
  return (
    <div className={styles.grid}>
      {wishlist.map((wish, k: number) => {
        const variant = wish.variant;
        const hasDiscount =
          variant &&
          variant.originalPrice !== null &&
          variant.price !== null &&
          variant.originalPrice > variant.price;
        const discountPercentage = hasDiscount
          ? Math.round(
            ((variant.originalPrice! - variant.price!) /
              variant.originalPrice!) *
            100
          )
          : 0;
        return (
          <Card
            key={`${wish.id}-${k}`}
            data={wish}
            hasDiscount={hasDiscount}
            discountPercentage={discountPercentage}
            showWishlistButton={true}
          />
        );
      })}
    </div>
  );
};

export default WishListCards;
