import { cacheTag } from "next/cache";
import { cacheLife } from "next/dist/server/use-cache/cache-life";

interface BatchEmbeddingResponse {
    embeddings: number[][];
    model: string;
    count: number;
    dimensions: number;
}
interface EmbeddingResponse {
    embedding: number[];
    model: string;
    dimensions: number;
}

export const batchEmbed = async (
    texts: string[],
): Promise<BatchEmbeddingResponse> => {
    const res = await fetch(`${process.env.DOCKER_ENDPOINT}embeddings/batch`, {
        method: "POST",
        body: JSON.stringify({ texts }),
        headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "An unknown error occurred.");
    }

    return data;
};

export const embed = async (text: string): Promise<EmbeddingResponse> => {
    "use cache";
    cacheLife("hours");
    cacheTag(text.replace(/ /g, "-"));

    const res = await fetch(`${process.env.DOCKER_ENDPOINT}embeddings`, {
        method: "POST",
        body: JSON.stringify({ text }),
        headers: { "Content-Type": "application/json" },
    });

    if (!res.ok) {
        throw new Error(`Embedding service returned ${res.status}`);
    }

    const data = await res.json();

    if (
        !data ||
        !Array.isArray(data.embedding) ||
        data.embedding.length === 0
    ) {
        throw new Error("Embedding service returned an invalid embedding.");
    }

    return data;
};
