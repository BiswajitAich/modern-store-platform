import { embed } from "@/lib/ai/client";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { buildSearchDocument, productSearchSelect } from "@/lib/search/builder";

export const rebuildSearchDocument = async (productId: number) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: productSearchSelect,
        });
        if (!product) {
            throw new Error("No product! \n" + product);
        }
        const text = buildSearchDocument(product);
        const contentHash = crypto
            .createHash("sha256")
            .update(text)
            .digest("hex");
        const existing = await prisma.searchDocument.findUnique({
            where: {
                entityType_entityId: {
                    entityType: "PRODUCT",
                    entityId: productId,
                },
            },
            select: { contentHash: true },
        });

        if (existing?.contentHash === contentHash) {
            return;
        }
        const emb = await embed(text);
        if (!emb.embedding) {
            throw new Error("Embedding Not Created!");
        }
        const vector = `[${emb.embedding.join(",")}]`;
        const now = new Date();

        await prisma.$executeRaw`
                    INSERT INTO search_documents (
                        entity_id,
                        entity_type,
                        admin_id,
                        searchable_text,
                        embedding,
                        embedding_model,
                        content_hash,
                        indexed_at,
                        created_at,
                        updated_at
                    )
                    VALUES (
                        ${productId},
                        'PRODUCT'::"SearchDocumentType",
                        ${product.adminId},
                        ${text},
                        ${vector}::vector,
                        ${emb.model},
                        ${contentHash},
                        ${now},
                        ${now},
                        ${now}
                    )
                    ON CONFLICT (entity_type, entity_id)
                    DO UPDATE SET
                        admin_id = EXCLUDED.admin_id,
                        searchable_text = EXCLUDED.searchable_text,
                        embedding = EXCLUDED.embedding,
                        embedding_model = EXCLUDED.embedding_model,
                        content_hash = EXCLUDED.content_hash,
                        indexed_at = EXCLUDED.indexed_at,
                        updated_at = EXCLUDED.updated_at
                `;
    } catch (e) {
        throw new Error((e as Error).message);
    }
};
