"use server";
import { tryIt } from "@/app/_lib/custom";
import { ErrorFormState } from "@/app/_lib/types";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath, revalidateTag } from "next/cache";

export const updateProductAttribute = async (
    _prevState: ErrorFormState | undefined,
    formData: FormData,
): Promise<ErrorFormState> => {
    const session = await getServerSession(authOptions);

    const [error] = await tryIt(async () => {
        if (!session?.user) {
            throw new Error("Unauthorized");
        }

        const attributeId = Number(formData.get("attributeId"));
        const productId = Number(formData.get("productId"));

        const key = formData
            .get("key")
            ?.toString()
            .trim()
            .toLowerCase();

        const value = formData
            .get("value")
            ?.toString()
            .trim()
            .toLowerCase();

        const displayOrder = Number(
            formData.get("displayOrder") || 0,
        );

        if (!attributeId || !productId) {
            throw new Error("Invalid request");
        }

        if (!key || !value) {
            throw new Error("Key and value are required");
        }

        const existingAttribute =
            await prisma.productAttribute.findFirst({
                where: {
                    id: attributeId,
                    productId,
                },
                include: {
                    product: true,
                },
            });

        if (!existingAttribute) {
            throw new Error("Attribute not found");
        }

        if (
            existingAttribute.product.adminId !== session.user.id
        ) {
            throw new Error("Unauthorized");
        }

        const duplicateAttribute =
            await prisma.productAttribute.findFirst({
                where: {
                    productId,
                    key,
                    NOT: {
                        id: attributeId,
                    },
                },
            });

        if (duplicateAttribute) {
            throw new Error(
                "Attribute key already exists for this product",
            );
        }

        await prisma.productAttribute.update({
            where: {
                id: attributeId,
            },
            data: {
                key,
                value,
                displayOrder,
            },
        });

        const productName = existingAttribute.product.name
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-");

        revalidateTag(
            `s-${session.user.storeSlug}-p-${productName}`,
            "max",
        );
        // revalidatePath("/")
    });

    return {
        error: error ? (error as Error).message : undefined,
        timestamp: new Date().toISOString(),
    };
};