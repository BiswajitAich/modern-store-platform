"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "../../styles/New.module.css";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { ErrorFormState } from "@/app/_lib/types";
import { createProductAttribute, createProductVariant } from "../productAction";
import { toast } from "sonner";

interface ProductVariantRaw {
    variants: {
        price: number;
        originalPrice: number | null;
        costPrice: number | null;
        images: {
            id: number;
            sortOrder: number;
            variantId: number;
            image: string;
            isPrimary: boolean;
        }[];
        options: {
            id: number;
            key: string;
            value: string;
            variantId: number;
        }[];
        id: number;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        productId: number;
        stock: number;
        sku: string | null;
        displayOrder: number;
        lowStockThreshold: number;
        optionHash: string;
    }[];
    id: number;
    name: string;
    brand: string | null;
    isActive: boolean;
    attributes: {
        id: number;
        productId: number;
        key: string;
        value: string;
        displayOrder: number;
    }[];
}

type ProductVariant = Omit<ProductVariantRaw, "variants"> & {
  variants: Array<
    Omit<
      ProductVariantRaw["variants"][number],
      "price" | "originalPrice" | "costPrice"
    > & {
      price: number;
      originalPrice: number | null;
      costPrice: number | null;
    }
  >;
};

interface ProductVariantsPageProps {
  product: ProductVariant;
  id: string;
}

interface Option {
  key: string;
  value: string;
  displayOrder?: string;
}

interface VariantImageInput {
  preview: string;
  sortOrder: number;
  isPrimary: boolean;
}

export default function ProductAttributesAndVariants({
  product,
  id,
}: ProductVariantsPageProps) {
  const varientRef = useRef<HTMLFormElement>(null);
  const attributeRef = useRef<HTMLFormElement>(null);

  const [variantState, variantAction] = useActionState<
    ErrorFormState,
    FormData
  >(createProductVariant, {
    error: null,
    timestamp: ""
  });
  const [attributeState, attributeAction] = useActionState<
    ErrorFormState,
    FormData
  >(createProductAttribute, { error: null, timestamp: "" });

  const [displayForm, setDisplayForm] = useState<{
    display: boolean;
    form: "attribute" | "variant" | null;
  }>({ display: false, form: null });

  useEffect(() => {
    if (variantState?.error) {
      toast.error(variantState.error || "An error occurred");
    }
    if (attributeState?.error) {
      toast.error(attributeState.error || "An error occurred");
    }
    if (
      (variantState?.timestamp || attributeState?.timestamp) &&
      !variantState?.error &&
      !attributeState?.error
    ) {
      toast.success("Added successfully");
      attributeRef.current?.reset();
      varientRef.current?.reset();
    }
  }, [
    variantState?.timestamp,
    attributeState?.timestamp,
    variantState?.error,
    attributeState?.error,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/admin/products" className={styles.backLink}>
          ← Back to Products
        </Link>
        <h1 className={styles.title}>{product.name}</h1>
        <div
          className={styles.formWrapper}
          style={{
            border: "1px solid var(--border-color)",
            padding: "var(--spacing-sm)",
            backgroundColor: "var(--bg-tertiary)",
            borderRadius: "var(--spacing-sm)",
          }}
        >
          <p
            className={styles.subtitle}
            style={{ textTransform: "capitalize" }}
          >
            Brand: {product.brand || "N/A"}
          </p>
          <p className={styles.subtitle}>
            Status:{" "}
            <span
              className={`${styles.statusBadge} ${product.isActive ? styles.active : styles.inactive
                }`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
        <p className={styles.subtitle}>
          Manage product variants, Attributes and options
        </p>
      </div>

      <div className={styles.sectionDivider} />

      <div className={styles.formWrapper}>
        <div
          className={styles.sectionHeader}
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() =>
              setDisplayForm({
                display: true,
                form: "attribute",
              })
            }
            disabled={displayForm.display && displayForm.form === "attribute"}
          >
            + Add Attribute
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() =>
              setDisplayForm({
                display: true,
                form: "variant",
              })
            }
            disabled={displayForm.display && displayForm.form === "variant"}
          >
            + Add Variant
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={() =>
              setDisplayForm({
                display: false,
                form: null,
              })
            }
            disabled={!displayForm.display}
          >
            X
          </button>
        </div>

        <div className={styles.sectionDivider} />
        {displayForm.display && displayForm.form === "attribute" && (
          <form
            action={attributeAction}
            className={styles.form}
            ref={attributeRef}
          >
            <FormContentAttribute paramId={id} />
          </form>
        )}

        {displayForm.display && displayForm.form === "variant" && (
          <form action={variantAction} className={styles.form} ref={varientRef}>
            <FormContentVariant paramId={id} variantState={variantState} />
          </form>
        )}
      </div>
      <div className={styles.sectionDivider} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            product.variants.length > 0 && product.attributes.length > 0
              ? "1fr 1fr"
              : "1fr",
          columnGap: "1rem",
        }}
      >
        {/* Existing Variants List */}
        {product.variants.length > 0 && (
          <div className={styles.variantsList}>
            <h3 className={styles.sectionTitle}>
              Existing Variants ({product.variants.length})
            </h3>
            {product.variants.map((variant) => (
              <div key={variant.id} className={styles.variantCard}>
                <div className={styles.variantHeader}>
                  <div className={styles.variantSku}>
                    {variant.sku || `Variant #${variant.id}`}
                  </div>
                </div>
                <div className={styles.variantInfo}>
                  <div className={styles.variantInfoItem}>
                    <div className={styles.variantInfoLabel}>Price</div>
                    <div className={styles.variantInfoValue}>
                      ₹
                      {Number(variant.price).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className={styles.variantInfoItem}>
                    <div className={styles.variantInfoLabel}>Stock</div>
                    <div className={styles.variantInfoValue}>
                      {variant.stock}{" "}
                      {variant.stock === 0
                        ? "⚠️"
                        : variant.stock < 10
                          ? "⚡"
                          : "✓"}
                    </div>
                  </div>
                </div>
                {variant.options.length > 0 && (
                  <div className={styles.variantOptions}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                      }}
                    >
                      Options:
                    </div>
                    {variant.options.map((option, index) => (
                      <div key={index} className={styles.variantOptionBadge}>
                        {option.key}: {option.value}
                      </div>
                    ))}
                  </div>
                )}
                {variant.images.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                      }}
                    >
                      Images ({variant.images.length}):
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {variant.images.slice(0, 3).map((img) => (
                        <div
                          key={img.id}
                          style={{
                            width: "60px",
                            height: "60px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            src={`/api/image?imageId=${encodeURIComponent(
                              img.image
                            )}`}
                            alt="Variant"
                            width={60}
                            height={60}
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ))}
                      {variant.images.length > 3 && (
                        <div
                          style={{
                            width: "60px",
                            height: "60px",
                            border: "1px solid var(--border-color)",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                          }}
                        >
                          +{variant.images.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Existing Attribute List */}
        {product.attributes.length > 0 && (
          <div className={styles.variantsList}>
            <h3 className={styles.sectionTitle}>
              Existing Attributes ({product.attributes.length})
            </h3>
            {product.attributes.map((attr) => (
              <div key={attr.id} className={styles.variantCard}>
                <div className={styles.variantOptions}>
                  <div className={styles.variantOptionBadge}>
                    <strong>{attr.key}:</strong> {attr.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FormContentVariant({
  paramId,
  variantState,
}: {
  paramId: string;
  variantState: ErrorFormState;
}) {
  const { pending } = useFormStatus();

  const [variantForm, setVariantForm] = useState({
    price: "",
    originalPrice: "",
    costPrice: "",
    stock: "",
    sku: "",
    displayOrder: "",
  });

  const [variantOptions, setVariantOptions] = useState<Option[]>([]);
  const [variantImages, setVariantImages] = useState<VariantImageInput[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [newOption, setNewOption] = useState<Option>({
    key: "",
    value: "",
  });

  useEffect(() => {
    if (
      fileInputRef.current &&
      fileInputRef.current.files &&
      fileInputRef.current.files.length > 0
    ) {
      const files = Array.from(fileInputRef.current.files);
      Promise.all(
        files.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      ).then((previews) =>
        setVariantImages(
          previews.map((preview, index) => ({
            preview,
            sortOrder: index,
            isPrimary: index === 0,
          }))
        )
      );
    } else {
      setVariantImages([]);
    }
  }, [variantState.timestamp]);

  const handleResetForm = () => {
    setVariantForm({
      price: "",
      originalPrice: "",
      costPrice: "",
      stock: "",
      sku: "",
      displayOrder: "",
    });
    setVariantOptions([]);
    setNewOption({ key: "", value: "" });
    fileInputRef.current!.value = "";
    setVariantImages([]);
  };

  const addVariantOption = () => {
    if (!newOption.key.trim() || !newOption.value.trim()) {
      toast.error("Both key and value are required");
      return;
    }

    if (
      variantOptions.some(
        (opt) => opt.key.toLowerCase() === newOption.key.toLowerCase()
      )
    ) {
      toast.error("Option key already exists");
      return;
    }

    setVariantOptions([...variantOptions, { ...newOption }]);
    setNewOption({ key: "", value: "" });
    console.log(variantOptions);
  };

  const removeVariantOption = (index: number) => {
    setVariantOptions(variantOptions.filter((_, i) => i !== index));
  };

  const isFormValid = () => {
    return variantForm.price.trim() !== "" &&
      variantForm.originalPrice.trim() !== "" &&
      variantForm.costPrice.trim() !== "" &&
      variantForm.stock.trim() !== "" &&
      parseFloat(variantForm.price) > 0 &&
      parseInt(variantForm.stock) >= 0 &&
      variantImages.length > 0 &&
      !isUploading &&
      !pending &&
      variantOptions.length > 0 &&
      variantImages.length > 0
      ? true
      : false;
  };

  function handleDrag(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.type === "dragenter" || event.type === "dragover") {
      setIsDragActive(true);
    } else if (event.type === "dragleave" || event.type === "drop") {
      setIsDragActive(false);
    }
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      handleImagesSelect(event.dataTransfer.files);
      event.dataTransfer.clearData();
    }
  }

  async function handleImagesSelect(files: FileList): Promise<void> {
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`File "${file.name}" is not an image.`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`"${file.name}" exceeds 5MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    setIsUploading(true);

    try {
      const previews = await Promise.all(
        validFiles.map(
          (file) =>
            new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target?.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(file);
            })
        )
      );
      setVariantImages((prev) => {
        const startOrder = prev.length;
        return [
          ...prev,
          ...previews.map((preview, index) => ({
            preview,
            sortOrder: startOrder + index,
            isPrimary: startOrder === 0 && index === 0,
          })),
        ];
      });
    } catch (err) {
      toast.error("Failed to preview images.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <>
      <h3 className={styles.sectionTitle}>Variant Details</h3>

      {/* Price - original - cost price */}
      <div className={styles.addOptionRow} style={{ alignItems: "flex-start" }}>
        <div className={styles.addOptionInput}>
          <label htmlFor="price" className={styles.label}>
            Price (₹) <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              id="price"
              name="price"
              value={variantForm.price}
              onChange={(e) =>
                setVariantForm({ ...variantForm, price: e.target.value })
              }
              className={styles.input}
              placeholder="e.g., 9999.99"
              step="0.01"
              min="0"
              required
              disabled={pending}
            />
          </div>
          {variantForm.price && parseFloat(variantForm.price) <= 0 && (
            <p
              style={{
                color: "var(--color-error)",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              Price must be greater than 0
            </p>
          )}
        </div>
        <div className={styles.addOptionInput}>
          <label htmlFor="original-price" className={styles.label}>
            Original price (₹) <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              id="original-price"
              name="original-price"
              value={variantForm.originalPrice}
              onChange={(e) =>
                setVariantForm({
                  ...variantForm,
                  originalPrice: e.target.value,
                })
              }
              className={styles.input}
              placeholder="e.g., 9999.99"
              step="0.01"
              min="0"
              required
              disabled={pending}
            />
          </div>
          {variantForm.originalPrice &&
            parseFloat(variantForm.originalPrice) <= 0 && (
              <p
                style={{
                  color: "var(--color-error)",
                  fontSize: "0.85rem",
                  marginTop: "0.25rem",
                }}
              >
                Price must be greater than 0
              </p>
            )}
        </div>
        <div className={styles.addOptionInput}>
          <label htmlFor="cost-price" className={styles.label}>
            Cost Price (₹) <span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input
              type="number"
              id="cost-price"
              name="cost-price"
              value={variantForm.costPrice}
              onChange={(e) =>
                setVariantForm({ ...variantForm, costPrice: e.target.value })
              }
              className={styles.input}
              placeholder="e.g., 9999.99"
              step="0.01"
              min="0"
              required
              disabled={pending}
            />
          </div>
          {variantForm.costPrice && parseFloat(variantForm.costPrice) <= 0 && (
            <p
              style={{
                color: "var(--color-error)",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              Price must be greater than 0
            </p>
          )}
        </div>
      </div>
      {/* Stock Quantity */}
      <div className={styles.formGroup}>
        <label htmlFor="stock" className={styles.label}>
          Stock Quantity <span className={styles.required}>*</span>
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="number"
            id="stock"
            name="stock"
            value={variantForm.stock}
            onChange={(e) =>
              setVariantForm({ ...variantForm, stock: e.target.value })
            }
            className={styles.input}
            placeholder="e.g., 50"
            min="0"
            required
            disabled={pending}
          />
        </div>
        {variantForm.stock && parseInt(variantForm.stock) < 0 && (
          <p
            style={{
              color: "var(--color-error)",
              fontSize: "0.85rem",
              marginTop: "0.25rem",
            }}
          >
            Stock cannot be negative
          </p>
        )}
      </div>
      {/* SKU */}
      <div className={styles.formGroup}>
        <label htmlFor="sku" className={styles.label}>
          SKU (Stock Keeping Unit)
        </label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            id="sku"
            name="sku"
            value={variantForm.sku}
            onChange={(e) =>
              setVariantForm({ ...variantForm, sku: e.target.value.trim() })
            }
            className={styles.input}
            placeholder="e.g., NIKE-AM90-BLK-8 (optional)"
            disabled={pending}
          />
        </div>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            marginTop: "0.25rem",
          }}
        >
          Optional. Must be unique if provided.
        </p>
      </div>

      {/* Order */}
      <div className={styles.formGroup}>
        <label htmlFor="display-order" className={styles.label}>
          Display Order
        </label>
        <input
          type="number"
          id="display-order"
          name="display-order"
          className={styles.input}
          placeholder="Leave empty to add at the end"
          disabled={pending}
          value={variantForm.displayOrder}
          onChange={(e) =>
            setVariantForm({ ...variantForm, displayOrder: e.target.value })
          }
          min="0"
        />
        <p className={styles.helperText}>
          Lower numbers appear first. Leave empty to auto-assign.
        </p>
      </div>

      <div className={styles.sectionDivider}></div>

      {/* varient options */}
      <h3 className={styles.sectionTitle}>Variant Options (Optional)</h3>
      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--text-secondary)",
          marginBottom: "1rem",
        }}
      >
        Add options like Size, Color, Material to differentiate this variant.
      </p>

      {/* key - value - order */}
      {variantOptions.length > 0 ? (
        <div className={styles.formGroup}>
          <table className={styles.optionsTable}>
            <thead>
              <tr>
                <th>Key</th>
                <th>Value</th>
                <th style={{ width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {variantOptions.map((option, index) => (
                <tr key={index}>
                  <td>{option.key}</td>
                  <td>{option.value}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeVariantOption(index)}
                      className={styles.removeOptionBtn}
                      disabled={pending}
                      title="Remove option"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          No options added yet. Options help customers identify specific
          variants.
        </div>
      )}

      <div className={styles.formGroup}>
        <div className={styles.addOptionRow}>
          {/* key */}
          <div className={styles.addOptionInput}>
            <label htmlFor="optionKey" className={styles.label}>
              Key
            </label>
            <input
              type="text"
              id="optionKey"
              value={newOption.key}
              onChange={(e) =>
                setNewOption({ ...newOption, key: e.target.value })
              }
              className={styles.input}
              placeholder="e.g., Size, Color"
              disabled={pending}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVariantOption();
                }
              }}
            />
          </div>
          {/* value */}
          <div className={styles.addOptionInput}>
            <label htmlFor="optionValue" className={styles.label}>
              Value
            </label>
            <input
              type="text"
              id="optionValue"
              value={newOption.value}
              onChange={(e) =>
                setNewOption({ ...newOption, value: e.target.value })
              }
              className={styles.input}
              placeholder="e.g., Large, Blue"
              disabled={pending}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addVariantOption();
                }
              }}
            />
          </div>

          <button
            type="button"
            onClick={addVariantOption}
            className={`${styles.buttonSmall} ${styles.buttonPrimary}`}
            disabled={
              pending ||
              newOption.key.trim() === "" ||
              newOption.value.trim() === ""
            }
          >
            + Add Option
          </button>
        </div>
      </div>
      <div className={styles.sectionDivider}></div>

      {/* images */}
      <div className={styles.formGroup}>
        <label htmlFor="variant-images" className={styles.label}>
          Product Images <span className={styles.required}>*</span>
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
          <div className={styles.uploadIcon}>🖼️</div>
          <p className={styles.uploadText}>
            {isUploading
              ? "Uploading images..."
              : "Click to upload or drag and drop multiple images"}
          </p>
          <p className={styles.uploadHint}>PNG, JPG or WEBP (max. 5MB each)</p>
        </div>
        <input
          id="variant-images"
          name="variant-images"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleImagesSelect(e.target.files)}
          className={styles.fileInput}
          disabled={pending}
        />

        {variantImages.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "var(--spacing-md)",
              marginTop: "var(--spacing-md)",
            }}
          >
            {variantImages.map((variantImage: VariantImageInput, i: number) => (
              <div key={i} className={styles.imagePreview}>
                <img
                  src={variantImage.preview}
                  alt={`Preview ${i + 1}`}
                  className={styles.previewImage}
                  style={{ height: "150px" }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setVariantImages([
                      ...variantImages.filter(
                        (_: VariantImageInput, x: number) => x !== i
                      ),
                    ]);
                  }}
                  className={styles.removeImage}
                  disabled={pending}
                >
                  ✕
                </button>
                <button
                  className={styles.primaryImage}
                  type="button"
                  onClick={() =>
                    setVariantImages((imgs) =>
                      imgs.map((img, x) => ({
                        ...img,
                        isPrimary: x === i,
                      }))
                    )
                  }
                  disabled={pending}
                >
                  ⭐{variantImage.isPrimary ? "Selected" : " Set as Primary"}
                </button>
                <span className={styles.imageOrder}>
                  Order: {variantImage.sortOrder}
                </span>
              </div>
            ))}
          </div>
        )}
        <p
          className={styles.helperText}
          style={{ marginTop: "var(--spacing-sm)" }}
        >
          {variantImages.length} image{variantImages.length !== 1 ? "s " : " "}
          selected
        </p>
      </div>

      {/* reset - add */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={handleResetForm}
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={
            (
              variantImages.length > 0 ||
                variantOptions.length > 0 ||
                pending ||
                variantForm.price !== "" ||
                variantForm.originalPrice !== "" ||
                variantForm.costPrice !== "" ||
                variantForm.stock !== "" ||
                variantForm.sku !== ""
                ? true
                : false
            )
              ? false
              : true
          }
        >
          🔄 Reset Form
        </button>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={!isFormValid()}
        >
          {pending ? (
            <>
              <span>⏳</span> Adding Variant...
            </>
          ) : (
            <>
              <span>+</span> Add Variant
            </>
          )}
        </button>
      </div>

      <input
        type="hidden"
        name="options"
        value={JSON.stringify(variantOptions)}
      />
      <input type="hidden" name="paramId" value={paramId} />
      <input
        type="hidden"
        name="imageMeta"
        value={JSON.stringify(
          variantImages.map(({ sortOrder, isPrimary }) => ({
            sortOrder,
            isPrimary,
          }))
        )}
      />
    </>
  );
}

function FormContentAttribute({ paramId }: { paramId: string }) {
  const { pending } = useFormStatus();

  const [attributes, setAttributes] = useState<Option[]>([]);
  const [newAttribute, setNewAttribute] = useState<Option>({
    key: "",
    value: "",
    displayOrder: "",
  });

  const handleResetForm = () => {
    setAttributes([]);
    setNewAttribute({ key: "", value: "", displayOrder: "" });
  };

  const addAttribute = () => {
    const trimmedKey = newAttribute.key.trim().toLowerCase();
    const trimmedValue = newAttribute.value.trim().toLowerCase();
    const displayOrder = newAttribute.displayOrder
      ? newAttribute.displayOrder
      : attributes.length.toString();

    if (!trimmedKey || !trimmedValue) {
      toast.error("Both key and value are required");
      return;
    }

    if (attributes.some((attr) => attr.key === trimmedKey)) {
      toast.error("Attribute key already exists");
      return;
    }

    setAttributes([
      ...attributes,
      { key: trimmedKey, value: trimmedValue, displayOrder: displayOrder },
    ]);
    setNewAttribute({ key: "", value: "", displayOrder: "" });
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  return (
    <>
      <h3 className={styles.sectionTitle}>Product Attributes</h3>
      <p
        style={{
          fontSize: "0.9rem",
          color: "var(--text-secondary)",
          marginBottom: "1rem",
        }}
      >
        Add product-level attributes like Material, Brand, Weight, etc. These
        apply to the entire product.
      </p>

      {attributes.length > 0 ? (
        <div className={styles.formGroup}>
          <table className={styles.optionsTable}>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Value</th>
                <th>Order</th>
                <th style={{ width: "60px" }}></th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr, index) => (
                <tr key={index}>
                  <td style={{ textTransform: "capitalize" }}>{attr.key}</td>
                  <td style={{ textTransform: "capitalize" }}>{attr.value}</td>
                  <td style={{ textTransform: "capitalize" }}>
                    {attr.displayOrder}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className={styles.removeOptionBtn}
                      disabled={pending}
                      title="Remove attribute"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          No attributes added yet. Add attributes to provide more product
          information.
        </div>
      )}

      <div className={styles.formGroup}>
        <div className={styles.addOptionRow}>
          {/* attribute key */}
          <div className={styles.addOptionInput}>
            <label htmlFor="attrKey" className={styles.label}>
              Attribute Name
            </label>
            <input
              type="text"
              id="attrKey"
              value={newAttribute.key}
              onChange={(e) =>
                setNewAttribute({
                  ...newAttribute,
                  key: e.target.value,
                })
              }
              className={styles.input}
              placeholder="e.g., Fabric, Brand"
              disabled={pending}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAttribute();
                }
              }}
            />
          </div>
          {/* attribute value */}
          <div className={styles.addOptionInput}>
            <label htmlFor="attrValue" className={styles.label}>
              Value
            </label>
            <input
              type="text"
              id="attrValue"
              value={newAttribute.value}
              onChange={(e) =>
                setNewAttribute({
                  ...newAttribute,
                  value: e.target.value,
                })
              }
              className={styles.input}
              placeholder="e.g., Cotton, Nike"
              disabled={pending}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAttribute();
                }
              }}
            />
          </div>
          {/* display order */}
          <div
            className={styles.addOptionInput}
            title="Display Order: '0' for highest priority, larger numbers for lower priority."
          >
            <label htmlFor="displayOrder" className={styles.label}>
              Display Order
            </label>
            <input
              type="number"
              min={0}
              id="displayOrder"
              name="displayOrder"
              value={newAttribute.displayOrder || ""}
              onChange={(e) =>
                setNewAttribute({
                  ...newAttribute,
                  displayOrder: e.target.value,
                })
              }
              className={styles.input}
              placeholder="e.g., 0, 1, 2"
              disabled={pending}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addAttribute();
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={addAttribute}
            className={`${styles.buttonSmall} ${styles.buttonPrimary}`}
            disabled={
              pending ||
              newAttribute.key.trim() === "" ||
              newAttribute.value.trim() === ""
            }
          >
            + Add Attribute
          </button>
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={handleResetForm}
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={pending || attributes.length === 0}
        >
          🔄 Reset Form
        </button>
        <button
          type="submit"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={pending || attributes.length === 0}
        >
          {pending ? (
            <>
              <span>⏳</span> Adding Attributes...
            </>
          ) : (
            <>
              <span>+</span> Add {attributes.length} Attribute
              {attributes.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>

      <input type="hidden" name="options" value={JSON.stringify(attributes)} />
      <input type="hidden" name="paramId" value={paramId} />
    </>
  );
}
