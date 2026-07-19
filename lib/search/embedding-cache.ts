const cache = new Map<string, string>();

export function getEmbedding(query: string) {
    return cache.get(query);
}

export function setEmbedding(query: string, embedding: string) {
    cache.set(query, embedding);
}
