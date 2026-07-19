"use client";
import Card from "@/app/_components/card/Card";
import SectionHeading from "@/app/_components/common/SectionHeading";
import styles from "../store.module.css";
import { ProductCardDTO } from "@/app/_lib/db/types/product.types";
import { useCallback, useState, useTransition } from "react";
import { useInfiniteScroll } from "@/app/_hooks/useInfiniteScroll";
import { loadMoreStoreProductsAction } from "./storeProduct.action";
import { LoadingSpinner } from "@/app/loading";
interface ProductInfiniteGridDTO {
    initials: {
        items: ProductCardDTO[];
        hasMore: boolean;
        nextCursor: string | number | null;
    };
    storeSlug: string;
    slugs?: string[];
}
const ProductInfiniteGrid = ({ initials, storeSlug, slugs }: ProductInfiniteGridDTO) => {
    const [items, setItems] = useState(initials.items);
    const [hasMore, setHasMore] = useState(initials.hasMore);
    const [cursor, setCursor] = useState(initials.nextCursor);
    const [isPending, startTransition] = useTransition();
    const slugKey = slugs?.join("-");

    const loadMore = useCallback(() => {
        if (cursor == null || isPending || !hasMore) return;
        const processScrollData = async () => {
            try {
                const data = await loadMoreStoreProductsAction({
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
        startTransition(async () => {
            await processScrollData();
        });
    }, [cursor, isPending, hasMore, storeSlug, slugKey]);

    const { targetRef } = useInfiniteScroll({
        hasMore,
        loading: isPending,
        onLoadMore: loadMore,
    });

    return (
        <section className={styles.section}>
            <SectionHeading
                title="Products"
            />
            {(!items || items.length === 0) ?
                (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>📂</div>
                        <p className={styles.emptyText}>No Products available now</p>
                    </div>
                ) :
                (
                    <div className={styles.categoriesWrapper}>
                        <div className={styles.categoriesGrid}>
                            {items.map((prod, _) => {
                                if (!prod) return null;
                                const hasDiscount =
                                    prod.variant.originalPrice &&
                                    prod.variant.price &&
                                    prod.variant.originalPrice > prod.variant.price;
                                const discountPercentage = hasDiscount
                                    ? Math.round(
                                        ((prod.variant.originalPrice! - prod.variant.price!) /
                                            prod.variant.originalPrice!) *
                                        100,
                                    )
                                    : 0;
                                return (
                                    <Card
                                        key={prod.id}
                                        data={prod}
                                        hasDiscount={hasDiscount ? true : false}
                                        discountPercentage={discountPercentage}
                                        showWishlistButton={false}
                                    />
                                );
                            })}
                        </div>
                        <div ref={targetRef} style={{
                            height: "1px",
                            width: "100%",
                        }} />
                        {isPending && (
                            <div className={styles.loading} aria-live="polite">
                                <LoadingSpinner />
                            </div>
                        )}
                        {!hasMore && items.length > 0 && (
                            <div className={styles.endMessage}>
                                No more products
                            </div>
                        )}

                    </div>
                )}
        </section>
    );
}

export default ProductInfiniteGrid;
