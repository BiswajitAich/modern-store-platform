import { embed } from "@/lib/ai/client";
import prisma from "@/lib/prisma";
import { getEmbedding, setEmbedding } from "@/lib/search/embedding-cache";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const q = searchParams.get("q");
        const store = searchParams.get("store");

        if (!q) {
            return NextResponse.json(
                { message: "Missing query" },
                { status: 400 },
            );
        }

        const query = q
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, "")
            .replace(/\s+/g, " ")
            .trim();
        if (query.length < 3) {
            return NextResponse.json([]);
        }
        const cached = getEmbedding(query);
        let vector = null;
        if (
            cached &&
            cached.startsWith("[") &&
            cached.endsWith("]") &&
            cached.length > 10
        ) {
            vector = cached;
        } else {
            const embeddingResult = await embed(query);
            if (embeddingResult.embedding.length === 0) {
                throw new Error("Empty embedding");
            }
            vector = `[${embeddingResult.embedding.join(",")}]`;
            setEmbedding(query, vector);
        }
        let adminId: string | undefined;
        if (store) {
            const admin = await prisma.admin.findUnique({
                where: { storeSlug: store },
                select: { adminId: true },
            });
            if (!admin) {
                return NextResponse.json(
                    { message: "Store not found" },
                    { status: 404 },
                );
            }
            adminId = admin.adminId;
        }

        // console.log("2. ========================");
        console.log("Cached:", !!cached);
        console.log("Vector length:", vector.length);
        console.log("Vector start:", vector.slice(0, 80));
        console.log("Vector end:", vector.slice(-80));
        // console.log("2. ========================");
        let rows: any[];
        try {
            rows = adminId
                ? await prisma.$queryRaw`
              SELECT entity_id, admin_id, 1 - (embedding <=> ${vector}::vector) AS distance
              FROM search_documents
              WHERE entity_type = 'PRODUCT' AND admin_id = ${adminId}
              ORDER BY embedding <=> ${vector}::vector
              LIMIT 20;
            `
                : await prisma.$queryRaw`
              SELECT entity_id, admin_id, 1 - (embedding <=> ${vector}::vector) AS distance
              FROM search_documents
              WHERE entity_type = 'PRODUCT'
              ORDER BY embedding <=> ${vector}::vector
              LIMIT 20;
            `;
        } catch {
            console.warn("Vector search failed, falling back to text search");
            rows = adminId
                ? await prisma.$queryRaw`
              SELECT entity_id, admin_id, 0 AS distance
              FROM search_documents
              WHERE entity_type = 'PRODUCT' AND admin_id = ${adminId}
                AND searchable_text ILIKE ${"%" + query + "%"}
              LIMIT 20;
            `
                : await prisma.$queryRaw`
              SELECT entity_id, admin_id, 0 AS distance
              FROM search_documents
              WHERE entity_type = 'PRODUCT'
                AND searchable_text ILIKE${"%" + query + "%"}
              LIMIT 20;
            `;
        }
        if (!rows || (rows as any[]).length === 0) {
            return NextResponse.json([]);
        }

        const ids = (rows as any[]).map((r: any) => r.entity_id);
        const products = await prisma.product.findMany({
            where: {
                id: { in: ids },
                ...(adminId ? { adminId } : {}),
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                brand: true,
                slug: true,
                description: true,
                isFeatured: true,
                variants: {
                    where: {
                        isActive: true,
                    },
                    select: {
                        images: {
                            select: {
                                image: true,
                            },
                        },
                    },
                    take: 1,
                    orderBy: {
                        displayOrder: "asc",
                    },
                },
                admin: {
                    select: { storeSlug: true },
                },
            },
        });

        const productMap = new Map(products.map((p) => [p.id, p]));
        const ordered = (rows as any[])
            .map((r) => productMap.get(r.entity_id))
            .filter(Boolean);

        console.log(ordered);
        return NextResponse.json(ordered);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Search failed" }, { status: 500 });
    }
}
