"use client";

import { useEffect, useRef } from "react";

interface UseInfiniteScrollProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void | Promise<void>;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  hasMore,
  loading,
  onLoadMore,
  rootMargin = "300px",
}: UseInfiniteScrollProps) => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const target = targetRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (
          entry.isIntersecting &&
          hasMore &&
          !loading
        ) {
          await onLoadMore();
        }
      },
      {
        rootMargin,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, onLoadMore, rootMargin]);

  return {
    targetRef,
  };
};