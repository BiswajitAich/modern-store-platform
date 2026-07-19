"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "../_styles/SearchComponent.module.css";
import Image from "next/image";

type Product = {
    id: number;
    name: string;
    brand: string | null;
    slug: string;
    description: string | null;
    categoryId: number;
    isFeatured: boolean;
    variants: {
        images: {
            image: string;
        }[];
    }[];
    admin: {
        storeSlug: string;
    };
};

const SearchComponent = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const store = searchParams.get("store");

    const abortRef = useRef<AbortController | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const cache = useRef(new Map<string, Product[]>());

    useEffect(() => {
        const q = searchQuery
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, "")
            .replace(/\s+/g, " ")
            .trim();

        if (!q || q.length < 3 || q.length > 100) {
            setResults([]);
            setLoading(false);
            setError(null);
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            if (cache.current.has(q)) {
              setResults(cache.current.get(q)!);
              setLoading(false);
              setError(null);
              return;
            }
            setLoading(true);
            setError(null);
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            (async () => {
                try {
                    const url = store
                        ? `/api/search?q=${encodeURIComponent(q)}&store=${encodeURIComponent(store)}`
                        : `/api/search?q=${encodeURIComponent(q)}`;

                    const res = await fetch(url, { signal: controller.signal });

                    if (!res.ok) {
                        setError("Something went wrong. Please try again.");
                        setResults([]);
                        return;
                    }

                    const data = await res.json();
                    const products = Array.isArray(data) ? data : [];

                    // Limit cache size (FIFO)
                    if (cache.current.size >= 100) {
                        const oldestKey = cache.current.keys().next().value;
                        if (oldestKey !== undefined) {
                            cache.current.delete(oldestKey);
                        }
                    }

                    cache.current.set(q, products);
                    setResults(products);
                } catch (err: any) {
                    if (err.name !== "AbortError") {
                        setError("Something went wrong. Please try again.");
                        setResults([]);
                    }
                } finally {
                    setLoading(false);
                }
            })();
        }, 1000);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, store]);

    const handleClear = () => {
        setSearchQuery("");
        setResults([]);
    };

    const trimmedQuery = searchQuery.trim();

    return (
        <main className={styles.containerWraper}>
            <div className={styles.container} ref={containerRef}>
                <div className={styles.inputWrapper}>
                    <svg
                        className={styles.searchIcon}
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>

                    <input
                        type="text"
                        name="q-nocache"
                        autoComplete="off"
                        autoCorrect="on"
                        spellCheck="true"
                        className={styles.input}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label="Search products"
                    />

                    {searchQuery && (
                        <button
                            type="button"
                            className={styles.clearButton}
                            onClick={handleClear}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Initial / idle state */}
                {!trimmedQuery && results.length === 0 && (
                    <div className={styles.statusState}>
                        <svg viewBox="0 0 400 300" width="100%" height="100%">
                            <rect
                                width="100%"
                                height="100%"
                                fill="transparent"
                            />
                            <g transform="translate(0, -10)">
                                <rect
                                    x="145"
                                    y="115"
                                    width="110"
                                    height="65"
                                    rx="8"
                                    fill="transparent"
                                    stroke="var(--color-primary)"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                                <line
                                    x1="155"
                                    y1="127"
                                    x2="210"
                                    y2="127"
                                    stroke="var(--border-color)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="155"
                                    y1="137"
                                    x2="195"
                                    y2="137"
                                    stroke="var(--border-color)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                <line
                                    x1="155"
                                    y1="147"
                                    x2="180"
                                    y2="147"
                                    stroke="var(--border-color)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                <circle
                                    cx="215"
                                    cy="135"
                                    r="28"
                                    fill="transparent"
                                    stroke="var(--color-primary)"
                                    strokeWidth="2.5"
                                />
                                <path
                                    d="M 235 155 L 265 185 A 4 4 0 0 1 259 191 L 229 161 A 4 4 0 0 1 235 155 Z"
                                    fill="transparent"
                                    stroke="var(--color-primary)"
                                    strokeWidth="2"
                                    strokeLinejoin="round"
                                />
                            </g>
                        </svg>
                        <span>
                            Start typing to search products across the store
                        </span>
                    </div>
                )}

                {/* Query too short */}
                {trimmedQuery.length > 0 &&
                    trimmedQuery.length < 3 &&
                    results.length === 0 && (
                        <div className={styles.statusState}>
                            Keep typing — at least 3 characters needed to
                            search.
                        </div>
                    )}

                {/* No results */}
                {trimmedQuery.length >= 3 &&
                    !loading &&
                    !error &&
                    results.length === 0 && (
                        <div className={styles.statusState}>
                            <strong>
                                No results for &quot;{trimmedQuery}&quot;
                            </strong>
                            <span>
                                Try a different keyword or check your spelling.
                            </span>
                        </div>
                    )}

                {/* Loading */}
                {trimmedQuery.length >= 3 && loading && (
                    <div className={styles.loadingState}>
                        <span className={styles.spinner} />
                        Searching...
                    </div>
                )}

                {/* Error */}
                {trimmedQuery.length >= 3 && !loading && error && (
                    <div className={styles.errorState}>{error}</div>
                )}

                {/* Results */}
                {trimmedQuery.length >= 3 &&
                    !loading &&
                    !error &&
                    results.length > 0 && (
                        <ul className={styles.resultsList}>
                            {results.map((product) => {
                                const image =
                                    product.variants[0]?.images[0]?.image;
                                return (
                                    <li
                                        key={product.id}
                                        className={styles.resultItem}
                                    >
                                        <Link
                                            href={
                                                product.slug
                                                    ? `/s/${product.admin.storeSlug}/p/${product.slug}`
                                                    : `/s/${product.admin.storeSlug}`
                                            }
                                            className={styles.resultLink}
                                        >
                                            {image ? (
                                                <div
                                                    className={
                                                        styles.resultThumb
                                                    }
                                                >
                                                    <Image
                                                        src={`/api/image?imageId=${encodeURIComponent(image)}`}
                                                        height={52}
                                                        width={52}
                                                        alt={product.name}
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className={
                                                        styles.resultThumb
                                                    }
                                                >
                                                    {product.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                            )}

                                            <div className={styles.resultInfo}>
                                                <span
                                                    className={
                                                        styles.resultName
                                                    }
                                                >
                                                    {product.name}
                                                    {product.isFeatured && (
                                                        <span
                                                            className={
                                                                styles.featuredBadge
                                                            }
                                                        >
                                                            Featured
                                                        </span>
                                                    )}
                                                </span>
                                                {product.description && (
                                                    <span
                                                        className={
                                                            styles.resultDescription
                                                        }
                                                    >
                                                        {product.description}
                                                    </span>
                                                )}
                                                {product.brand && (
                                                    <span
                                                        className={
                                                            styles.resultBrand
                                                        }
                                                    >
                                                        {product.brand}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
            </div>
        </main>
    );
};

export default SearchComponent;
