import { after } from "next/server";
import { rebuildSearchDocument } from "@/app/admin/_lib/rebuildSearchDocument";

const pendingProducts = new Set<number>();
const inFlight = new Set<number>();

async function runReindex(productId: number) {
    if (inFlight.has(productId)) return;
    inFlight.add(productId);
    try {
        await rebuildSearchDocument(productId);
    } catch (err) {
        console.error(`[Search Index] Product ${productId}`, err);
    } finally {
        inFlight.delete(productId);
    }
}

export function queueProductReindex(productId: number) {
    if (pendingProducts.has(productId)) return;
    pendingProducts.add(productId);

    after(async () => {
        pendingProducts.delete(productId);
        await runReindex(productId);
    });
}

const SEARCH_RELEVANT_FIELDS = new Set([
    "name",
    "description",
    "brand",
    "categoryId",
    "isActive",
    "options",
    "sku",
    "price",
]);

export function isSearchRelevantChange(changedFields: string[]): boolean {
    return changedFields.some((f) => SEARCH_RELEVANT_FIELDS.has(f));
}
