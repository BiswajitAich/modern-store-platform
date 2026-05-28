"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "../../styles/New.module.css";
import { CategoryEdit } from "@/app/_lib/types";
import { deleteCategory, updateCategoryAction } from "../categoriesAction";
import { toast } from "sonner";
import { CategoryTreeNode } from "@/app/_lib/db/queries/buildTree";
import { flattenCategories } from "@/app/_lib/serializer";

const EditCategory = ({
  category,
  allCategories,
}: {
  category: CategoryEdit;
  allCategories: CategoryTreeNode[];
}) => {
  const router = useRouter();
  const flatCategories = flattenCategories(allCategories || []);
  
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    parentId: string;
    isActive: boolean;
    sortOrder: string;
    description: string;
  }>({
    name: category.name,
    slug: category.slug,
    parentId: category.parentId?.toString() || "",
    isActive: category.isActive,
    sortOrder: category.sortOrder.toString() || "",
    description: category.description || "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(
    category.image
      ? `/api/image?imageId=${encodeURIComponent(category.image)}`
      : null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState<boolean>(false);
  const [slugChanged, setSlugChanged] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [pendingDelete, setPendingDelete] = useState<boolean>(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value;
    setFormData({ ...formData, slug: newSlug });
    if (newSlug !== category.slug) {
      setSlugChanged(true);
    } else {
      setSlugChanged(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("parentId", formData.parentId);
      data.append("isActive", formData.isActive.toString());
      data.append("sortOrder", formData.sortOrder.toString());
      data.append("removeImage", removeImage.toString());

      if (imageFile) {
        data.append("image", imageFile);
      }

      const res = await updateCategoryAction(category.id, data);
      if (res?.error) toast.error(res?.error);
      if (res?.success) {
        router.push("/admin/categories");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setPendingDelete(true);
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setPendingDelete(false);
      return;
    }

    try {
      await deleteCategory(category.id);

      // router.push("/admin/categories");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
      setPendingDelete(false);
    } finally {
      toast.success("Category deleted successfully");
      router.push("/admin/categories");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/categories" className={styles.backLink}>
          ← Back to Categories
        </Link>
        <h1 className={styles.title}>Edit Category</h1>
        <p className={styles.subtitle}>
          Update category information and settings
        </p>
      </div>

      <div className={styles.formWrapper}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Category Name */}
          <div className={styles.formGroup}>
            <label htmlFor="category-name" className={styles.label}>
              Category Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="category-name"
              name="category-name"
              className={styles.input}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g., Gold Rings"
              required
            />
            <p className={styles.helperText}>The name displayed to customers</p>
          </div>

          {/* Slug */}
          <div className={styles.formGroup}>
            <label htmlFor="category-slug" className={styles.label}>
              Slug <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="category-slug"
              name="category-slug"
              className={styles.input}
              value={formData.slug}
              onChange={handleSlugChange}
              placeholder="e.g., gold-rings"
              required
            />
            {slugChanged && (
              <p className={styles.errorText}>
                ⚠️ Warning: Changing the slug may affect SEO and existing links
              </p>
            )}
            <p className={styles.helperText}>
              URL-friendly version (e.g., gold-rings)
            </p>
          </div>

          {/* Parent Category */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Parent Category</label>
            <select
              className={styles.select}
              value={formData.parentId}
              onChange={(e) =>
                setFormData({ ...formData, parentId: e.target.value })
              }
            >
              <option value="">None (Top Level)</option>
              {flatCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
            <p className={styles.helperText}>
              Select a parent to make this a subcategory
            </p>
          </div>

          {/* Sort Order */}
          <div className={styles.formGroup}>
            <label htmlFor="sortOrder" className={styles.label}>
              Sort Order
            </label>
            <input
              id="sortOrder"
              name="sortOrder"
              type="number"
              className={styles.input}
              value={formData.sortOrder}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sortOrder: e.target.value ? e.target.value : "",
                })
              }
              placeholder="Leave empty to add at the end"
              min="0"
            />
            <p className={styles.helperText}>
              Lower numbers appear first (0 = highest priority)
            </p>
          </div>

          {/* Category Image */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Category Image</label>

            {imagePreview ? (
              <div className={styles.imagePreview}>
                <Image
                  src={imagePreview}
                  alt="Category preview"
                  width={300}
                  height={200}
                  className={styles.previewImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className={styles.removeImage}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div
                className={styles.imageUploadArea}
                onClick={() => document.getElementById("imageInput")?.click()}
              >
                <div className={styles.uploadIcon}>📷</div>
                <p className={styles.uploadText}>
                  Click to upload or drag and drop
                </p>
                <p className={styles.uploadHint}>PNG, JPG or WEBP (max. 2MB)</p>
              </div>
            )}

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={styles.fileInput}
            />

            {imagePreview && !removeImage && (
              <button
                type="button"
                onClick={() => document.getElementById("imageInput")?.click()}
                className={`${styles.button} ${styles.buttonSecondary}`}
                style={{
                  marginTop: "var(--spacing-md)",
                  width: "auto",
                  display: "inline-flex",
                }}
              >
                Replace Image
              </button>
            )}
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => {
                if (e.target.value.length >= 500) return;
                setFormData({
                  ...formData,
                  description: e.target.value.replace(/\s+/g, " "),
                });
              }}
              className={styles.input}
              placeholder="e.g., A variety of beautiful rings..."
              rows={4}
              disabled={pendingDelete}
              style={{ resize: "vertical", minHeight: "100px" }}
            />
            <p className={styles.helperText}>
              Optional: Detailed product description
            </p>
          </div>

          {/* Status Toggle */}
          <div className={styles.formGroup}>
            <label htmlFor="label" className={styles.label}>
              Status
            </label>
            <div className={styles.toggleWrapper}>
              <label className={styles.toggle}>
                <input
                  id="label"
                  name="label"
                  type="checkbox"
                  className={styles.toggleInput}
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  disabled={isSubmitting}
                />
                <span className={styles.toggleSlider}></span>
              </label>
              <span className={styles.toggleLabel}>
                {formData.isActive
                  ? "Active (Visible in store)"
                  : "Inactive (Hidden from store)"}
              </span>
            </div>
            <p className={styles.helperText}>
              Inactive categories are hidden but not deleted
            </p>
          </div>

          {/* Category Info */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Category Information</label>
            <div
              style={{
                background: "var(--bg-tertiary)",
                padding: "var(--spacing-md)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                  marginBottom: "var(--spacing-xs)",
                }}
              >
                <strong>Category ID:</strong> {category.id}
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                  marginBottom: "var(--spacing-xs)",
                }}
              >
                <strong>Current Parent:</strong>{" "}
                {category.parent ? category.parent.name : "None (Top Level)"}
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                }}
              >
                <strong>Products:</strong> {category._count?.products || 0}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              {isSubmitting ? "Updating..." : "Update Category"}
            </button>
          </div>

          {/* Delete Section */}
          <div className={styles.sectionDivider}></div>

          <div className={styles.formGroup}>
            <label className={styles.label} style={{ color: "#ef4444" }}>
              Danger Zone
            </label>
            <div
              style={{
                background: "rgba(239, 68, 68, 0.05)",
                padding: "var(--spacing-lg)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-secondary)",
                  marginBottom: "var(--spacing-md)",
                }}
              >
                Deleting this category will remove it permanently. This action
                cannot be undone.
              </p>
              <button
                type="button"
                onClick={handleDelete}
                className={`${styles.button} ${styles.buttonSecondary}`}
                style={{
                  backgroundColor: showDeleteConfirm
                    ? "#ef4444"
                    : "transparent",
                  color: showDeleteConfirm ? "white" : "#ef4444",
                  borderColor: "#ef4444",
                  width: "auto",
                }}
                disabled={pendingDelete}
              >
                {showDeleteConfirm
                  ? "Click Again to Confirm Delete"
                  : "Delete Category"}
              </button>
              {showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                  style={{
                    marginLeft: "var(--spacing-md)",
                    width: "auto",
                  }}
                  disabled={pendingDelete}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
