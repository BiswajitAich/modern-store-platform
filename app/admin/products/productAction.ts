"use server";
import { z } from "zod";
import cloudinary from "@/app/_lib/cloudinary";
import { tryIt } from "@/app/_lib/custom";
import { ErrorFormState } from "@/app/_lib/types";
import { Prisma } from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";

export const createProductAction = async (
  _prevState: ErrorFormState | undefined,
  form: FormData,
): Promise<ErrorFormState> => {
  console.log("---createProductAction called---");

  const admin = await getAuthenticatedAdmin();
  let redirectId;
  let categoryIdForRevalidate: number | null = null;
  try {
    const name = form.get("product-name") as string;
    const slugRaw = form.get("product-slug") as string;
    const slug = slugRaw
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const categoryId = Number(form.get("categoryId"));
    categoryIdForRevalidate = categoryId;
    const brand = form.get("brand") as string;
    const description = form.get("description") as string;
    const sortOrderRaw = form.get("sortOrder") as string;
    let sortOrder = sortOrderRaw ? Number(sortOrderRaw) : undefined;
    const isActive = form.get("product-isActive") === "on";
    const isFeatured = form.get("product-isFeatured") === "on";

    const createProductActionSchema = z.object({
      name: z.string().trim().min(1, "Product name is required"),
      slug: z.string().trim().min(1, "Slug is required"),
      categoryId: z.number().min(1, "Category ID is required"),
      description: z
        .string()
        .trim()
        .max(1000, "Description should be at most 500 characters long")
        .optional()
        .or(z.literal("")),
    });
    const result = createProductActionSchema.safeParse({
      name,
      slug,
      categoryId,
      description,
    });
    console.log(result);

    if (!result.success) {
      const tree = z.treeifyError(result.error);
      let msg = "";
      Object.values(tree.properties ?? {})
        .flat()
        .forEach((er, i) => {
          msg += `${i + 1}. ` + er.errors[0] + ". \n";
        });
      throw new Error(msg);
    }

    if (!admin || admin.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const adminId = admin.id;
    await prisma.$transaction(async (tx) => {

      const childCount = await tx.category.count({
        where: {
          parentId: categoryId,
          isActive: true,
          adminId,
        },
      });

      if (childCount > 0) {
        throw new Error("Products can only be added to leaf categories");
      }

      if (sortOrder !== undefined) {
        await tx.product.updateMany({
          where: {
            adminId: adminId,
            categoryId: categoryId,
            sortOrder: {
              gte: sortOrder,
            },
          },
          data: {
            sortOrder: {
              increment: 1,
            },
          },
        });
      } else {
        const maxSortOrder = await tx.product.aggregate({
          where: {
            adminId: adminId,
            categoryId: categoryId,
          },
          _max: {
            sortOrder: true,
          },
        });
        sortOrder = (maxSortOrder._max.sortOrder || 0) + 1;
      }
      // Create product without images first
      try {
        const result = await tx.product.create({
          data: {
            name,
            slug,
            description,
            brand,
            categoryId,
            isActive,
            adminId: adminId,
            isFeatured,
            sortOrder,
          },
        });
        redirectId = result.id;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          console.log(`${slug} already exists. Please choose another slug.`);
          throw new Error(`${slug} already exists. Please choose another slug.`);
        }
      }
    });
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create category",
      timestamp: Date.now().toString(),
    };
  }
  console.log("---redirecting to /admin/products/" + redirectId);
  if (admin?.id) {
    revalidateTag(`admin-counts-${admin?.id}`, "max");
    revalidateTag(`admin-categories-${admin?.id}`, "max");
  }
  if (admin?.id && categoryIdForRevalidate) {
    revalidateTag(`admin-category-products-${admin.id}-${categoryIdForRevalidate}`, "max");
  }
  redirect(`/admin/products/${redirectId}`);
};

export const createProductVariant = async (
  _prevState: ErrorFormState | undefined,
  form: FormData,
): Promise<ErrorFormState> => {
  const productIdParam = form.get("paramId") as string;
  let uploadedImages: string[] = [];

  try {
    const numericProductId = Number(productIdParam);
    const priceRaw = form.get("price") as string;
    const originalPriceRaw = form.get("original-price") as string;
    const costPriceRaw = form.get("cost-price") as string;
    const displayOrder = form.get("display-order") as string;
    const stockRaw = form.get("stock") as string;
    const skuRaw = (form.get("sku") as string)?.trim() || null;
    const optionsRaw = form.get("options") as string;
    const images = form
      .getAll("variant-images")
      .filter(
        (file): file is File =>
          file instanceof File &&
          file.size > 0 &&
          file.type.startsWith("image/"),
      );
    const imageMetaRaw = form.get("imageMeta") as string;
    const imageMeta = JSON.parse(imageMetaRaw) as {
      sortOrder: number;
      isPrimary: boolean;
    }[];

    if (imageMeta.length !== images.length) {
      throw new Error("Image metadata does not match uploaded images");
    }

    const createVariantSchema = z.object({
      numericProductId: z.number().min(1, "Product ID is required"),
      price: z.coerce.number().min(0, "Valid price is required"),
      originalPrice: z.coerce
        .number()
        .min(0, "Valid original price is required"),
      costPrice: z.coerce.number().min(0, "Valid cost price is required"),
      stock: z.coerce.number().int().min(0, "Valid stock quantity is required"),
      options: z.string().refine((val) => {
        try {
          const options = JSON.parse(val);
          return (
            Array.isArray(options) &&
            options.length > 0 &&
            options.every(
              (opt) =>
                opt &&
                typeof opt.key === "string" &&
                typeof opt.value === "string" &&
                opt.key.trim() &&
                opt.value.trim(),
            )
          );
        } catch {
          return false;
        }
      }, "At least one valid variant option is required"),

      images: z
        .array(z.instanceof(File))
        .min(1, "At least one product image is required")
        .refine(
          (imgs) => imgs.every((img) => img.size <= 5 * 1024 * 1024),
          "Each image size should be less than 5MB",
        )
        .refine(
          (imgs) =>
            imgs.reduce((sum, img) => sum + img.size, 0) < 10 * 1024 * 1024,
          "Total images size should be less than 10MB",
        ),

      imageMeta: z
        .array(
          z.object({
            sortOrder: z.number(),
            isPrimary: z.boolean(),
          }),
        )
        .min(1, "Valid image metadata is required"),
    });

    const result = createVariantSchema.safeParse({
      numericProductId,
      price: priceRaw,
      originalPrice: originalPriceRaw,
      costPrice: costPriceRaw,
      stock: stockRaw,
      options: optionsRaw,
      images,
      imageMeta,
    });

    if (!result.success) {
      const tree = z.treeifyError(result.error);
      let msg = "";
      Object.values(tree.properties ?? {})
        .flat()
        .forEach((er, i) => {
          msg += `${i + 1}. ` + er.errors[0] + ". \n";
        });
      throw new Error(msg);
    }

    if (imageMeta.length !== images.length) {
      throw new Error("Image metadata does not match uploaded images");
    }

    const primaryCount = imageMeta.filter((m) => m.isPrimary).length;
    if (primaryCount !== 1) {
      throw new Error("Exactly one primary image must be selected");
    }

    // throw new Error("Debug stop");

    // SKU uniqueness check
    if (skuRaw && result.data.numericProductId) {
      const skuExists = await prisma.productVariant.findUnique({
        where: {
          sku_productId: {
            sku: skuRaw,
            productId: result.data.numericProductId,
          },
        },
      });
      if (skuExists) {
        throw new Error("SKU already exists");
      }
    }

    const options = JSON.parse(optionsRaw);
    const normalizedOptions = options.map(
      (opt: { key: string; value: string }) => {
        return {
          key: opt.key.trim().toLowerCase(),
          value: opt.value.trim().toLowerCase(),
        };
      },
    );
    const optionHash = sha256(
      normalizedOptions
        .map((opt: { key: string; value: string }) => `${opt.key}:${opt.value}`)
        .sort()
        .join("|"),
    );


    // Upload images to Cloudinary and update product with image public_ids
    uploadedImages = await Promise.all(
      images.map(async (img) => {
        return new Promise<string>(async (res, rej) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "commyfy/product-varients",
              public_id: crypto.randomUUID(),
              overwrite: false,
            },
            (err, result) => (err ? rej(err) : res(result?.public_id || "")),
          );

          stream.end(Buffer.from(await img.arrayBuffer()));
        });
      }),
    );

    await prisma.$transaction(async (tx) => {

      const exists = await tx.productVariant.findFirst({
        where: {
          productId: result.data.numericProductId,
          optionHash: optionHash,
        },
      });

      if (exists) {
        throw new Error("Variant with the same options already exists");
      }

      let finalDisplayOrder: number;

      if (displayOrder && displayOrder.trim() !== "") {
        finalDisplayOrder = Number(displayOrder);

        // ✅ shift existing variants DOWN
        await tx.productVariant.updateMany({
          where: {
            productId: result.data.numericProductId,
            displayOrder: { gte: finalDisplayOrder },
          },
          data: {
            displayOrder: { increment: 1 },
          },
        });
      } else {
        // ✅ append to end (NO shifting)
        const maxDisplayOrder = await tx.productVariant.aggregate({
          where: { productId: result.data.numericProductId },
          _max: { displayOrder: true },
        });

        finalDisplayOrder = (maxDisplayOrder._max.displayOrder ?? -1) + 1;
      }

      const variant = await tx.productVariant.create({
        data: {
          productId: result.data.numericProductId,
          price: result.data.price,
          originalPrice: result.data.originalPrice,
          costPrice: result.data.costPrice,
          stock: result.data.stock,
          sku: skuRaw,
          displayOrder: finalDisplayOrder,
          images: { create: [] },
          optionHash,
          options: {
            create: normalizedOptions,
          },
        },
      });


      // Update product with uploaded image IDs
      await tx.variantImage.createMany({
        data: uploadedImages.map((publicId, index) => ({
          variantId: variant.id,
          image: publicId,
          sortOrder: imageMeta ? imageMeta[index].sortOrder : 0,
          isPrimary: imageMeta ? imageMeta[index].isPrimary : false,
        })),
      });
    });
  } catch (error) {
    await Promise.all(
      uploadedImages.map(id =>
        cloudinary.uploader.destroy(id)
      )
    )
    return {
      error:
        error instanceof Error ? error.message : "Failed to create variant",
      timestamp: Date.now().toString(),
    };
  }

  revalidatePath(`/admin/products/${productIdParam}`);
  return { error: null, timestamp: Date.now().toString() };
};

export const createProductAttribute = async (
  _prevState: ErrorFormState | undefined,
  form: FormData,
): Promise<ErrorFormState> => {
  const productIdParam = form.get("paramId") as string;

  const [error] = await tryIt(async () => {
    const numericProductId = Number(productIdParam);
    const optionsRaw = form.get("options") as string;

    if (!numericProductId) {
      throw new Error("Product ID is required");
    }

    const options: { key: string; value: string; displayOrder: string }[] =
      JSON.parse(optionsRaw);

    if (!Array.isArray(options) || options.length === 0) {
      throw new Error("At least one attribute is required");
    }

    const data = options.map((opt) => {
      if (
        !opt ||
        typeof opt.key !== "string" ||
        typeof opt.value !== "string" ||
        !opt.key.trim() ||
        !opt.value.trim()
      ) {
        throw new Error("Invalid attribute option");
      }

      return {
        productId: numericProductId,
        key: opt.key.trim().toLowerCase(),
        value: opt.value.trim(),
        displayOrder: Number(opt.displayOrder ?? 0),
      };
    });

    const result = await prisma.productAttribute.createMany({
      data,
      skipDuplicates: true,
    });
    if (result.count === 0) {
      throw new Error("All attributes already exist");
    }
    if (result.count !== data.length) {
      throw new Error("Some attributes already exist");
    }
  });

  if (error) {
    return {
      error:
        error instanceof Error ? error.message : "Failed to create attribute",
      timestamp: Date.now().toString(),
    };
  }

  // revalidatePath(`/admin/products/${productIdParam}`);
  return { error: null, timestamp: Date.now().toString() };
};

export const toggleProductStatus = async (
  productId: number,
  isActive: boolean,
): Promise<{ success: boolean; message: string | null }> => {
  const [error] = await tryIt(async () => {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: !isActive },
    });
  });
  if (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to update product",
    };
  }
  const admin = await getAuthenticatedAdmin();
  if (admin?.id) {
    revalidateTag(`admin-counts-${admin.id}`, "max");
    revalidateTag(`admin-categories-${admin.id}`, "max");
  }
  return { success: true, message: null };
};

export const deleteProduct = async (productId: number) => {
  let product = null;
  try {
    product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        categoryId: true,
        adminId: true,
      },
    });
    await prisma.product.delete({ where: { id: productId } });
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete product",
    };
  }
  // revalidatePath("/admin/categories");
  if (product?.adminId) {
    revalidateTag(`admin-counts-${product.adminId}`, "max");
    revalidateTag(`admin-categories-${product.adminId}`, "max");
    revalidateTag(`admin-category-products-${product.adminId}-${product.categoryId}`, "max");
  }
  return { success: true, message: null };
};


// SHA-256 hash function
function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
