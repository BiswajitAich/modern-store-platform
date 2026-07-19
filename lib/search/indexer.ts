import { createHash } from "crypto";
import prisma from "../prisma";
import { batchEmbed } from "../ai/client";
import { buildSearchDocument, productSearchSelect } from "./builder";

const PAGE_SIZE = 10;
const MAX_RETRIES = 3;

type ProductForIndex = Awaited<ReturnType<typeof fetchProductPage>>[number];

async function withRetry<T>(
    fn: () => Promise<T>,
    retries = MAX_RETRIES,
): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (attempt === retries) throw err;
            console.warn(`Retry ${attempt}/${retries} after error:`, err);
            await new Promise((r) => setTimeout(r, 1000 * attempt));
        }
    }
    throw new Error("unreachable");
}

async function fetchProductPage(cursor: number | undefined) {
    return prisma.product.findMany({
        take: PAGE_SIZE,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { id: "asc" },
        select: productSearchSelect,
    });
}

async function indexBatch(batch: ProductForIndex[]) {
    const searchTexts = batch.map(buildSearchDocument);
    const hashes = searchTexts.map((text) =>
        createHash("sha256").update(text).digest("hex"),
    );

    const ids = batch.map((p) => p.id);
    const existing = await withRetry(
        () =>
            prisma.$queryRaw<{ entity_id: number; content_hash: string }[]>`
      SELECT entity_id, content_hash
      FROM search_documents
      WHERE "entityType" = 'PRODUCT'
        AND entity_id = ANY(${ids}::int[])
    `,
    );
    const existingHashes = new Map(
        existing.map((doc) => [doc.entity_id, doc.content_hash]),
    );

    const toIndex: { product: ProductForIndex; text: string; hash: string }[] = [];
    batch.forEach((product, i) => {
        if (existingHashes.get(product.id) === hashes[i]) return;
        toIndex.push({ product, text: searchTexts[i], hash: hashes[i] });
    });

    if (toIndex.length === 0) {
        console.log(`Batch skipped (${batch.length} unchanged).`);
        return;
    }

    const embeddingResult = await withRetry(() =>
        batchEmbed(toIndex.map((t) => t.text)),
    );
    function vectorToPg(vector: number[]) {
        return `[${vector.join(",")}]`;
    }

    await withRetry(() =>
        prisma.$transaction(
            toIndex.map(({ product, text, hash }, i) => {
                const vector = vectorToPg(embeddingResult.embeddings[i]);
                return prisma.$executeRaw`
          INSERT INTO search_documents (
            entity_id, "entityType", admin_id, "productId",
            searchable_text, embedding, embedding_model,
            content_hash, indexed_at, "createdAt", "updatedAt"
          )
          VALUES (
            ${product.id}, 'PRODUCT', ${product.adminId}, ${product.id},
            ${text}, ${vector}::vector, ${embeddingResult.model},
            ${hash}, NOW(), NOW(), NOW()
          )
          ON CONFLICT ("entityType", entity_id)
          DO UPDATE SET
            searchable_text = EXCLUDED.searchable_text,
            embedding        = EXCLUDED.embedding,
            embedding_model  = EXCLUDED.embedding_model,
            content_hash     = EXCLUDED.content_hash,
            indexed_at       = EXCLUDED.indexed_at,
            "updatedAt"      = NOW()
        `;
            }),
        ),
    );

    console.log(`Indexed ${toIndex.length}/${batch.length} products in batch.`);
}
export async function indexAllProducts() {
    let cursor: number | undefined;
    let totalSeen = 0;

    while (true) {
        const products = await withRetry(() => fetchProductPage(cursor));
        if (products.length === 0) break;

        await indexBatch(products);

        totalSeen += products.length;
        cursor = products[products.length - 1].id;
    }

    console.log(`Finished indexing. Total products processed: ${totalSeen}.`);
}
