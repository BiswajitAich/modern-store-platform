"use server";

import { tryIt } from "@/app/_lib/custom";
import prisma from "@/lib/prisma";
import cloudinary from "@/app/_lib/cloudinary";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ErrorFormState } from "@/app/_lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { z } from "zod";
import { Category } from "@/app/generated/prisma/client";

export const createCategorieAction = async (
  _prevState: ErrorFormState | undefined,
  form: FormData,
): Promise<ErrorFormState> => {
  console.log("✅ SERVER ACTION HIT");
  const session = await getServerSession(authOptions);
  const [error] = await tryIt(async () => {
    console.log("Form Data:", form);
    const name = form.get("name") as string;
    const slug = form.get("slug") as string;
    const isActive = form.get("isActive") === "on";
    const parentIdRaw = form.get("parentId");
    const image = form.get("image") as File | null;
    const description = form.get("description") as string;
    const sortOrder = form.get("sortOrder") as string;

    const CategorySchema = z.object({
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be at most 100 characters"),
      slug: z
        .string()
        .min(1, "Slug is required")
        .max(100, "Slug must be at most 100 characters"),
      description: z
        .string()
        .min(1, "Description is required")
        .max(500, "Description must be at most 500 characters"),
      image: z
        .any()
        .refine(
          (file: { size: number }) =>
            !file || (file instanceof File && file.size <= 5 * 1024 * 1024),
          { message: "Image size should be less than 5MB" },
        ),
    });
    const result = CategorySchema.safeParse({ name, slug, description, image });
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

    if (!session || session.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    // 1️⃣ Create category with sortOrder handling
    let category: Category;
    let newSortOrder: number = 1;
    if (sortOrder) {
      await prisma.category.updateMany({
        where: {
          adminId: session.user.id,
          sortOrder: { gte: parseInt(sortOrder) },
        },
        data: { sortOrder: { increment: 1 } },
      });
      newSortOrder = parseInt(sortOrder);
    } else {
      const maxSort = await prisma.category.aggregate({
        _max: { sortOrder: true },
        where: {
          parentId: parentIdRaw ? Number(parentIdRaw) : null,
          adminId: session.user.id,
        },
      });

      newSortOrder = (maxSort._max.sortOrder || 0) + 1;
    }
    category = await prisma.category.create({
      data: {
        adminId: session.user.id,
        name,
        slug,
        isActive,
        description,
        parentId: parentIdRaw ? Number(parentIdRaw) : null,
        sortOrder: newSortOrder,
      },
    });

    // 2️⃣ Upload image outside transaction
    let imagePublicId: string | null = null;
    if (image && image.size > 0) {
      imagePublicId = await new Promise<string>((res, rej) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "commyfy/categories" },
          (err, result) => (err ? rej(err) : res(result!.public_id)),
        );
        image.arrayBuffer().then((b) => stream.end(Buffer.from(b)));
      });

      // 3️⃣ Update category with image
      await prisma.category.update({
        where: { id: category!.id },
        data: { image: imagePublicId },
      });
    }
  });
  if (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to create category",
      timestamp: new Date().toISOString(),
    };
  }
  console.log("Category created successfully");
  // revalidatePath("/admin/categories");
  if (session?.user.id)
    revalidateTag(`admin-counts-${session.user.id}`, "max");
  redirect("/admin/categories");
};

export async function toggleCategoryStatus(
  categoryId: number,
  currentStatus: boolean,
) {
  console.log({ categoryId, currentStatus });

  const [error] = await tryIt(async () => {
    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: !currentStatus },
    });
  });
  if (error) {
    console.error("Error toggling category status:", error);
    return { success: false, error: "Failed to update category status" };
  }
  revalidatePath("/admin/products");
  return { success: true };
}

export async function updateCategoryAction(id: number, form: FormData) {
  const [error] = await tryIt(async () => {
    const name = form.get("name") as string;
    const slug = form.get("slug") as string;
    const isActive = form.get("isActive") === "true";
    const parentId = form.get("parentId") ? Number(form.get("parentId")) : null;
    const removeImage = form.get("removeImage") === "true";
    const image = form.get("image") as File | null;
    const newSortOrder = form.get("sortOrder")
      ? Number(form.get("sortOrder"))
      : null;

    const existing = await prisma.category.findUnique({
      where: { id },
      select: { image: true, sortOrder: true, parentId: true, adminId: true },
    });
    if (!existing) throw new Error("Category not found");

    // -------- Upload image BEFORE transaction --------
    let newImagePublicId: string | null = null;

    if (image && image.size > 0) {
      newImagePublicId = await new Promise<string>(async (res, rej) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "commyfy/categories" },
          (err, result) => (err ? rej(err) : res(result?.public_id || "")),
        );
        stream.end(Buffer.from(await image.arrayBuffer()));
      });
    }

    // -------- DB transaction --------
    await prisma.$transaction(async (tx) => {
      if (newSortOrder !== null && newSortOrder !== existing.sortOrder) {
        if (newSortOrder > existing.sortOrder) {
          await tx.category.updateMany({
            where: {
              adminId: existing.adminId,
              parentId,
              sortOrder: { gt: existing.sortOrder, lte: newSortOrder },
            },
            data: { sortOrder: { decrement: 1 } },
          });
        } else {
          await tx.category.updateMany({
            where: {
              adminId: existing.adminId,
              parentId,
              sortOrder: { gte: newSortOrder, lt: existing.sortOrder },
            },
            data: { sortOrder: { increment: 1 } },
          });
        }
      }

      await tx.category.update({
        where: { id },
        data: {
          name,
          slug,
          isActive,
          parentId,
          ...(newSortOrder !== null && { sortOrder: newSortOrder }),
          ...(removeImage && { image: null }),
          ...(newImagePublicId && { image: newImagePublicId }),
        },
      });
    });

    // -------- Cleanup --------
    if ((removeImage || newImagePublicId) && existing.image) {
      await cloudinary.uploader.destroy(existing.image);
    }
  });

  if (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update category",
    };
  }

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: number) {
  const [error] = await tryIt(async () => {
    const existing = await prisma.category.findUnique({
      where: { id: Number(id) },
      select: { image: true },
    });

    await prisma.category.delete({
      where: { id: Number(id) },
    });

    if (existing?.image) {
      await cloudinary.uploader.destroy(existing.image);
    }
  });
  if (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete category",
    };
  }
  const session = await getServerSession(authOptions);
  if (session?.user.id)
    revalidateTag(`admin-counts-${session.user.id}`, "max");
  revalidatePath("/admin/products");
  return { success: true };
}
