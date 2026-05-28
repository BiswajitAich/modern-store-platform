"use client";

import Link from "next/link";
import { PUIProps } from "../PUIClient";
import styles from "./VariantSection.module.css";
import { buildProductUrl } from "../../utility";
interface VariantSectionProps {
  productData: PUIProps["productData"];
  selectedVariant: PUIProps["productData"]["variants"][number] | null;
  optionsMap: Record<string, string[]>;
  selectedOptions: Record<string, string>;
  slug: string;
  storeSlug: string;
  // setSelectedOptions: React.Dispatch<
  //   React.SetStateAction<Record<string, string>>
  // >;
}
const VariantSection = ({
  productData,
  selectedVariant,
  optionsMap,
  selectedOptions,
  slug,
  storeSlug,
  // setSelectedOptions,
}: VariantSectionProps) => {
  const isDisabled = (key: string, value: string) => {
    return !productData.variants.some((variant) =>
      variant.options.every((opt) =>
        opt.key === key
          ? opt.value === value
          : selectedOptions[opt.key] === opt.value,
      ),
    );
  };
  if (!selectedVariant) {
    return <p>Variant not available</p>;
  }

  return (
    <div className={styles.variantSection}>
      <h2 className={styles.sectionTitle}>Select Variant</h2>
      <div className={styles.variantGrid}>
        {productData.variants.map((variant) => {
          // const nextOptions = variant.options.reduce<Record<string, string>>(
          //   (acc, opt) => {
          //     acc[opt.key] = opt.value;
          //     return acc;
          //   },
          //   {},
          // );

          return (
            <Link
              key={variant.id}
              title={`₹ ${variant.price}`}
              className={`${styles.variantOption} ${selectedVariant?.id === variant.id
                ? styles.variantOptionActive
                : ""
                }`}
              href={buildProductUrl(
                storeSlug,
                slug,
                variant.options,
              )}
              prefetch={false}
              scroll={false}
              style={{
                pointerEvents: selectedVariant?.id === variant.id
                  ? "none"
                  : "auto",
                cursor: "default",
              }}
            >
              <span>₹ {variant.price}</span>
              {variant.sku && <span className={styles.sku}>{variant.sku}</span>}
            </Link>
          );
        })}
      </div>
      {Object.entries(optionsMap).map(([optionKey, values]) => (
        <div key={optionKey} className={styles.optionGroup}>
          <p className={styles.optionLabel}>{optionKey}</p>

          <div className={styles.optionValues}>
            {values.map((value) => {
              const isColor =
                optionKey.toLowerCase() === "color" ||
                optionKey.toLowerCase() === "colour";
              // const nextOptions = {
              //   ...selectedOptions,
              //   [optionKey]: value,
              // };
              // const variantByKey = new Map(
              //   productData.variants.map((variant) => [
              //     generateVariantKey(
              //       Object.fromEntries(
              //         variant.options.map((o) => [
              //           o.key,
              //           o.value,
              //         ])
              //       )
              //     ),
              //     variant,
              //   ])
              // );

              return (
                <Link
                  key={value}
                  title={value.toUpperCase()}
                  className={`${styles.variantOption} ${selectedOptions[optionKey] === value
                    ? styles.variantOptionActive
                    : ""
                    }`}
                  style={{
                    pointerEvents: isDisabled(optionKey, value)
                      ? "none"
                      : "auto",
                    cursor: "default",
                    // opacity: isDisabled(optionKey, value) ? 0.5 : 1,
                    backgroundColor: isColor ? value.toLowerCase() : undefined,
                  }}
                  href={buildProductUrl(
                    storeSlug,
                    slug,
                    [
                      ...Object.entries(selectedOptions)
                        .filter(([key]) => key !== optionKey)
                        .map(([key, val]) => ({ key, value: val })),
                      { key: optionKey, value },
                    ],
                  )}
                  prefetch={false}
                  scroll={false}
                >
                  {isColor ? "" : value}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VariantSection;
