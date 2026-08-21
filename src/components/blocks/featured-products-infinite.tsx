'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { productsAPI } from '@/services/api/products-api';
import { FeaturedProductsGrid } from '@/components/blocks/featured-products-grid';
import { Icons } from '@/components/ui/icons';
import type { Product } from '@/types';

interface FeaturedProductsInfiniteProps {
  initialProducts: Product[];
  initialHasNextPage: boolean;
}

export function FeaturedProductsInfinite({ initialProducts, initialHasNextPage }: FeaturedProductsInfiniteProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasNextPage);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await productsAPI.getProducts({ isFeatured: true, page: nextPage, limit: 12 });
      setProducts((prev) => [...prev, ...result.products]);
      setPage(nextPage);
      setHasMore(result.hasNextPage);
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), {
      rootMargin: '400px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="space-y-8">
      <FeaturedProductsGrid products={products} />
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loading && <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}
