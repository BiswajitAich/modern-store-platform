"use client";

import { CategoryPage } from "@/app/_lib/types";
import Image from "next/image";
import Link from "next/link";
import styles from "./CUI.module.css";

interface CategoryPageData {
  category: CategoryPage;
}

const CUI = ({ category }: CategoryPageData) => {
  const { name, products } = category;
  console.log(category);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{name}</h1>
        <p className={styles.productCount}>
          {products.length} {products.length === 1 ? "Product" : "Products"}
        </p>
      </div>

      {products.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            No products available in this category
          </p>
        </div>
      ) : (
        <div className={styles.productGrid}>
          {products.map((product) => {
            const price = new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(Number(product.price));

            return (
              <Link
                key={product.id}
                href={`/p/${product.slug}`}
                className={styles.productCard}
              >
                <div className={styles.imageWrapper}>
                  <Image
                    src={`/api/image?imageId=${encodeURIComponent(product.image)}`}
                    alt={product.name}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="/blur.webp"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.productImage}
                    priority={false}
                    fill
                  />
                </div>

                <div className={styles.productInfo}>
                  <h2 className={styles.productName}>{product.name}</h2>
                  <p className={styles.productPrice}>{price}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CUI;
