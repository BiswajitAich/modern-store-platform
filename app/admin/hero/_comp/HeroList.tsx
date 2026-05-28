"use client";
import styles from "../../styles/New.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { deleteDbHero, updateDbHeroStatus } from "../../_lib/adminDbCallAcrion";

// type Hero = Prisma.HeroBannerGetPayload<{
//   select: {
//     id: true;
//     title: true;
//     image: true;
//     isActive: true;
//     order: true;
//     subtitle: true;
//     createdAt: true;
//   };
// }>;
interface Hero {
  isActive: boolean;
  createdAt: Date;
  id: number;
  title: string;
  sortOrder: number;
  image: string;
  subtitle: string | null;
}
interface HeroDataProp {
  heroData: Hero[];
}

const HeroList = ({ heroData }: HeroDataProp) => {
  const [items, setItems] = useState<Hero[]>(heroData);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleHeroStatus = async (heroId: number, isActive: boolean) => {
    setPendingId(heroId);
    try {
      const response = await updateDbHeroStatus(heroId, !isActive);

      if (!response) {
        throw new Error("Failed to update hero status");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === heroId ? { ...item, isActive: !item.isActive } : item,
        ),
      );

      toast.success(`Hero ${isActive ? "disabled" : "enabled"} successfully`);
    } catch (error) {
      toast.error("Failed to update hero status");
    } finally {
      setPendingId(null);
    }
  };

  const deleteHero = async (heroId: number, heroTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${heroTitle}"?`)) {
      return;
    }

    try {
      const response = await deleteDbHero(heroId);

      if (!response) {
        throw new Error("Failed to delete hero");
      }

      setItems((prev) => prev.filter((item) => item.id !== heroId));
      toast.success("Hero deleted successfully");
    } catch (error) {
      toast.error("Failed to delete hero");
    }
  };

  // Filter and sort heroes
  const filteredItems = items
    .filter((hero) => {
      const matchesSearch =
        hero.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hero.subtitle &&
          hero.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && hero.isActive) ||
        (statusFilter === "inactive" && !hero.isActive);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by status first (active first), then by order
      if (a.isActive !== b.isActive) {
        return a.isActive ? -1 : 1;
      }
      return a.sortOrder - b.sortOrder;
    });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin" className={styles.backLink}>
          ← Back to admin
        </Link>
        <h1 className={styles.title}>Hero Banners</h1>
        <p className={styles.subtitle}>
          Manage homepage hero banners and carousel
        </p>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "var(--spacing-2xl)" }}>
        <Link
          href="/admin/hero/new"
          className={`${styles.button} ${styles.buttonPrimary}`}
          style={{ display: "inline-flex", width: "auto" }}
        >
          <span>+</span> Add Hero Banner
        </Link>
      </div>

      {/* Filters */}
      <div
        style={{
          marginBottom: "var(--spacing-2xl)",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "var(--spacing-md)",
        }}
      >
        {/* Search */}
        <div className={styles.formGroup} style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Search by title or subtitle..."
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

      {/* Hero Table */}
      {filteredItems.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: "100px" }}>Image</th>
                <th style={{ width: "80px" }}>Order</th>
                <th>Title</th>
                <th>Subtitle</th>
                <th style={{ width: "100px" }}>Status</th>
                <th style={{ width: "120px" }}>Created</th>
                <th style={{ width: "280px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((hero) => (
                <tr key={hero.id}>
                  {/* Image */}
                  <td>
                    <Image
                      src={
                        hero.image
                          ? `/api/image?imageId=${encodeURIComponent(
                            hero.image,
                          )}`
                          : "/placeholder.png"
                      }
                      alt={hero.title}
                      width={80}
                      height={45}
                      className={styles.categoryImage}
                      style={{ width: "80px", height: "45px" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </td>

                  {/* Order */}
                  <td>
                    <span
                      className={styles.productCount}
                      style={{
                        fontWeight: 600,
                        fontSize: "var(--font-size-lg)",
                      }}
                    >
                      {hero.sortOrder}
                    </span>
                  </td>

                  {/* Title */}
                  <td>
                    <strong>{hero.title}</strong>
                  </td>

                  {/* Subtitle */}
                  <td>
                    {hero.subtitle ? (
                      <span className={styles.productCount}>
                        {hero.subtitle}
                      </span>
                    ) : (
                      <span className={styles.productCount}>—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td>
                    <span
                      className={`${styles.statusBadge} ${hero.isActive ? styles.active : styles.inactive
                        }`}
                    >
                      {hero.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Created */}
                  <td>
                    <span className={styles.productCount}>
                      {formatDate(hero.createdAt)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className={styles.tableActions}>

                      {/* edit hero */}
                      <Link
                        href={`/admin/hero/${hero.id}`}
                        className={styles.actionLink}
                      >
                        Edit
                      </Link>
                      <span style={{ color: "var(--border-color)" }}>|</span>

                      {/* toggle status */}
                      <button
                        type="button"
                        className={`${styles.actionButton} ${hero.isActive ? styles.danger : ""
                          }`}
                        disabled={pendingId === hero.id}
                        onClick={() => toggleHeroStatus(hero.id, hero.isActive)}
                      >
                        {hero.isActive ? "Disable" : "Enable"}
                      </button>
                      <span style={{ color: "var(--border-color)" }}>|</span>

                      {/* delete hero */}
                      <button
                        type="button"
                        className={`${styles.actionButton} ${styles.danger}`}
                        disabled={pendingId === hero.id}
                        onClick={() => deleteHero(hero.id, hero.title)}
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
            <div className={styles.emptyIcon}>🎨</div>
            <div className={styles.emptyText}>
              {items.length === 0
                ? "No hero banners found"
                : "No hero banners match your filters"}
            </div>
            <p
              className={styles.helperText}
              style={{ marginTop: "var(--spacing-sm)" }}
            >
              {items.length === 0
                ? "Create your first hero banner to showcase on the homepage"
                : "Try adjusting your search or filter criteria"}
            </p>
            {items.length === 0 && (
              <Link
                href="/admin/hero/new"
                className={`${styles.button} ${styles.buttonPrimary}`}
                style={{
                  display: "inline-flex",
                  width: "auto",
                  marginTop: "var(--spacing-lg)",
                }}
              >
                <span>+</span> Add Hero Banner
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
          Showing {filteredItems.length} of {items.length} hero banners
        </div>
      )}
    </div>
  );
};

export default HeroList;
