"use client";

import styles from "../../styles/New.module.css";
import Link from "next/link";
import { useState, useRef, useActionState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { ErrorFormState } from "@/app/_lib/types";
import { createHero } from "../heroAction";
import { ProductsforOptions } from "../../_lib/adminPrismaFun";
import { CategoryTreeNode } from "@/app/_lib/db/queries/buildTree";
import { flattenCategories } from "@/app/_lib/serializer";

interface FormInputData {
  title: string;
  subtitle: string;
  sortOrder: string;
  isActive: boolean;
  productId: number | undefined;
  categoryId: number | undefined;
  buttonText?: string;
  startDate?: string;
  endDate?: string;
}

const CreateNewHero = ({
  products,
  categories,
}: {
  products: ProductsforOptions[];
  categories: CategoryTreeNode[];
}) => {
  const [formData, setFormData] = useState<FormInputData>({
    title: "",
    subtitle: "",
    sortOrder: "",
    isActive: true,
    productId: undefined,
    categoryId: undefined,
  });

  const [state, action] = useActionState<ErrorFormState, FormData>(createHero, {
    error: null,
    timestamp: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const prevTimestampRef = useRef<string>("");

  useEffect(() => {
    if (!state.timestamp || state.timestamp === prevTimestampRef.current) return;
    prevTimestampRef.current = state.timestamp;

    if (state.error === undefined) {
      toast.success("Hero banner created successfully");
      setFormData({ title: "", subtitle: "", sortOrder: "", isActive: true, productId: undefined, categoryId: undefined });
      setImagePreview(null);
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state.timestamp]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/hero" className={styles.backLink}>
          ← Back to hero banners
        </Link>
        <h1 className={styles.title}>Add Hero Banner</h1>
        <p className={styles.subtitle}>
          Create a new hero banner for the homepage
        </p>
      </div>

      <div className={styles.formWrapper}>
        <form action={action} ref={formRef} className={styles.form}>
          <FormContent
            products={products}
            categories={categories}
            formData={formData}
            setFormData={setFormData}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
          />
        </form>
      </div>
    </div>
  );
};

export default CreateNewHero;

const FormContent = ({
  products,
  categories,
  formData,
  setFormData,
  imagePreview,
  setImagePreview,
}: {
  products: ProductsforOptions[];
  categories: CategoryTreeNode[];
  formData: FormInputData;
  setFormData: React.Dispatch<React.SetStateAction<FormInputData>>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const { pending } = useFormStatus();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flatCategories = flattenCategories(categories || []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Title */}
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Title <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className={styles.input}
          placeholder="Enter hero banner title"
          value={formData.title}
          onChange={handleInputChange}
          disabled={pending}
        />
        <p className={styles.helperText}>
          Main headline displayed on the banner
        </p>
      </div>

      {/* Subtitle */}
      <div className={styles.formGroup}>
        <label htmlFor="subtitle" className={styles.label}>
          Subtitle
        </label>
        <input
          type="text"
          id="subtitle"
          name="subtitle"
          className={styles.input}
          placeholder="Enter subtitle (optional)"
          value={formData.subtitle}
          onChange={handleInputChange}
          disabled={pending}
        />
        <p className={styles.helperText}>
          Supporting text displayed below the title
        </p>
      </div>

      {/* Linked Category */}
      <div className={styles.formGroup}>
        <label htmlFor="categoryId" className={styles.label}>
          Linked Category (Optional)
        </label>

        <select
          id="categoryId"
          name="categoryId"
          className={styles.input}
          disabled={pending || formData.productId !== undefined}
          onChange={(e) => {
            const value =
              e.target.value === "" ? undefined : Number(e.target.value);
            setFormData((prev) => ({ ...prev, categoryId: value }));
          }}
          value={formData.categoryId ?? ""}
        >
          <option value="">— No category (branding banner)</option>
          {flatCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>

        <p className={styles.helperText}>
          If selected, clicking this banner will open the linked category
        </p>
      </div>

      {/* Linked Product */}
      <div className={styles.formGroup}>
        <label htmlFor="productId" className={styles.label}>
          Linked Product (Optional)
        </label>

        <select
          id="productId"
          name="productId"
          className={styles.input}
          disabled={pending || formData.categoryId !== undefined}
          value={formData.productId ?? ""}
          onChange={(e) => {
            const value =
              e.target.value === "" ? undefined : Number(e.target.value);
            setFormData((prev) => ({ ...prev, productId: value }));
          }}
        >
          <option value="">— No product (branding banner)</option>
          {products.map((product: ProductsforOptions) => (
            <option key={product?.id} value={product?.id}>
              {product?.name}
            </option>
          ))}
        </select>

        <p className={styles.helperText}>
          If selected, clicking this banner will open the linked product
        </p>
      </div>

      {/* Button Text */}
      <div className={styles.formGroup}>
        <label htmlFor="buttonText" className={styles.label}>
          Button Text
        </label>
        <input
          type="text"
          id="buttonText"
          name="buttonText"
          className={styles.input}
          placeholder="Enter buttonText (optional) e.g. 'Shop Now'"
          value={formData.buttonText || ""}
          onChange={handleInputChange}
          disabled={
            pending ||
            (formData.productId === undefined &&
              formData.categoryId === undefined)
          }
        />
        <p className={styles.helperText}>
          If linked to a product, this text will appear on the button. If left
          empty, a default "View Product" will be used.
        </p>
      </div>

      {/* Image Upload */}
      <div className={styles.formGroup}>
        <label htmlFor="heroImage" className={styles.label}>
          Hero Image <span className={styles.required}>*</span>
        </label>
        <div
          className={`${styles.imageUploadArea} ${dragActive ? styles.dragActive : ""
            } ${pending ? styles.uploading : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.uploadIcon}>🖼️</div>
          <p className={styles.uploadText}>
            Drag and drop an image here, or click to browse
          </p>
          <p className={styles.uploadHint}>
            Recommended: 1920x600px (16:5 ratio), Max 5MB
          </p>
          <input
            id="heroImage"
            name="heroImage"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={handleFileSelect}
            disabled={pending}
          />
        </div>
        {pending && (
          <p className={styles.uploadingText}>
            <span>⏳</span> Uploading image...
          </p>
        )}

        {imagePreview && (
          <div className={styles.imagePreview}>
            <Image
              src={imagePreview}
              alt="Hero preview"
              width={800}
              height={250}
              className={styles.previewImage}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "50vh",
                objectFit: "contain",
                display: "block",
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className={styles.removeImage}
              disabled={pending}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Order */}
      <div className={styles.formGroup}>
        <label htmlFor="order" className={styles.label}>
          Display Order
        </label>
        <input
          type="number"
          id="order"
          name="order"
          className={styles.input}
          placeholder="Leave empty to add at the end"
          value={formData.sortOrder}
          onChange={handleInputChange}
          disabled={pending}
          min="0"
        />
        <p className={styles.helperText}>
          Lower numbers appear first. Leave empty to auto-assign.
        </p>
      </div>

      {/* Active Toggle */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Status</label>
        <div className={styles.toggleWrapper}>
          <label htmlFor="isActive" className={styles.toggle}>
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              className={styles.toggleInput}
              checked={formData.isActive}
              onChange={handleToggle}
              disabled={pending}
            />
            <span className={styles.toggleSlider}></span>
          </label>
          <span className={styles.toggleLabel}>
            {formData.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className={styles.helperText}>
          Active banners will be displayed on the homepage
        </p>
      </div>

      {/* Start Date input */}
      <div className={styles.formGroup}>
        <label htmlFor="startDate" className={styles.label}>
          Start Date
        </label>
        <input
          type="datetime-local"
          id="startDate"
          name="startDate"
          className={styles.input}
          disabled={pending}
          value={formData.startDate || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, startDate: e.target.value }))
          }
        />
        <p className={styles.helperText}>
          Optional start date for scheduled display
        </p>
      </div>

      {/* End Date input */}
      <div className={styles.formGroup}>
        <label htmlFor="endDate" className={styles.label}>
          End Date
        </label>
        <input
          type="datetime-local"
          id="endDate"
          name="endDate"
          className={styles.input}
          disabled={pending}
          min={formData.startDate}
          value={formData.endDate || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, endDate: e.target.value }))
          }
        />
        <p className={styles.helperText}>
          Optional end date for scheduled display
        </p>
      </div>

      {/* Form Actions */}
      <div className={styles.formActions}>
        <Link
          href="/admin/hero"
          className={`${styles.button} ${styles.buttonSecondary}`}
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={() => {
            setFormData({
              title: "",
              subtitle: "",
              sortOrder: "",
              isActive: true,
              productId: undefined,
              categoryId: undefined,
            });
            setImagePreview(null);
          }}
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={pending}
        >
          Clear Form
        </button>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={pending}
        >
          {pending ? "Creating..." : "Create Hero Banner"}
        </button>
      </div>
    </>
  );
};
