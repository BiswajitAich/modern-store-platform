"use client";

import Link from "next/link";
import Image from "next/image";

import styles from "../../../../../styles/New.module.css";

interface ProductVariantRaw {
  variants: {
    price: number;
    originalPrice: number | null;
    costPrice: number | null;

    images: {
      id: number;
      sortOrder: number;
      variantId: number;
      image: string;
      isPrimary: boolean;
    }[];

    options: {
      id: number;
      key: string;
      value: string;
      variantId: number;
    }[];

    id: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    productId: number;
    stock: number;
    sku: string | null;
    displayOrder: number;
    lowStockThreshold: number;
    optionHash: string;
  }[];

  id: number;
  name: string;
  brand: string | null;
  isActive: boolean;

  attributes: {
    id: number;
    productId: number;
    key: string;
    value: string;
    displayOrder: number;
  }[];
}

type ProductVariant = Omit<ProductVariantRaw, "variants"> & {
  variants: Array<
    Omit<
      ProductVariantRaw["variants"][number],
      "price" | "originalPrice" | "costPrice"
    > & {
      price: number;
      originalPrice: number | null;
      costPrice: number | null;
    }
  >;
};

export default function EditProductVariants({
  product,
}: {
  product: ProductVariant;
  id: string;
}) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link
          href={`/admin/products/${product.id}`}
          className={styles.backLink}
        >
          ← Back to Product
        </Link>

        <h1 className={styles.title}>
          Edit Product Variants & Attributes
        </h1>

        <p className={styles.subtitle}>
          {product.name}
        </p>
      </div>

      <div className={styles.sectionDivider} />

      {/* Variants */}
      <div className={styles.variantsList}>
        <h2 className={styles.sectionTitle}>
          Variants ({product.variants.length})
        </h2>

        {product.variants.length === 0 ? (
          <div className={styles.emptyState}>
            No variants found
          </div>
        ) : (
          product.variants.map((variant) => (
            <div
              key={variant.id}
              className={styles.variantCard}
            >
              <div className={styles.variantHeader}>
                <div className={styles.variantSku}>
                  {variant.sku || `Variant #${variant.id}`}
                </div>

                <Link
                  href={`/admin/products/${product.id}/edit/variant/${variant.id}`}
                  className={`${styles.buttonSmall} ${styles.buttonPrimary}`}
                >
                  Edit Variant
                </Link>
              </div>

              <div className={styles.variantInfo}>
                <div className={styles.variantInfoItem}>
                  <div className={styles.variantInfoLabel}>
                    Price
                  </div>

                  <div className={styles.variantInfoValue}>
                    ₹
                    {variant.price.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>

                <div className={styles.variantInfoItem}>
                  <div className={styles.variantInfoLabel}>
                    Stock
                  </div>

                  <div className={styles.variantInfoValue}>
                    {variant.stock}
                  </div>
                </div>

                <div className={styles.variantInfoItem}>
                  <div className={styles.variantInfoLabel}>
                    Order
                  </div>

                  <div className={styles.variantInfoValue}>
                    {variant.displayOrder}
                  </div>
                </div>
              </div>

              {variant.options.length > 0 && (
                <div className={styles.variantOptions}>
                  {variant.options.map((option) => (
                    <div
                      key={option.id}
                      className={styles.variantOptionBadge}
                    >
                      {option.key}: {option.value}
                    </div>
                  ))}
                </div>
              )}

              {variant.images.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginTop: "1rem",
                  }}
                >
                  {variant.images.map((image) => (
                    <div
                      key={image.id}
                      style={{
                        width: "70px",
                        height: "70px",
                        position: "relative",
                        borderRadius: "6px",
                        overflow: "hidden",
                        border:
                          "1px solid var(--border-color)",
                      }}
                    >
                      <Image
                        src={`/api/image?imageId=${encodeURIComponent(
                          image.image,
                        )}`}
                        alt="Variant"
                        fill
                        unoptimized
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.sectionDivider} />

      {/* Attributes */}
      <div className={styles.variantsList}>
        <h2 className={styles.sectionTitle}>
          Attributes ({product.attributes.length})
        </h2>

        {product.attributes.length === 0 ? (
          <div className={styles.emptyState}>
            No attributes found
          </div>
        ) : (
          product.attributes.map((attribute) => (
            <div
              key={attribute.id}
              className={styles.variantCard}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div className={styles.variantOptions}>
                  <div className={styles.variantOptionBadge}>
                    {attribute.key}: {attribute.value}
                  </div>
                </div>

                <Link
                  href={`/admin/products/${product.id}/edit/attribute/${attribute.id}`}
                  className={`${styles.buttonSmall} ${styles.buttonPrimary}`}
                >
                  Edit Attribute
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}