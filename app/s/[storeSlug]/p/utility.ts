import crypto from "crypto";
const SYSTEM_PARAMS = ["image"];

export const normalizeSearchParams = (
    searchParams: {
        [key: string]: string | string[] | undefined;
    }
): Record<string, string> => {
    return Object.fromEntries(
        Object.entries(searchParams)
            .filter(
                ([key, value]) =>
                    typeof value === "string" && !SYSTEM_PARAMS.includes(key)
            )
            .map(([key, value]) => [key, value])
    ) as Record<string, string>;
};

export const generateVariantKey = (
    options: Record<string, string>
) => {
    return Object.entries(options)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(
            ([key, value]) =>
                `${key.toLowerCase()}:${value.toLowerCase().trim()}`
        )
        .join("|");
};

export const generateVariantHash = (
    searchParams: {
        [key: string]: string | string[] | undefined;
    }
): string | undefined => {
    const normalized = normalizeSearchParams(searchParams);
    if (Object.keys(normalized).length === 0) return undefined;
    const key = generateVariantKey(normalized);
    return crypto.createHash("sha256").update(key).digest("hex");
};

export const buildProductUrl = (
    storeSlug: string,
    slug: string,
    options?: { key: string; value: string }[],
) => {
    const baseUrl = `/s/${storeSlug}/p/${slug}`;
    if (!options?.length) return baseUrl;

    const params = new URLSearchParams();
    options.forEach((option) => params.set(option.key, option.value));
    return `${baseUrl}?${params.toString()}`;
};

export const buildCategoryPath = (
  storeSlug: string,
  slugs?: string[],
  newSlug?: string
) => {
  const full = [...(slugs ?? []), ...(newSlug ? [newSlug] : [])];
  return `/s/${storeSlug}/c/${full.join("/")}`;
};