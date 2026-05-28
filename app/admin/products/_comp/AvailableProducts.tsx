"use client";

import { Prisma } from "@/app/generated/prisma/client"; 
import styles from "../../styles/New.module.css";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { deleteProduct, toggleProductStatus } from "../productAction";

type Product = Prisma.ProductGetPayload<{
  select: {
    id: true;
    name: true;
    isActive: true;
    createdAt: true;
    brand: true;
    _count: {
      select: {
        variants: true;
        attributes: true;
      };
    };
  };
}>;

interface AvailableProductsProps {
  products: Product[];
}

const AvailableProducts = ({ products }: AvailableProductsProps) => {
  const [items, setItems] = useState<Product[]>(products);
  const [pendingId, setPendingId] = useState<number | null>(null);

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // const getFirstImage = (images: string[] | string | null) => {
  //   if (!images) return "/placeholder.png";
  //   if (typeof images === "string") {
  //     try {
  //       const parsed = JSON.parse(images);
  //       return Array.isArray(parsed) && parsed.length > 0
  //         ? `/api/image?imageId=${encodeURIComponent(parsed[0])}`
  //         : "/placeholder.png";
  //     } catch {
  //       return `/api/image?imageId=${encodeURIComponent(images)}`;
  //     }
  //   }
  //   return Array.isArray(images) && images.length > 0
  //     ? `/api/image?imageId=${encodeURIComponent(images[0])}`
  //     : "/placeholder.png";
  // };

  if (items.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.emptyStateContainer}>
          <div className={styles.emptyIcon}>📦</div>
          <div className={styles.emptyText}>
            No products found in this category
          </div>
          <p
            className={styles.helperText}
            style={{ marginTop: "var(--spacing-sm)" }}
          >
            Add products to this category to see them listed here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/products" className={styles.backLink}>
          ← Back to products
        </Link>
        <h1 className={styles.title}>Manage Products</h1>
        <p className={styles.subtitle}>
          Manage your product catalog and inventory
        </p>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {/* <th style={{ width: "80px" }}>Image</th> */}
              <th>Name</th>
              <th>Brand</th>
              <th style={{ width: "100px" }}>Variants</th>
              <th style={{ width: "100px" }}>Attributes</th>
              <th style={{ width: "100px" }}>Status</th>
              <th style={{ width: "120px" }}>Created</th>
              <th style={{ width: "300px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((product) => (
              <tr key={product.id}>
                {/* Image */}
                {/* <td>
                  <ProductCarousel images={product.images} />
                </td> */}

                {/* Name */}
                <td>
                  <strong>{product.name}</strong>
                </td>

                {/* Brand */}
                <td>
                  {product.brand ? (
                    <span className={styles.productCount}>{product.brand}</span>
                  ) : (
                    <span className={styles.productCount}>—</span>
                  )}
                </td>

                {/* Variants Count */}
                <td>
                  <span className={styles.productCount}>
                    {product._count?.variants || 0}
                  </span>
                </td>

                {/* Attributes Count */}
                <td>
                  <span className={styles.productCount}>
                    {product._count?.attributes || 0}
                  </span>
                </td>

                {/* Status */}
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      product.isActive ? styles.active : styles.inactive
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Created */}
                <td>
                  <span className={styles.productCount}>
                    {formatDate(product.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                <td>
                  <div className={styles.tableActions}>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className={styles.actionLink}
                    >
                      Edit
                    </Link>
                    <div
                      className={styles.sectionDivider}
                      style={{ margin: "0" }}
                    />
                    <Link
                      href={`/admin/products/${product.id}`}
                      className={styles.actionLink}
                    >
                      Variants / Attributes
                    </Link>

                    <div
                      className={styles.sectionDivider}
                      style={{ margin: "0" }}
                    />
                    <button
                      type="button"
                      className={`${styles.actionButton} ${
                        product.isActive ? styles.danger : ""
                      }`}
                      disabled={pendingId === product.id}
                      onClick={async () => {
                        setPendingId(product.id);
                        const result = await toggleProductStatus(
                          product.id,
                          product.isActive
                        );
                        if (result.success) {
                          setItems((prev) =>
                            prev.map((item) =>
                              item.id === product.id
                                ? { ...item, isActive: !item.isActive }
                                : item
                            )
                          );
                          toast.success(
                            `Product ${
                              product.isActive ? "disabled" : "enabled"
                            } successfully`
                          );
                        } else {
                          toast.error(result.message || "Action failed");
                        }
                        setPendingId(null);
                      }}
                    >
                      {product.isActive ? "Disable" : "Enable"}
                    </button>
                    <div
                      className={styles.sectionDivider}
                      style={{ margin: "0" }}
                    />
                    <button
                      type="button"
                      className={`${styles.actionButton} ${styles.danger}`}
                      disabled={pendingId === product.id}
                      onClick={async () => {
                        setPendingId(product.id);
                        if (
                          !confirm(
                            `Are you sure you want to delete "${product.name}"?`
                          )
                        ) {
                          return;
                        }
                        const result = await deleteProduct(product.id);
                        if (result.success) {
                          setItems((prev) =>
                            prev.filter((item) => item.id !== product.id)
                          );
                          toast.success("Product deleted successfully");
                        } else {
                          toast.error(result.message || "Deletion failed");
                        }
                        setPendingId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AvailableProducts;

// const ProductCarousel = ({ images }: { images: string[] }) => {
//   const [emblaRef] = useEmblaCarousel({ loop: true }, [
//     Autoplay({ delay: 3000 }),
//   ]);

//   return (
//     <div
//       className="embla"
//       ref={emblaRef}
//       style={{
//         maxWidth: "100px",
//         width: "100px",
//         aspectRatio: 3 / 4,
//         boxShadow: "0 0 4px var(--color-primary-dark)",
//         // borderRadius: "var(--spacing-sm)",
//         // marginTop: "8px",
//       }}
//     >
//       <div className="emblaContainer">
//         {images.map((img, idx) => (
//           <div className="emblaSlide" key={idx}>
//             <Image
//               src={`/api/image?imageId=${encodeURIComponent(img)}`}
//               alt=""
//               width={100}
//               height={100}
//               style={{ objectFit: "contain" }}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };
