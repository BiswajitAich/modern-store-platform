"use client";
// import { ProductPage } from "@/app/_lib/types";
import { Suspense, useEffect, useState } from "react";
import styles from "./PUIClient.module.css";
import BuyNowBtn from "@/app/_components/btns/buyNowBtn.addToCartBtn/BuyNowBtn";
import AddReviewBtn from "@/app/_components/btns/addReviewBtn/AddReviewBtn";
import { ProductPageSerialized } from "@/app/_lib/db/types/product.types";
import AddToCartBtn from "@/app/_components/btns/buyNowBtn.addToCartBtn/AddToCartBtn";

export interface PUIProps {
  productData: ProductPageSerialized;
  children?: React.ReactNode;
  selectedVariant?: ProductPageSerialized["variants"][number] | null;
  isAuthenticated?: boolean;
  paramsToReplaceForDefault: string | undefined
}

const PUIClient = ({
  productData,
  selectedVariant,
  isAuthenticated,
  children,
  paramsToReplaceForDefault,
}: PUIProps) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description",
  );
  useEffect(() => {
    if (paramsToReplaceForDefault) {
      const url = new URL(window.location.href);
      url.search = paramsToReplaceForDefault;
      window.history.replaceState(null, "", url.toString());
    }
  }, [paramsToReplaceForDefault]);

  const handleQuantityChange = (action: "increment" | "decrement") => {
    if (action === "increment" && quantity < (selectedVariant?.stock || 0)) {
      setQuantity(quantity + 1);
    } else if (action === "decrement" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };


  return (
    <>
      {/* Quantity Selector */}
      <div className={styles.quantitySection}>
        <h2 className={styles.sectionTitle}>Quantity</h2>
        <div className={styles.quantitySelector}>
          <button
            className={styles.quantityBtn}
            onClick={() => handleQuantityChange("decrement")}
            disabled={quantity <= 1}
          >
            −
          </button>
          <span className={styles.quantityValue}>{quantity}</span>
          <button
            className={styles.quantityBtn}
            onClick={() => handleQuantityChange("increment")}
            disabled={quantity >= (selectedVariant?.stock || 0)}
          >
            +
          </button>
        </div>
        {selectedVariant && (
          <span className={styles.stockInfo}>
            {selectedVariant.stock > 10
              ? "In Stock"
              : `Only ${selectedVariant.stock} left`}
          </span>
        )}
      </div>
      {/* Tabs Section */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabButtons}>
          <button
            className={`${styles.tabButton} ${activeTab === "description" ? styles.tabButtonActive : ""
              }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "reviews" ? styles.tabButtonActive : ""
              }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({productData._count.reviews})
          </button>
        </div>

        <div className={styles.tabContent}>
          {activeTab === "description" ? (
            <div className={styles.descriptionContent}>
              <h2 className={styles.contentTitle}>Product Description</h2>
              <p className={styles.description}>
                {productData.description || "No description available."}
              </p>
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

              {/* Specifications */}
              <h3 className={styles.specsTitle}>Specifications</h3>
              <div className={styles.specsGrid}>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Brand</span>
                  <span className={styles.specValue}>
                    {productData.brand || "N/A"}
                  </span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>SKU</span>
                  <span className={styles.specValue}>
                    {selectedVariant?.sku || "N/A"}
                  </span>
                </div>
                <div className={styles.specItem}>
                  <span className={styles.specLabel}>Last Updated</span>
                  <span className={styles.specValue}>
                    {productData.updatedAt}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.reviewsContent}>
              <div className={styles.reviewsHeader}>
                <h2 className={styles.contentTitle}>Customer Reviews</h2>
                <AddReviewBtn productId={productData.id} />
              </div>

              {/* Reviews */}
              {productData._count.reviews === 0 ? (
                <p>No reviews yet. Be the first to review!</p>
              ) : (
                <>{children}</>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Action Buttons */}
      <div className={styles.actionButtons}>
          <AddToCartBtn />
          <BuyNowBtn
            selectedVariant={selectedVariant}
            quantity={quantity}
            isAuthenticated={isAuthenticated}
            productData={productData}
          />
      </div>
    </>
  );
};

export default PUIClient;
