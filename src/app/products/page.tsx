import { Metadata } from 'next';
import { Suspense } from 'react';
import { productsAPI } from '@/services/api/products-api';
import { categoriesAPI } from '@/services/api/categories-api';
import { ProductsInfiniteGrid } from '@/components/product/ProductsInfiniteGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductSort } from '@/components/product/ProductSort';
import { ProductViewToggle } from '@/components/product/ProductViewToggle';
import { PageHeaderSkeleton } from '@/components/ui/skeletons';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our wide selection of technology products in Uganda.',
};

interface ProductsSearchParams {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  minRating?: string;
  sortBy?: string;
  view?: string;
  page?: string;
}

interface ProductsPageProps {
  searchParams: Promise<ProductsSearchParams>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;
  const minRating = resolvedSearchParams.minRating ? Number(resolvedSearchParams.minRating) : undefined;
  const filters = {
    search: resolvedSearchParams.search,
    categoryId: resolvedSearchParams.categoryId,
    minPrice,
    maxPrice,
    minRating,
    sortBy: resolvedSearchParams.sortBy,
  };
  // Infinite scroll always starts from page 1 - filter changes (search/category/sort)
  // reset the list rather than resuming from wherever ?page= last pointed.
  const [{ products, totalCount, hasNextPage }, { categories }] = await Promise.all([
    productsAPI.getProducts({ ...filters, page: 1, limit: 12 }),
    categoriesAPI.getCategories({ limit: 20 }),
  ]);

  const activeCategory = categories.find((c) => c.id === resolvedSearchParams.categoryId);
  const view = resolvedSearchParams.view === 'list' ? 'list' : 'grid';

  return (
    <main className="flex-1">
        <div className="container py-6">
          <Suspense fallback={<PageHeaderSkeleton />}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                <p className="text-muted-foreground">
                  Discover the best technology products in Uganda
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <ProductSort currentSortBy={resolvedSearchParams.sortBy} />
              </div>
            </div>
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ProductFilters
                categories={categories}
                currentCategoryId={resolvedSearchParams.categoryId}
                currentMinPrice={minPrice}
                currentMaxPrice={maxPrice}
                currentMinRating={minRating}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{totalCount} Products</Badge>
                  <span className="text-sm text-muted-foreground">
                    {activeCategory ? `showing results for ${activeCategory.name}` : 'showing results for all products'}
                  </span>
                </div>
                <ProductViewToggle currentView={view} />
              </div>

              <ProductsInfiniteGrid initialProducts={products} initialHasNextPage={hasNextPage} filters={filters} view={view} />
            </div>
          </div>
        </div>
    </main>
  );
}