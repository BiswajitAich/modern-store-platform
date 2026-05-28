"use client"
import CatCard from "@/app/_components/card/CatCard";
import SectionHeading from "@/app/_components/common/SectionHeading";
import styles from "../store.module.css"
import { useInfiniteScroll } from "@/app/_hooks/useInfiniteScroll";
import { useState, useTransition, useCallback } from "react";
import { CategoryCardDTO } from "@/app/_lib/db/types/category.types";
import { LoadingSpinner } from "@/app/loading";
import { loadMoreStoreCategoryAction } from "./storeCategory.action";
import Link from "next/link";
interface CategoryInfiniteGridDTO {
    initials: {
        items: CategoryCardDTO[];
        hasMore: boolean;
        nextCursor: string | number | null;
    };
    storeSlug: string;
    slugs?: string[];
}

const CategoryInfiniteGrid = ({ initials, storeSlug, slugs }: CategoryInfiniteGridDTO) => {
    const [items, setItems] = useState(initials.items);
    const [hasMore, setHasMore] = useState(initials.hasMore);
    const [cursor, setCursor] = useState(initials.nextCursor);
    const [isPending, startTransition] = useTransition();
    const slugKey = slugs?.join("-");
    const isRoot = (!slugs || slugs.length === 0);
    const loadMore = useCallback(() => {
        if (cursor == null || isPending || !hasMore) return;
        const processScrollData = async () => {
            try {
                const data = await loadMoreStoreCategoryAction({
                    storeSlug,
                    slugs,
                    cursor: Number(cursor),
                });

                if (!data) {
                    return;
                }

                setItems((prev) => {
                    const map = new Map(
                        [...prev, ...data.items].map((item) => [item.id, item])
                    );
                    return Array.from(map.values());
                });

                setCursor(data.nextCursor);
                setHasMore(data.hasMore);
            } catch (error) {
                console.error(error);
            }
        }
        startTransition(() => {
            void processScrollData();
        });
    }, [cursor, isPending, hasMore, storeSlug, slugKey]);

    const { targetRef } = useInfiniteScroll({
        hasMore,
        loading: isPending,
        onLoadMore: loadMore,
    });

    return (
        <div style={{ width: "100%" }}>
            <SectionHeading
                title="Categories"
                subtitle="Browse all available categories"
            />
            <div className={styles.categoriesWrapper}>
                <div className={styles.categoriesGrid}>
                    {items.map((cat, _) => {
                        return (
                            <CatCard
                                key={cat.id}
                                categories={cat}
                                slugs={slugs}
                            />
                        );
                    })}
                </div>
                {!isRoot && (<div ref={targetRef} style={{
                    height: "1px",
                    width: "100%",
                }} />)
                }
                {isPending && (
                    <div className={styles.loading} aria-live="polite">
                        <LoadingSpinner />
                    </div>
                )}
                {isRoot ? (
                    <Link href={`/s/${storeSlug}/categories`}
                        className={`${styles.endMessage} ${styles.endMessageLink}`}>
                        {'View all categories '} &rsaquo;
                    </Link>
                ) : (<>
                    {!hasMore && items.length > 0 && (
                        <div className={styles.endMessage}>
                            No more Category
                        </div>
                    )}
                </>)}
            </div>
        </div>
    );
}

export default CategoryInfiniteGrid;