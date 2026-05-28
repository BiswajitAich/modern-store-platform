interface ExtractCursorPageParams<T> {
  items: T[];
  take: number;
}

export function extractCursorPage<T extends { id: number | string }>({
  items,
  take,
}: ExtractCursorPageParams<T>) {
  const hasMore = items.length > take;

  const finalItems = hasMore
    ? items.slice(0, take)
    : items;

  return {
    items: finalItems,
    hasMore,
    nextCursor: hasMore
      ? finalItems[finalItems.length - 1]?.id
      : null,
  };
}