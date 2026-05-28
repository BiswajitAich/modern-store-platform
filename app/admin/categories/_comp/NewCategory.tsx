"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../styles/New.module.css";
import Image from "next/image";
import { createCategorieAction } from "../categoriesAction";
import { useActionState } from "react";
import { ErrorFormState } from "@/app/_lib/types";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
// import { CategoriesforOptions } from "../../_lib/adminPrismaFun";
import { flattenCategories } from "@/app/_lib/serializer";
import { CategoryTreeNode } from "@/app/_lib/db/queries/buildTree";

// interface Cat {
//   id: number;
//   name: string;
//   parentId: number | null;
// }
// type CatTree = Cat & { children: CatTree[] };

// const buildTreeTyped = (
//   cats: Cat[],
//   parentId: number | null = null,
// ): CatTree[] => {
//   return cats
//     .filter((c) => c.parentId === parentId)
//     .map((c) => ({
//       ...c,
//       children: buildTreeTyped(cats, c.id),
//     }));
// };


export default function NewCategory({
  categories,
}: {
  categories: CategoryTreeNode[];
}) {
  // const categoryTree = buildTreeTyped(categories);

  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragActive, setIsDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, action] = useActionState<ErrorFormState, FormData>(
    createCategorieAction,
    {
      error: null,
      timestamp: "",
    },
  );
  // Form state for controlled inputs
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parentId: null,
    isActive: true,
    description: "",
    sortOrder: "",
  });

  // Handle file selection
  const handleImageSelect = (file: File) => {
    setIsUploading(true);
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      setIsUploading(false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      setIsUploading(false);
      return;
    }

    // setImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setIsUploading(false);
  };

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  useEffect(() => {
    if (state.error) {
      toast.error(state.error || "An error occurred");
    }
  }, [state.timestamp]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/categories" className={styles.backLink}>
          ← Back to Categories
        </Link>
        <h1 className={styles.title}>Create Category</h1>
        <p className={styles.subtitle}>
          Add a new product category to your store
        </p>
      </div>

      <div className={styles.formWrapper}>
        <form action={action} className={styles.form}>
          <FormContent
            // categories={categories}
            categories={categories}
            formData={formData}
            setFormData={setFormData}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            fileInputRef={fileInputRef}
            handleImageSelect={handleImageSelect}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            isDragActive={isDragActive}
            isUploading={isUploading}
          // state={state}
          />
        </form>
      </div>
    </div>
  );
}

const FormContent = ({
  // categories,
  categories,
  formData,
  setFormData,
  imagePreview,
  setImagePreview,
  fileInputRef,
  handleImageSelect,
  handleDrag,
  handleDrop,
  isDragActive,
  isUploading,
}: // state,
  any) => {
  const router = useRouter();
  const { pending } = useFormStatus();
  const isDisabled = pending || isUploading;
  const flatCategories = flattenCategories(categories || []);

  // Auto-generate slug from name
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.replace(/\s+/g, " ");
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setFormData({ ...formData, name, slug });
  };
  return (
    <>
      {/* Name */}
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Name <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="name"
            name="name"
            autoComplete="name"
            value={formData.name}
            onChange={handleNameChange}
            className={styles.input}
            placeholder="e.g., Rings"
            disabled={isDisabled}
          />
        </div>
      </div>

      {/* Slug */}
      <div className={styles.formGroup}>
        <label htmlFor="slug" className={styles.label}>
          Slug <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({
                ...formData,
                slug: e.target.value.replace(/\s+/g, "-"),
              })
            }
            className={styles.input}
            placeholder="Auto-generated from name"
            disabled={isDisabled}
          />
        </div>
        <p className={styles.helperText}>
          URL-friendly version of the name (auto-generated but editable)
        </p>
      </div>

      {/* Parent Category */}
      <div className={styles.formGroup}>
        <label htmlFor="parentId" className={styles.label}>
          Parent Category
        </label>
        <select
          id="parentId"
          name="parentId"
          value={formData.parentId || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              parentId: e.target.value ? parseInt(e.target.value) : null,
            })
          }
          className={styles.select}
          disabled={isDisabled}
        >
          <option value="">None (Top Level)</option>
          {flatCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        <p className={styles.helperText}>
          Optional: Select a parent category to create a subcategory
        </p>
      </div>

      {/* Image Upload and Preview*/}
      <div className={styles.formGroup}>
        <label htmlFor="image" className={styles.label}>
          Category Image
        </label>

        <div
          className={`${styles.imageUploadArea} ${isDragActive ? styles.dragActive : ""
            } ${isUploading ? styles.uploading : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.uploadIcon}>📤</div>
          <p className={styles.uploadText}>
            {isUploading ? "Uploading..." : "Click to upload or drag and drop"}
          </p>
          <p className={styles.uploadHint}>PNG, JPG or WEBP (max. 5MB)</p>
        </div>
        <input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files && handleImageSelect(e.target.files[0])
          }
          className={styles.fileInput}
        // disabled={isDisabled}
        />

        {imagePreview && (
          <div className={styles.imagePreview}>
            <Image
              height={200}
              width={200}
              src={imagePreview}
              alt="Preview"
              className={styles.previewImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png";
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // setImage(null);
                setImagePreview("");
              }}
              className={styles.removeImage}
              disabled={isDisabled}
            >
              ✕
            </button>
          </div>
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
          disabled={isDisabled}
          style={{ resize: "vertical", minHeight: "100px" }}
        />
        <p className={styles.helperText}>
          Optional: Detailed product description
        </p>
      </div>

      {/* Order */}
      <div className={styles.formGroup}>
        <label htmlFor="sortOrder" className={styles.label}>
          Display Order
        </label>
        <input
          type="number"
          id="sortOrder"
          name="sortOrder"
          className={styles.input}
          placeholder="Leave empty to add at the end"
          value={formData.sortOrder}
          onChange={(e) =>
            setFormData({
              ...formData,
              sortOrder: e.target.value ? parseInt(e.target.value) : "",
            })
          }
          disabled={pending}
          min="0"
        />
        <p className={styles.helperText}>
          Lower numbers appear first. Leave empty to auto-assign.
        </p>
      </div>

      {/* Active Toggle */}
      <div className={styles.formGroup}>
        <label htmlFor="isActive" className={styles.label}>
          Status
        </label>
        <div className={styles.toggleWrapper}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className={styles.toggleInput}
              disabled={isDisabled}
            />
            <span className={styles.toggleSlider}></span>
          </label>
          <span className={styles.toggleLabel}>
            {formData.isActive ? "✓ Enabled" : "Disabled"}
          </span>
        </div>
        <p className={styles.helperText}>
          Disabled categories won't be visible in the store
        </p>
      </div>

      {/* Form Actions */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={() => router.back()}
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={isDisabled}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isDisabled}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          {isDisabled ? "Creating..." : "Save Category"}
        </button>
      </div>
    </>
  );
};
