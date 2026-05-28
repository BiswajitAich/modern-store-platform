"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect, useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import styles from "../../styles/New.module.css";
import { ErrorFormState } from "@/app/_lib/types";
import { updateHeroAction } from "../[id]/heroesAction";

interface EditHeroDTO {
  isActive: boolean;
  productId: number | null;
  id: number;
  title: string;
  categoryId: number | null;
  subtitle: string | null;
  image: string;
  sortOrder: number;
  buttonText: string | null;
  startDate: Date | null;
  endDate: Date | null;
}

const EditHero = ({ heroData }: { heroData: EditHeroDTO | null }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(
    heroData?.image || "",
  );

  const [formData, setFormData] = useState({
    title: heroData?.title || "",
    subtitle: heroData?.subtitle || "",
    categoryId: heroData?.categoryId ?? "",
    productId: heroData?.productId ?? "",
    buttonText: heroData?.buttonText || "",
    sortOrder: heroData?.sortOrder ?? 0,
    isActive: heroData?.isActive ?? true,
    startDate: heroData?.startDate
      ? new Date(heroData.startDate).toISOString().split("T")[0]
      : "",
    endDate: heroData?.endDate
      ? new Date(heroData.endDate).toISOString().split("T")[0]
      : "",
  });

  const initialData = useMemo(
    () => ({
      title: heroData?.title || "",
      subtitle: heroData?.subtitle || "",
      categoryId: heroData?.categoryId ?? "",
      productId: heroData?.productId ?? "",
      buttonText: heroData?.buttonText || "",
      sortOrder: heroData?.sortOrder ?? 0,
      isActive: heroData?.isActive ?? true,
      startDate: heroData?.startDate
        ? new Date(heroData.startDate).toISOString().split("T")[0]
        : "",
      endDate: heroData?.endDate
        ? new Date(heroData.endDate).toISOString().split("T")[0]
        : "",
    }),
    [heroData?.id],
  );

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const [state, action] = useActionState<ErrorFormState, FormData>(
    updateHeroAction,
    { error: null, timestamp: "" },
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error || "An error occurred");
    }
    if (state?.timestamp && !state?.error) {
      toast.success("Updated successfully");
      redirect('/admin/hero');
    }
  }, [state.timestamp]);

  useEffect(() => {
    if (!heroData) toast.error("Hero data not found");
  }, [heroData]);

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.[0]) handleImageSelect(e.dataTransfer.files[0]);
  };

  if (!heroData) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>No hero banner data found.</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/heroes" className={styles.backLink}>
          ← Back to Hero Banners
        </Link>
        <h1 className={styles.title}>Edit Hero Banner</h1>
        <p className={styles.subtitle}>
          Update hero banner details and visibility
        </p>
      </div>

      <div className={styles.formWrapper}>
        <form action={action} className={styles.form}>
          <FormContent
            heroId={heroData.id}
            initialImage={heroData.image}
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
            hasChanges={hasChanges}
          />
        </form>
      </div>
    </div>
  );
};

export default EditHero;

const FormContent = ({
  heroId,
  initialImage,
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
  hasChanges,
}: any) => {
  const router = useRouter();
  const { pending } = useFormStatus();
  const isDisabled = pending || isUploading;

  return (
    <>
      <input type="hidden" name="id" value={heroId} />

      {/* Title */}
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Title <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, title: e.target.value.replace(/\s+/g, " ") })
          }
          className={styles.input}
          placeholder="Enter hero title"
          disabled={isDisabled}
        />
      </div>

      {/* Subtitle */}
      <div className={styles.formGroup}>
        <label htmlFor="subtitle" className={styles.label}>
          Subtitle
        </label>
        <textarea
          id="subtitle"
          name="subtitle"
          value={formData.subtitle}
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value.replace(/\s+/g, " ") })
          }
          className={styles.input}
          placeholder="Enter subtitle"
          rows={4}
          disabled={isDisabled}
          style={{ resize: "vertical", minHeight: "100px" }}
        />
        <p className={styles.helperText}>
          Optional short description for the banner
        </p>
      </div>

      {/* Category ID */}
      <div className={styles.formGroup}>
        <label htmlFor="categoryId" className={styles.label}>
          Category ID
        </label>
        <input
          type="number"
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={(e) =>
            setFormData({
              ...formData,
              categoryId: e.target.value ? Number(e.target.value) : "",
            })
          }
          className={styles.input}
          placeholder="Enter category id"
          disabled={isDisabled || formData.productId}
          min="1"
        />
        <p className={styles.helperText}>
          Optional category linked with this banner
        </p>
      </div>

      {/* Product ID */}
      <div className={styles.formGroup}>
        <label htmlFor="productId" className={styles.label}>
          Product ID
        </label>
        <input
          type="number"
          id="productId"
          name="productId"
          value={formData.productId}
          onChange={(e) =>
            setFormData({
              ...formData,
              productId: e.target.value ? Number(e.target.value) : "",
            })
          }
          className={styles.input}
          placeholder="Enter product id"
          disabled={isDisabled || formData.categoryId}
          min="1"
        />
        <p className={styles.helperText}>
          Optional product linked with this banner
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
          value={formData.buttonText}
          onChange={(e) =>
            setFormData({ ...formData, buttonText: e.target.value })
          }
          className={styles.input}
          placeholder="Shop Now"
          disabled={isDisabled}
        />
      </div>

      {/* Sort Order */}
      <div className={styles.formGroup}>
        <label htmlFor="sortOrder" className={styles.label}>
          Display Order
        </label>
        <input
          type="number"
          id="sortOrder"
          name="sortOrder"
          className={styles.input}
          value={formData.sortOrder}
          onChange={(e) =>
            setFormData({ ...formData, sortOrder: Number(e.target.value) })
          }
          disabled={isDisabled}
          min="0"
        />
        <p className={styles.helperText}>Lower numbers appear first</p>
      </div>

      {/* Start Date */}
      <div className={styles.formGroup}>
        <label htmlFor="startDate" className={styles.label}>
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          value={formData.startDate}
          onChange={(e) =>
            setFormData({ ...formData, startDate: e.target.value })
          }
          className={styles.input}
          disabled={isDisabled}
        />
      </div>

      {/* End Date */}
      <div className={styles.formGroup}>
        <label htmlFor="endDate" className={styles.label}>
          End Date
        </label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          className={styles.input}
          disabled={isDisabled}
        />
      </div>

      {/* Image Upload */}
      <div className={styles.formGroup}>
        <label htmlFor="image" className={styles.label}>
          Hero Banner Image
        </label>
        <div
          className={`${styles.imageUploadArea} ${isDragActive ? styles.dragActive : ""} ${isUploading ? styles.uploading : ""}`}
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
        />

        {imagePreview && (
          <div className={styles.imagePreview}>
            <Image
              src={imagePreview.startsWith("data:")
                ? imagePreview
                : `/api/image?imageId=${encodeURIComponent(imagePreview)}`}
              alt="Hero Preview"
              width={1200}
              height={500}
              unoptimized
              className={styles.previewImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png";
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setImagePreview(initialImage);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className={styles.removeImage}
              disabled={isDisabled || imagePreview === initialImage}
            >
              ✕
            </button>
          </div>
        )}
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
            {formData.isActive ? "✓ Active Banner" : "Inactive Banner"}
          </span>
        </div>
        <p className={styles.helperText}>
          Inactive banners won't appear on the homepage
        </p>
      </div>

      {/* Actions */}
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
          disabled={isDisabled || (!hasChanges && initialImage === imagePreview)}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          {pending ? "Updating..." : (isDisabled || (!hasChanges && initialImage === imagePreview)) ? "No Changes" : "Update Hero Banner"}
        </button>
      </div>
    </>
  );
};