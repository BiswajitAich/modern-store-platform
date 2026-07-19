"use server";

import cloudinary from "@/app/_lib/cloudinary";
import { tryIt } from "@/app/_lib/custom";
import { ErrorFormState } from "@/app/_lib/types";
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { revalidateTag } from "next/cache";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";
import { queueProductReindex } from "@/lib/search/reindexQueue";

interface VariantOptionInput {
    key: string;
    value: string;
}

interface VariantImageMeta {
    sortOrder: number;
    isPrimary: boolean;
}

export const updateProductVariant = async (
    _prevState: ErrorFormState | undefined,
    formData: FormData,
): Promise<ErrorFormState> => {
    const session = await getAuthenticatedAdmin();
    let pId: number | null = null;
    let shouldReindex = false;
    const [error] = await tryIt(async () => {
        if (!session) throw new Error("Unauthorized");

        const variantId = Number(formData.get("variantId"));
        const productId = Number(formData.get("productId"));
        pId = productId;
        if (!variantId || !productId) {
            throw new Error("Variant or Product id missing");
        }
        const price = Number(formData.get("price"));
        const originalPrice = formData.get("originalPrice")
            ? Number(formData.get("originalPrice"))
            : null;

        const costPrice = formData.get("costPrice")
            ? Number(formData.get("costPrice"))
            : null;

        const stock = Number(formData.get("stock"));

        const sku = formData.get("sku")?.toString().trim() || null;

        const isActive =
            formData.get("isActive")?.toString() === "true" ||
            formData.get("isActive") === "on";

        if (Number.isNaN(price) || price <= 0) {
            throw new Error("Price must be greater than 0");
        }

        if (Number.isNaN(stock) || stock < 0) {
            throw new Error("Stock cannot be negative");
        }

        if (
            originalPrice !== null &&
            !Number.isNaN(originalPrice) &&
            originalPrice < price
        ) {
            throw new Error("Original price cannot be less than selling price");
        }

        // ---------------- OPTIONS ----------------
        let options: VariantOptionInput[] = [];
        const optionsRaw = formData.get("options")?.toString() || "[]";

        try {
            options = JSON.parse(optionsRaw);
        } catch {
            throw new Error("Invalid options JSON");
        }
        const existingVariant = await prisma.productVariant.findUnique({
            where: { id: variantId },
            include: {
                product: true,
            },
        });

        if (!existingVariant) throw new Error("Variant not found");
        const displayOrder = formData.get("displayOrder")
            ? Number(formData.get("displayOrder"))
            : existingVariant.displayOrder;
        if (existingVariant.product.adminId !== session.id) {
            throw new Error("Unauthorized");
        }
        const normalizedOptions = options.map((opt) => ({
            key: opt.key.trim().toLowerCase(),
            value: opt.value.trim().toLowerCase(),
        }));

        const uniqueKeys = new Set(normalizedOptions.map((o) => o.key));

        if (uniqueKeys.size !== normalizedOptions.length) {
            throw new Error("Duplicate option keys are not allowed");
        }

        const optionHash = [...normalizedOptions]
            .sort((a, b) => a.key.localeCompare(b.key))
            .map((o) => `${o.key}:${o.value}`)
            .join("|");

        shouldReindex = optionHash !== existingVariant.optionHash;

        if (sku) {
            const existingSku = await prisma.productVariant.findFirst({
                where: {
                    sku,
                    productId,
                    NOT: { id: variantId },
                },
            });

            if (existingSku) throw new Error("SKU already exists");
        }

        const duplicateVariant = await prisma.productVariant.findFirst({
            where: {
                productId,
                optionHash,
                NOT: { id: variantId },
            },
        });

        if (duplicateVariant) {
            throw new Error("Variant with same options already exists");
        }

        // ---------------- IMAGES ----------------
        const uploadedFiles = formData.getAll("variant-images") as File[];

        const imageMetaRaw = formData.get("imageMeta")?.toString() || "[]";

        let imageMeta: VariantImageMeta[] = [];

        try {
            imageMeta = JSON.parse(imageMetaRaw);
        } catch {
            throw new Error("Invalid image metadata");
        }

        const folderName = process.env.CLOUDINARY_FOLDER_NAME ?? "commyfy-err";

        let uploadedImages: {
            image: string;
            sortOrder: number;
            isPrimary: boolean;
        }[] = [];

        const shouldUploadImages =
            uploadedFiles.length > 0 && uploadedFiles[0]?.size > 0;

        // store old images for cleanup AFTER success
        const oldImages = await prisma.variantImage.findMany({
            where: { variantId },
        });

        try {
            // 1. UPLOAD FIRST
            if (shouldUploadImages) {
                uploadedImages = await Promise.all(
                    uploadedFiles.map(async (file, index) => {
                        const buffer = Buffer.from(await file.arrayBuffer());

                        const base64 = `data:${file.type};base64,${buffer.toString(
                            "base64",
                        )}`;

                        const res = await cloudinary.uploader.upload(base64, {
                            folder: `${folderName}/productVariants`,
                        });

                        return {
                            image: res.public_id,
                            sortOrder: imageMeta[index]?.sortOrder ?? index,
                            isPrimary:
                                imageMeta[index]?.isPrimary ?? index === 0,
                        };
                    }),
                );
            }

            // 2. DB TRANSACTION ONLY
            await prisma.$transaction(async (tx) => {
                await tx.productVariant.update({
                    where: { id: variantId },
                    data: {
                        price: new Prisma.Decimal(price),
                        originalPrice:
                            originalPrice !== null
                                ? new Prisma.Decimal(originalPrice)
                                : null,
                        costPrice:
                            costPrice !== null
                                ? new Prisma.Decimal(costPrice)
                                : null,
                        stock,
                        sku,
                        displayOrder,
                        optionHash,
                        isActive,
                    },
                });

                await tx.variantOption.deleteMany({ where: { variantId } });

                if (normalizedOptions.length > 0) {
                    await tx.variantOption.createMany({
                        data: normalizedOptions.map((o) => ({
                            variantId,
                            key: o.key,
                            value: o.value,
                        })),
                    });
                }

                if (shouldUploadImages) {
                    await tx.variantImage.deleteMany({ where: { variantId } });

                    await tx.variantImage.createMany({
                        data: uploadedImages.map((img) => ({
                            variantId,
                            image: img.image,
                            sortOrder: img.sortOrder,
                            isPrimary: img.isPrimary,
                        })),
                    });
                }
            });

            // 3. CLEANUP OLD CLOUDINARY IMAGES (AFTER SUCCESS ONLY)
            if (shouldUploadImages && oldImages.length > 0) {
                await Promise.all(
                    oldImages.map((img) =>
                        cloudinary.uploader
                            .destroy(img.image)
                            .catch(() => null),
                    ),
                );
            }

            const productName = existingVariant.product.name
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "-");

            if (session.storeSlug && productName) {
                revalidateTag(`s-${session.storeSlug}-p-${productName}`, "max");
            }
        } catch (err) {
            // ROLLBACK UPLOADED IMAGES ONLY
            if (uploadedImages.length > 0) {
                await Promise.all(
                    uploadedImages.map((img) =>
                        cloudinary.uploader
                            .destroy(img.image)
                            .catch(() => null),
                    ),
                );
            }

            throw err;
        }
    });
    if (shouldReindex && pId) {
        queueProductReindex(pId);
    }
    return {
        error: error ? (error as Error).message : undefined,
        timestamp: new Date().toISOString(),
    };
};
