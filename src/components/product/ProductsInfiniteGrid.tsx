'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { productsAPI } from '@/services/api/products-api';
import { ProductCard } from '@/components/product/ProductCard';
import { Icons } from '@/components/ui/icons';
import type { Product } from '@/types';

interface ProductFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
}

interface ProductsInfiniteGridProps {
  initialProducts: Product[];
  initialHasNextPage: boolean;
  filters: ProductFilters;
  view: 'grid' | 'list';
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ProductsInfiniteGrid({ initialProducts, initialHasNextPage, filters, view }: ProductsInfiniteGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialHasNextPage);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Filters changed (new search/category/sort/etc) - the parent Server Component
  // already re-fetched page 1 for us, so just reset local state to match instead of
  // appending onto a now-stale list.
  useEffect(() => {
    setProducts(initialProducts);
    setPage(1);
    setHasMore(initialHasNextPage);
  }, [initialProducts, initialHasNextPage]);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await productsAPI.getProducts({ ...filters, page: nextPage, limit: 12 });
      setProducts((prev) => [...prev, ...result.products]);
      setPage(nextPage);
      setHasMore(result.hasNextPage);
    } catch {
      setHasMore(false);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [page, hasMore, filters]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver((entries) => entries[0].isIntersecting && loadMore(), {
      rootMargin: '400px',
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters.</p>
      </div>
    );
  }

  if (view === 'list') {
    return (
      <div className="space-y-8">
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} layout="list" />
          ))}
        </div>
        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-4">
            {loading && <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div key={product.id} variants={item}>
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loading && <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}
