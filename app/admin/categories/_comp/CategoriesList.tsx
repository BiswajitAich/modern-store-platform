"use client";

import Link from "next/link";
import styles from "../../styles/New.module.css";
import Image from "next/image";
import { toggleCategoryStatus } from "../categoriesAction";
import { useState } from "react";
import { toast } from "sonner";
import { CategoryAdminListData } from "@/app/_lib/db/queries/category.query";

const CategoriesList = ({ categories }: { categories: CategoryAdminListData[] }) => {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [items, setItems] = useState<CategoryAdminListData[]>(categories);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin" className={styles.backLink}>
          ← Back to admin
        </Link>
        <h1 className={styles.title}>Categories</h1>
        <p className={styles.subtitle}>
          Manage product categories and subcategories
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <Link
          href="/admin/categories/new"
          className={`${styles.button} ${styles.buttonPrimary}`}
          style={{ display: "inline-flex", width: "auto" }}
        >
          <span>+</span> Add New Category
        </Link>
      </div>

      {/* Categories Table */}
      {items.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent/id</th>
                <th>Status</th>
                <th style={{ width: "100px" }}>Products</th>
                <th style={{ width: "200px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((category: CategoryAdminListData) => (
                <tr key={category.id}>
                  {/* Image */}
                  <td>
                    <Image
                      src={
                        category.image
                          ? `/api/image?imageId=${encodeURIComponent(
                            category.image
                          )}`
                          : "/placeholder.png"
                      }
                      alt={category.name}
                      width={48}
                      height={48}
                      className={styles.categoryImage}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                      style={{ objectFit: "contain" }}
                    />
                  </td>

                  {/* Name */}
                  <td>
                    <strong>{category.name}</strong>
                  </td>

                  {/* Slug */}
                  <td>
                    <span className={styles.productCount}>{category.slug}</span>
                  </td>

                  {/* Parent */}
                  <td>
                    {category.parent ? (
                      <span className={styles.productCount}>
                        {category.parent.name} / {category.parent.id}
                      </span>
                    ) : (
                      <span className={styles.productCount}>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`${styles.statusBadge} ${category.isActive ? styles.active : styles.inactive
                        }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Product Count */}
                  <td>
                    <span className={styles.productCount}>
                      {category._count?.products || 0}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className={styles.tableActions}>
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className={styles.actionLink}
                      >
                        Edit
                      </Link>
                      <span style={{ color: "var(--border-color)" }}>|</span>
                      <button
                        type="button"
                        className={`${styles.actionButton} ${category.isActive ? styles.danger : ""
                          }`}
                        disabled={pendingId === category.id}
                        onClick={async () => {
                          setPendingId(category.id);
                          try {
                            const result = await toggleCategoryStatus(
                              category.id,
                              category.isActive
                            );

                            if (!result.success) {
                              toast.error(
                                result.error ||
                                "Failed to update category status"
                              );
                              return;
                            }

                            setItems((prev) =>
                              prev.map((item) =>
                                item.id === category.id
                                  ? { ...item, isActive: !item.isActive }
                                  : item
                              )
                            );
                          } finally {
                            toast.success(
                              `Category ${category.isActive ? "disabled" : "enabled"
                              } successfully`
                            );
                            setPendingId(null);
                          }
                        }}
                      >
                        {category.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyText}>No categories found</div>
            <p
              className={styles.helperText}
              style={{ marginTop: "var(--spacing-sm)" }}
            >
              Get started by creating your first category
            </p>
            <Link
              href="/admin/categories/new"
              className={`${styles.button} ${styles.buttonPrimary}`}
              style={{
                display: "inline-flex",
                width: "auto",
                marginTop: "var(--spacing-lg)",
              }}
            >
              <span>+</span> Add New Category
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesList;
