"use client";

import Image from "next/image";
import Link from "next/link";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { toast } from "sonner";

import styles from "../../../../../styles/New.module.css";

import { ErrorFormState } from "@/app/_lib/types";
import { updateProductVariant } from "./action";
import { redirect } from "next/navigation";


interface VariantImage {
    id: number;
    image: string;
    sortOrder: number;
    isPrimary: boolean;
}

interface VariantOption {
    id: number;
    key: string;
    value: string;
}

interface Variant {
    id: number;
    productId: number;
    price: number;
    originalPrice: number | null;
    costPrice: number | null;
    stock: number;
    sku: string | null;
    displayOrder: number;
    lowStockThreshold: number;
    isActive: boolean;
    images: VariantImage[];
    options: VariantOption[];
    product: {
        id: number;
        name: string;
        brand: string | null;
        isActive: boolean;
    };
}

interface VariantImageInput {
    id?: number;
    preview: string;
    sortOrder: number;
    isPrimary: boolean;
    image?: string;
    file?: File | null;
    isExisting?: boolean;
}

export default function EditVariantForm({
    variant,
    productId,
}: {
    variant: Variant;
    productId: string;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [state, action] = useActionState<ErrorFormState, FormData>(
        updateProductVariant,
        { error: null, timestamp: "" },
    );

    useEffect(() => {
        if (state.error) {
            toast.error(state.error);
        } else if (state.timestamp) {
            toast.success("Variant Updated Successfully !");
            redirect(`/admin/products/${productId}/edit`)
        }
    }, [state]);

    const [variantForm, setVariantForm] = useState({
        price: variant.price.toString(),
        originalPrice: variant.originalPrice?.toString() || "",
        costPrice: variant.costPrice?.toString() || "",
        stock: variant.stock.toString(),
        sku: variant.sku || "",
        displayOrder: variant.displayOrder.toString(),
        lowStockThreshold: variant.lowStockThreshold.toString(),
        isActive: variant.isActive,
    });

    const [variantOptions, setVariantOptions] = useState(variant.options);

    const [variantImages, setVariantImages] = useState<VariantImageInput[]>(
        variant.images.map((img) => ({
            id: img.id,
            image: img.image,
            preview: `/api/image?imageId=${encodeURIComponent(img.image)}`,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
            isExisting: true,
        })),
    );

    const [isUploading, setIsUploading] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);

    // Serialize images in a stable way for change detection
    const serializeImages = (images: VariantImageInput[]) =>
        images.map(({ sortOrder, isPrimary, image, isExisting, file }) => ({
            sortOrder,
            isPrimary,
            image,
            isExisting,
            isNew: !!file,
        }));

    const initialState = useMemo(
        () =>
            JSON.stringify({
                variantForm,
                variantOptions,
                variantImages: serializeImages(variantImages),
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const hasChanges =
        JSON.stringify({
            variantForm,
            variantOptions,
            variantImages: serializeImages(variantImages),
        }) !== initialState;

    async function handleImagesSelect(files: FileList) {
        const validFiles: File[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image`);
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
                            reader.onload = (e) =>
                                resolve(e.target?.result as string);
                            reader.onerror = reject;
                            reader.readAsDataURL(file);
                        }),
                ),
            );

            setVariantImages((prev) => [
                ...prev,
                ...previews.map((preview, index) => ({
                    preview,
                    file: validFiles[index],
                    sortOrder: prev.length + index,
                    isPrimary: false,
                    isExisting: false,
                })),
            ]);
        } catch {
            toast.error("Failed to process images");
        } finally {
            setIsUploading(false);
        }
    }

    function handleDrag(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else {
            setIsDragActive(false);
        }
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleImagesSelect(e.dataTransfer.files);
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link
                    href={`/admin/products/${productId}/edit`}
                    className={styles.backLink}
                >
                    ← Back
                </Link>

                <h1 className={styles.title}>Edit Variant</h1>

                <p className={styles.subtitle}>{variant.product.name}</p>
            </div>

            <div className={styles.formWrapper}>
                <form action={action} className={styles.form}>
                    <VariantFormContent
                        variant={variant}
                        variantForm={variantForm}
                        setVariantForm={setVariantForm}
                        variantOptions={variantOptions}
                        setVariantOptions={setVariantOptions}
                        variantImages={variantImages}
                        setVariantImages={setVariantImages}
                        handleDrag={handleDrag}
                        handleDrop={handleDrop}
                        fileInputRef={fileInputRef}
                        handleImagesSelect={handleImagesSelect}
                        isDragActive={isDragActive}
                        isUploading={isUploading}
                        hasChanges={hasChanges}
                        initialState={initialState}
                    />
                </form>
            </div>
        </div>
    );
}

function VariantFormContent({
    variant,
    variantForm,
    setVariantForm,
    variantOptions,
    setVariantOptions,
    variantImages,
    setVariantImages,
    handleDrag,
    handleDrop,
    fileInputRef,
    handleImagesSelect,
    isDragActive,
    isUploading,
    hasChanges,
    initialState,
}: any) {
    const { pending } = useFormStatus();

    const [newOption, setNewOption] = useState({ key: "", value: "" });

    function handleAddOption() {
        const trimmedKey = newOption.key.trim();
        const trimmedValue = newOption.value.trim();

        if (!trimmedKey || !trimmedValue) return;

        const keyExists = variantOptions.some(
            (opt: VariantOption) =>
                opt.key.toLowerCase() === trimmedKey.toLowerCase(),
        );

        if (keyExists) {
            toast.error(
                `An option with key "${trimmedKey}" already exists.`,
            );
            return;
        }

        setVariantOptions([
            ...variantOptions,
            { id: Date.now(), key: trimmedKey, value: trimmedValue },
        ]);

        setNewOption({ key: "", value: "" });
    }

    return (
        <>
            <input type="hidden" name="variantId" value={variant.id} />
            <input type="hidden" name="productId" value={variant.productId} />

            {/* price */}
            <div className={styles.addOptionRow}>
                <div className={styles.addOptionInput}>
                    <label className={styles.label}>Price</label>
                    <input
                        type="number"
                        name="price"
                        value={variantForm.price}
                        onChange={(e) =>
                            setVariantForm({ ...variantForm, price: e.target.value })
                        }
                        className={styles.input}
                    />
                </div>

                <div className={styles.addOptionInput}>
                    <label className={styles.label}>Original Price</label>
                    <input
                        type="number"
                        name="originalPrice"
                        value={variantForm.originalPrice}
                        onChange={(e) =>
                            setVariantForm({
                                ...variantForm,
                                originalPrice: e.target.value,
                            })
                        }
                        className={styles.input}
                    />
                </div>

                <div className={styles.addOptionInput}>
                    <label className={styles.label}>Cost Price</label>
                    <input
                        type="number"
                        name="costPrice"
                        value={variantForm.costPrice}
                        onChange={(e) =>
                            setVariantForm({
                                ...variantForm,
                                costPrice: e.target.value,
                            })
                        }
                        className={styles.input}
                    />
                </div>
            </div>

            {/* stock */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Stock</label>
                <input
                    type="number"
                    name="stock"
                    value={variantForm.stock}
                    onChange={(e) =>
                        setVariantForm({ ...variantForm, stock: e.target.value })
                    }
                    className={styles.input}
                />
            </div>

            {/* sku */}
            <div className={styles.formGroup}>
                <label className={styles.label}>SKU</label>
                <input
                    type="text"
                    name="sku"
                    value={variantForm.sku}
                    onChange={(e) =>
                        setVariantForm({ ...variantForm, sku: e.target.value })
                    }
                    className={styles.input}
                />
            </div>

            {/* options */}
            <div className={styles.formGroup}>
                <h3 className={styles.sectionTitle}>Options</h3>

                {variantOptions.map((option: any, index: number) => (
                    <div
                        key={option.id}
                        className={styles.variantOptionBadge}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: "1rem",
                            marginBottom: "0.5rem",
                        }}
                    >
                        <span>
                            {option.key}: {option.value}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setVariantOptions(
                                    variantOptions.filter(
                                        (_: any, i: number) => i !== index,
                                    ),
                                )
                            }
                        >
                            ❌
                        </button>
                    </div>
                ))}

                <div className={styles.addOptionRow}>
                    <input
                        type="text"
                        value={newOption.key}
                        placeholder="Key"
                        className={styles.input}
                        onChange={(e) =>
                            setNewOption({ ...newOption, key: e.target.value })
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddOption();
                            }
                        }}
                    />

                    <input
                        type="text"
                        value={newOption.value}
                        placeholder="Value"
                        className={styles.input}
                        onChange={(e) =>
                            setNewOption({ ...newOption, value: e.target.value })
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddOption();
                            }
                        }}
                    />

                    <button
                        type="button"
                        className={`${styles.buttonSmall} ${styles.buttonPrimary}`}
                        onClick={handleAddOption}
                    >
                        + Add
                    </button>
                </div>
            </div>

            {/* images */}
            <div className={styles.formGroup}>
                <label className={styles.label}>Images</label>

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
                    <p className={styles.uploadText}>Upload Images</p>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                        e.target.files && handleImagesSelect(e.target.files)
                    }
                />

                {variantImages.length > 0 && (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fill,minmax(160px,1fr))",
                            gap: "1rem",
                            marginTop: "1rem",
                        }}
                    >
                        {variantImages.map((image: any, index: number) => (
                            <div
                                key={image.id ?? `new-${index}`}
                                className={styles.imagePreview}
                            >
                                <Image
                                    src={image.preview}
                                    alt="preview"
                                    width={300}
                                    height={300}
                                    className={styles.previewImage}
                                    unoptimized
                                />

                                <button
                                    type="button"
                                    className={styles.removeImage}
                                    onClick={() =>
                                        setVariantImages(
                                            variantImages.filter(
                                                (_: any, i: number) =>
                                                    i !== index,
                                            ),
                                        )
                                    }
                                >
                                    ✕
                                </button>

                                <button
                                    type="button"
                                    className={styles.primaryImage}
                                    onClick={() =>
                                        setVariantImages(
                                            variantImages.map(
                                                (img: any, i: number) => ({
                                                    ...img,
                                                    isPrimary: i === index,
                                                }),
                                            ),
                                        )
                                    }
                                >
                                    ⭐{" "}
                                    {image.isPrimary ? "Primary" : "Set Primary"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className={styles.formActions}>
                <button
                    type="button"
                    disabled={pending || !hasChanges}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                    onClick={() => {
                        const parsed = JSON.parse(initialState);
                        setVariantForm(parsed.variantForm);
                        setVariantOptions(parsed.variantOptions);
                        setVariantImages(parsed.variantImages.map((img: any) => ({
                            ...img,
                            preview: img.isExisting ? `/api/image?imageId=${encodeURIComponent(img.image)}` : img.preview,
                            file: null,
                        })));
                    }}
                >
                    Reset
                </button>
                <button
                    type="submit"
                    disabled={pending || !hasChanges}
                    className={`${styles.button} ${styles.buttonPrimary}`}
                >
                    {pending ? "Updating..." : "Update Variant"}
                </button>
            </div>

            <input
                type="hidden"
                name="options"
                value={JSON.stringify(
                    variantOptions.map(({ key, value }: any) => ({ key, value })),
                )}
            />

            <input
                type="hidden"
                name="imageMeta"
                value={JSON.stringify(
                    variantImages.map(
                        ({ sortOrder, isPrimary, image, isExisting }: any) => ({
                            sortOrder,
                            isPrimary,
                            image,
                            isExisting,
                        }),
                    ),
                )}
            />
        </>
    );
}