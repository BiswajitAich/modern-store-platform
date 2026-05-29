"use server";

import { tryIt } from "@/app/_lib/custom";
import prisma from "@/lib/prisma";
import cloudinary from "@/app/_lib/cloudinary";
import { revalidatePath, revalidateTag } from "next/cache";
import { ErrorFormState } from "@/app/_lib/types";
import { z } from "zod";
import { getAuthenticatedAdmin } from "@/app/_lib/customForServerSide";

export const updateHeroAction = async (
    _prevState: ErrorFormState | undefined,
    form: FormData,
): Promise<ErrorFormState> => {
    const session = await getAuthenticatedAdmin();

    const [error] = await tryIt(async () => {
        if (!session || session.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const id = Number(form.get("id"));

        const title = (form.get("title") as string)?.trim();
        const subtitle = (form.get("subtitle") as string)?.trim();
        const categoryIdRaw = form.get("categoryId");
        const productIdRaw = form.get("productId");
        const buttonText = (form.get("buttonText") as string)?.trim();
        const sortOrderRaw = form.get("sortOrder");
        const isActive = form.get("isActive") === "on";
        const startDateRaw = form.get("startDate");
        const endDateRaw = form.get("endDate");
        const image = form.get("image") as File | null;

        const categoryId = categoryIdRaw
            ? Number(categoryIdRaw)
            : null;

        const productId = productIdRaw
            ? Number(productIdRaw)
            : null;

        const sortOrder = sortOrderRaw
            ? Number(sortOrderRaw)
            : 0;

        const startDate = startDateRaw
            ? new Date(startDateRaw as string)
            : null;

        const endDate = endDateRaw
            ? new Date(endDateRaw as string)
            : null;

        const HeroSchema = z.object({
            title: z
                .string()
                .min(1, "Title is required")
                .max(120, "Title must be at most 120 characters"),

            subtitle: z
                .string()
                .max(500, "Subtitle must be at most 500 characters")
                .optional(),

            buttonText: z
                .string()
                .max(50, "Button text must be at most 50 characters")
                .optional(),

            image: z
                .any()
                .refine(
                    (file: { size: number }) =>
                        !file ||
                        !(file instanceof File) ||
                        file.size === 0 ||
                        file.size <= 5 * 1024 * 1024,
                    {
                        message: "Image size should be less than 5MB",
                    },
                ),
        });

        const result = HeroSchema.safeParse({
            title,
            subtitle,
            buttonText,
            image,
        });

        if (!result.success) {
            const tree = z.treeifyError(result.error);

            let msg = "";

            Object.values(tree.properties ?? {})
                .flat()
                .forEach((er, i) => {
                    msg += `${i + 1}. ${er.errors[0]}.\n`;
                });

            throw new Error(msg);
        }

        const existingHero = await prisma.heroBanner.findUnique({
            where: { id },
            select: {
                id: true,
                image: true,
                sortOrder: true,
            },
        });

        if (!existingHero) {
            throw new Error("Hero banner not found");
        }

        // -------- Upload image before transaction --------
        let newImagePublicId: string | null = null;
        const folderName = process.env.CLOUDINARY_FOLDER_NAME ?? "commyfy-err";

        try {
            await prisma.$transaction(async (tx) => {
                // Handle sort order shifting
                if (sortOrder !== existingHero.sortOrder) {
                    if (sortOrder > existingHero.sortOrder) {
                        await tx.heroBanner.updateMany({
                            where: {
                                sortOrder: {
                                    gt: existingHero.sortOrder,
                                    lte: sortOrder,
                                },
                                NOT: { id },
                            },
                            data: {
                                sortOrder: {
                                    decrement: 1,
                                },
                            },
                        });
                    } else {
                        await tx.heroBanner.updateMany({
                            where: {
                                sortOrder: {
                                    gte: sortOrder,
                                    lt: existingHero.sortOrder,
                                },
                                NOT: { id },
                            },
                            data: {
                                sortOrder: {
                                    increment: 1,
                                },
                            },
                        });
                    }
                }

                // Update only changed fields
                await tx.heroBanner.update({
                    where: { id },
                    data: {
                        ...(title !== undefined && { title }),
                        ...(subtitle !== undefined && { subtitle }),
                        ...(buttonText !== undefined && { buttonText }),
                        ...(categoryId !== undefined && { categoryId }),
                        ...(productId !== undefined && { productId }),
                        ...(sortOrder !== undefined && { sortOrder }),
                        ...(isActive !== undefined && { isActive }),
                        ...(startDateRaw !== null && { startDate }),
                        ...(endDateRaw !== null && { endDate }),
                        ...(newImagePublicId && { image: newImagePublicId }),
                    },
                });
            });
            if (image && image.size > 0) {
                newImagePublicId = await new Promise<string>((res, rej) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: `${folderName}/heroes` },
                        (err, result) =>
                            err ? rej(err) : res(result?.public_id || ""),
                    );

                    image
                        .arrayBuffer()
                        .then((buffer) => {
                            stream.end(Buffer.from(buffer));
                        })
                        .catch(rej);
                });
            }
        } catch (err) {
            if (newImagePublicId) {
                await cloudinary.uploader.destroy(newImagePublicId);

                throw err;
            }
        }
        // -------- Cleanup old image --------
        if (newImagePublicId && existingHero.image) {
            await cloudinary.uploader.destroy(existingHero.image);
        }
    });

    if (error) {
        console.error("UPDATE HERO ERROR:", error);

        return {
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to update hero banner",
            timestamp: new Date().toISOString(),
        };
    }

    revalidatePath("/admin/hero");
    revalidateTag(`store-${session?.storeSlug}-heroes`, "max")

    return {
        error: null,
        timestamp: new Date().toISOString(),
    };
};