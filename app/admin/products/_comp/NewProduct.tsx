"use client";

import {
  useState,
  useRef,
  ChangeEvent,
  useActionState,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../styles/New.module.css";
import { createProductAction } from "../productAction";
import { ErrorFormState } from "@/app/_lib/types";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { flattenCategories } from "@/app/_lib/serializer";
import { CategoryTreeNode } from "@/app/_lib/db/queries/buildTree";

interface FormDataType {
  name: string;
  slug: string;
  categoryId: string;
  brand: string;
  description: string;
  sortOrder: string;
  isActive: boolean;
  isFeatured: boolean;
}

interface NewProductProps {
  categories: CategoryTreeNode[];
}

interface FormContentProps {
  categories: CategoryTreeNode[];
  formData: FormDataType;
  setFormData: Dispatch<SetStateAction<FormDataType>>;
}


export default function NewProduct({ categories }: NewProductProps) {
  // const options = renderOptions(categories);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, action] = useActionState<ErrorFormState, FormData>(
    createProductAction,
    {
      error: null,
      timestamp: Date.now().toString()
    },
  );
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    slug: "",
    categoryId: "",
    brand: "",
    description: "",
    sortOrder: "",
    isActive: true,
    isFeatured: false,
  });

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [state.timestamp]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/products" className={styles.backLink}>
          ← Back to Products
        </Link>
        <h1 className={styles.title}>Create Product</h1>
        <p className={styles.subtitle}>Add a new product to your store</p>
      </div>

      <div className={styles.formWrapper}>
        <form action={action} className={styles.form}>
          <FormContent
            categories={categories}
            formData={formData}
            setFormData={setFormData}
          />
        </form>
      </div>
    </div>
  );
}

const FormContent = ({ categories, formData, setFormData }: FormContentProps) => {
  const router = useRouter();
  const { pending } = useFormStatus();
  const isDisabled = pending;
  const options = flattenCategories(categories || []);

  // Auto-generate slug from name
  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
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
        <label htmlFor="product-name" className={styles.label}>
          Product Name <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="product-name"
            name="product-name"
            value={formData.name}
            onChange={handleNameChange}
            className={styles.input}
            placeholder="e.g., Gold Ring for Women"
            disabled={isDisabled}
            autoComplete="name"
          />
        </div>
      </div>

      {/* Slug */}
      <div className={styles.formGroup}>
        <label htmlFor="product-slug" className={styles.label}>
          Slug <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="product-slug"
            name="product-slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className={styles.input}
            placeholder="Auto-generated from name"
            disabled={isDisabled}
          />
        </div>
        <p className={styles.helperText}>
          URL-friendly version of the name (auto-generated but editable)
        </p>
      </div>

      {/* Category */}
      <div className={styles.formGroup}>
        <label htmlFor="categoryId" className={styles.label}>
          Category <span className={styles.required}>*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={(e) =>
            setFormData({ ...formData, categoryId: e.target.value })
          }
          className={styles.select}
          disabled={isDisabled}
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {options.map((cat) => (
            <option key={cat.id} value={cat.id} disabled={!cat.isLeaf}>
              {cat.label}
              {!cat.isLeaf ? " (Group)" : ""}
            </option>
          ))}
        </select>
        <p className={styles.helperText}>
          Only leaf categories (without sub-categories) can be selected
        </p>
      </div>

      {/* Brand */}
      <div className={styles.formGroup}>
        <label htmlFor="brand" className={styles.label}>
          Brand
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={(e) =>
              setFormData({ ...formData, brand: e.target.value })
            }
            className={styles.input}
            placeholder="e.g., Tanishq"
            disabled={isDisabled}
            autoComplete="name"
          />
        </div>
        <p className={styles.helperText}>Optional: Enter the product brand</p>
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
              description: e.target.value
                .replace(/\n/g, " ")
                .replace(/\s+/g, " "),
            });
          }}
          className={styles.input}
          placeholder="e.g., 22K handcrafted gold ring for daily wear"
          rows={4}
          disabled={isDisabled}
          style={{ resize: "vertical", minHeight: "100px" }}
        />
        <p className={styles.helperText}>
          Detailed product description (max 500 characters)
          <br />- for better customer engagement and SEO -
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

      {/* Active Toggle */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Status</label>
        <div className={styles.toggleWrapper}>
          <label htmlFor="product-isActive" className={styles.toggle}>
            <input
              id="product-isActive"
              name="product-isActive"
              type="checkbox"
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
          Disabled products won't be visible in the store
        </p>
      </div>

      {/* Featured Toggle */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Featured</label>
        <div className={styles.toggleWrapper}>
          <label htmlFor="product-isFeatured" className={styles.toggle}>
            <input
              id="product-isFeatured"
              name="product-isFeatured"
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData({ ...formData, isFeatured: e.target.checked })
              }
              className={styles.toggleInput}
              disabled={isDisabled}
            />
            <span className={styles.toggleSlider}></span>
          </label>
          <span className={styles.toggleLabel}>
            {formData.isFeatured ? "✓ Enabled" : "Disabled"}
          </span>
        </div>
        <p className={styles.helperText}>
          Featured products get special visibility in the store
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
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={isDisabled}
        >
          {isDisabled ? (
            <>
              <span>⏳</span> Creating...
            </>
          ) : (
            <>
              <span>✓</span> Save & Add Variants
            </>
          )}
        </button>
      </div>
    </>
  );
};
