"use client";

import Link from "next/link";
import styles from "../../styles/New.module.css";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { toggleCategoryStatus, deleteCategory } from "../../categories/categoriesAction";
import { CategoryAdminListData } from "@/app/_lib/db/queries/category.query";

const ProductList = ({
  categories,
}: {
  categories: CategoryAdminListData[];
}) => {
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [items, setItems] = useState<CategoryAdminListData[]>(categories);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter products
  const filteredItems = items.filter((product) => {
    const matchesSearch = product.name.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && product.isActive) ||
      (statusFilter === "inactive" && !product.isActive);

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateInput: Date) => {
    const date = new Date(dateInput);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Filters */}
      <div
        style={{
          marginBottom: "var(--spacing-2xl)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--spacing-md)",
        }}
      >
        {/* Search */}
        <div className={styles.formGroup} style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Search category..."
            className={styles.input}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className={styles.formGroup} style={{ marginBottom: 0 }}>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      {filteredItems.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Image</th>
                <th>Category Name</th>
                <th>Child Category Count</th>
                <th>Product Count</th>
                <th>Status</th>
                <th style={{ width: "150px" }}>Created</th>
                <th style={{ width: "150px" }}>Updated</th>
                <th style={{ width: "350px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((cat) => (
                <tr key={cat.id}>
                  {/* Thumbnail */}
                  <td>
                    <Image
                      src={
                        cat.image
                          ? `/api/image?imageId=${encodeURIComponent(
                            cat.image,
                          )}`
                          : "/placeholder.png"
                      }
                      alt={cat.name}
                      width={48}
                      height={48}
                      className={styles.categoryImage}
                    />
                  </td>

                  {/* Product Name */}
                  <td>
                    <div>
                      <strong>{cat.name}</strong>
                    </div>
                  </td>

                  {/* count Categories */}
                  <td>
                    <span>
                      {cat._count.children}
                    </span>
                  </td>

                  {/* count Products */}
                  <td>
                    {cat._count ? (
                      <span className={styles.productCount}>
                        {cat._count.products}
                      </span>
                    ) : (
                      <span className={styles.productCount}>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`${styles.statusBadge} ${cat.isActive ? styles.active : styles.inactive
                        }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Created */}
                  <td>
                    <span className={styles.productCount}>
                      {formatDate(cat.createdAt)}
                    </span>
                  </td>

                  {/* Updated */}
                  <td>
                    <span className={styles.productCount}>
                      {formatDate(cat.updatedAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className={styles.tableActions}>
                      <Link
                        href={`/admin/categories/${cat.id}`}
                        className={styles.actionLink}
                      >
                        Edit
                      </Link>
                      <div
                        className={styles.sectionDivider}
                        style={{ margin: "0" }}
                      />
                      <Link
                        href={`/admin/products/category/${cat.id}`}
                        className={styles.actionButton}
                      >
                        ↳ View Products
                      </Link>
                      <div
                        className={styles.sectionDivider}
                        style={{ margin: "0" }}
                      />
                      <button
                        type="button"
                        className={`${styles.actionButton} ${cat.isActive ? styles.danger : ""
                          }`}
                        disabled={pendingId === cat.id}
                        onClick={async () => {
                          setPendingId(cat.id);
                          try {
                            const result = await toggleCategoryStatus(
                              cat.id,
                              cat.isActive,
                            );
                            if (!result.success) {
                              toast.error(
                                result.error ||
                                "Failed to update Category status",
                              );
                              return;
                            }

                            setItems((prev) =>
                              prev.map((item) =>
                                item.id === cat.id
                                  ? { ...item, isActive: !item.isActive }
                                  : item,
                              ),
                            );

                            toast.success(
                              `Category ${cat.isActive ? "disabled" : "enabled"
                              } successfully`,
                            );
                          } catch (error) {
                            toast.error("An error occurred");
                          } finally {
                            setPendingId(null);
                          }
                        }}
                      >
                        {cat.isActive ? "Disable" : "Enable"}
                      </button>
                      <div
                        className={styles.sectionDivider}
                        style={{ margin: "0" }}
                      />
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.danger}`}
                        disabled={pendingId === cat.id}
                        onClick={async () => {
                          if (
                            confirm(
                              `Are you sure you want to delete "${cat.name}"?`,
                            )
                          ) {
                            if (cat._count.children > 0 || cat._count.products > 0) {
                              toast.error("Delete child categories and Products first");
                              return;
                            }
                            const res = await deleteCategory(cat.id)
                            if (!res.success) {
                              toast.error(res.error);
                            } else {
                              toast.success(`Successfully Deleted category '${cat.name}'!`)
                            }
                          }
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
      ) : (
        <div className={styles.tableWrapper}>
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyIcon}>📦</div>
            <div className={styles.emptyText}>
              {items.length === 0
                ? "No products found"
                : "No products match your filters"}
            </div>
            <p
              className={styles.helperText}
              style={{ marginTop: "var(--spacing-sm)" }}
            >
              {items.length === 0
                ? "Get started by adding your first product"
                : "Try adjusting your search or filter criteria"}
            </p>
            {items.length === 0 && (
              <Link
                href="/admin/products/new"
                className={`${styles.button} ${styles.buttonPrimary}`}
                style={{
                  display: "inline-flex",
                  width: "auto",
                  marginTop: "var(--spacing-lg)",
                }}
              >
                <span>+</span> Add Product
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {filteredItems.length > 0 && (
        <div
          style={{
            marginTop: "var(--spacing-lg)",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          Showing {filteredItems.length} of {items.length} products
        </div>
      )}
    </>
  );
};

export default ProductList;
