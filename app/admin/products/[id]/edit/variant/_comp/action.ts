"use server";

import cloudinary from "@/app/_lib/cloudinary";
import { tryIt } from "@/app/_lib/custom";
import { ErrorFormState } from "@/app/_lib/types";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client";
import { getServerSession } from "next-auth";
import { revalidateTag } from "next/cache";

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
    const session = await getServerSession(authOptions);

    const [error] = await tryIt(async () => {
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const variantId = Number(formData.get("variantId"));
        const productId = Number(formData.get("productId"));

        if (!variantId || !productId) {
            throw new Error("Variant or Product id missing");
        }

        const existingVariant = await prisma.productVariant.findUnique({
            where: {
                id: variantId,
            },
            include: {
                options: true,
                images: true,
                product: true,
            },
        });

        if (!existingVariant) {
            throw new Error("Variant not found");
        }

        // validate ownership
        if (existingVariant.product.adminId !== session.user.id) {
            throw new Error("Unauthorized");
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

        const displayOrder = formData.get("displayOrder")
            ? Number(formData.get("displayOrder"))
            : existingVariant.displayOrder;

        const isActive =
            formData.get("isActive")?.toString() === "true" ||
            formData.get("isActive") === "on";

        // validations
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

        if (sku) {
            const existingSku = await prisma.productVariant.findFirst({
                where: {
                    sku,
                    productId,
                    NOT: {
                        id: variantId,
                    },
                },
            });

            if (existingSku) {
                throw new Error("SKU already exists");
            }
        }

        // variant options
        const optionsRaw = formData.get("options")?.toString() || "[]";

        const options: VariantOptionInput[] = JSON.parse(optionsRaw);

        const normalizedOptions = options.map((opt) => ({
            key: opt.key.trim().toLowerCase(),
            value: opt.value.trim().toLowerCase(),
        }));

        const uniqueKeys = new Set(normalizedOptions.map((o) => o.key));

        if (uniqueKeys.size !== normalizedOptions.length) {
            throw new Error("Duplicate option keys are not allowed");
        }

        const optionHash = normalizedOptions
            .sort((a, b) => a.key.localeCompare(b.key))
            .map((o) => `${o.key}:${o.value}`)
            .join("|");

        const duplicateVariant = await prisma.productVariant.findFirst({
            where: {
                productId,
                optionHash,
                NOT: {
                    id: variantId,
                },
            },
        });

        if (duplicateVariant) {
            throw new Error("Variant with same options already exists");
        }

        // images
        const uploadedFiles = formData.getAll("variant-images") as File[];

        const imageMetaRaw = formData.get("imageMeta")?.toString() || "[]";

        const imageMeta: VariantImageMeta[] = JSON.parse(imageMetaRaw);

        let uploadedImages: {
            image: string;
            sortOrder: number;
            isPrimary: boolean;
        }[] = [];

        if (uploadedFiles.length > 0 && uploadedFiles[0].size > 0) {
            uploadedImages = await Promise.all(
                uploadedFiles.map(async (file, index) => {
                    const bytes = await file.arrayBuffer();

                    const buffer = Buffer.from(bytes);

                    const base64 = `data:${file.type};base64,${buffer.toString(
                        "base64",
                    )}`;

                    const uploadRes = await cloudinary.uploader.upload(base64, {
                        folder: "commyfy/productVariants",
                    });

                    return {
                        image: uploadRes.public_id,
                        sortOrder: imageMeta[index]?.sortOrder ?? index,
                        isPrimary: imageMeta[index]?.isPrimary ?? index === 0,
                    };
                }),
            );
        }

        await prisma.$transaction(async (tx) => {
            // update variant
            await tx.productVariant.update({
                where: {
                    id: variantId,
                },
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

            // replace options
            await tx.variantOption.deleteMany({
                where: {
                    variantId,
                },
            });

            if (normalizedOptions.length > 0) {
                await tx.variantOption.createMany({
                    data: normalizedOptions.map((option) => ({
                        variantId,
                        key: option.key,
                        value: option.value,
                    })),
                });
            }

            // replace images only if new uploaded
            if (uploadedImages.length > 0) {
                const existingImages = await tx.variantImage.findMany({
                    where: {
                        variantId,
                    },
                });

                // delete cloudinary images
                await Promise.all(
                    existingImages.map(async (img) => {
                        try {
                            await cloudinary.uploader.destroy(img.image);
                        } catch {
                            console.error(`Failed to delete image: ${img.image}`);
                        }
                    }),
                );

                // delete db images
                await tx.variantImage.deleteMany({
                    where: {
                        variantId,
                    },
                });

                // create new images
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

        const productName = existingVariant.product.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");

        revalidateTag(
            `s-${session.user.storeSlug}-p-${productName}`,
            "max",
        );
        // revalidateTag("products");
        // revalidateTag(`product-${productId}`);
        // revalidateTag(`variant-${variantId}`);
    });

    return {
        error: error ? (error as Error).message : undefined,
        timestamp: new Date().toISOString(),
    };
};