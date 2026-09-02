import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoriesAPI } from '@/services/api/categories-api';
import { productsAPI } from '@/services/api/products-api';
import { ProductsInfiniteGrid } from '@/components/product/ProductsInfiniteGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductSort } from '@/components/product/ProductSort';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Badge } from '@/components/ui/badge';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const category = await categoriesAPI.getCategory(resolvedParams.slug);

    return {
      title: `${category.name} - TechArena Uganda`,
      description: `Shop ${category.name.toLowerCase()} at TechArena. ${category.description}`,
      keywords: `${category.name}, technology, electronics, Uganda, TechArena`,
    };
  } catch {
    return {
      title: 'Category Not Found - TechArena Uganda',
      description: 'The requested category could not be found.',
    };
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  try {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const [category, { categories }] = await Promise.all([
      categoriesAPI.getCategory(resolvedParams.slug),
      categoriesAPI.getCategories({ limit: 20 }),
    ]);

    const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
    const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;
    const filters = {
      search: resolvedSearchParams.search,
      categoryId: category.id,
      minPrice,
      maxPrice,
      sortBy: resolvedSearchParams.sortBy,
    };
    // Infinite scroll always starts from page 1 - filter changes (search/price/sort)
    // reset the list rather than resuming from wherever ?page= last pointed.
    const { products, totalCount, hasNextPage } = await productsAPI.getProducts({ ...filters, page: 1, limit: 12 });

    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Categories', href: '/categories' },
      { label: category.name, href: `/category/${category.slug}` },
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mt-6">
          {/* Category Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                <span className="text-4xl">{category.icon}</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {category.name}
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
              {category.description}
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="text-sm">
                {totalCount} products
              </Badge>
              {category.isFeatured && (
                <Badge className="bg-orange-500 text-white border-0">
                  Featured Category
                </Badge>
              )}
            </div>
          </div>
          
          <div className="lg:grid lg:grid-cols-5 lg:gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24">
                <Suspense fallback={<div>Loading filters...</div>}>
                  <ProductFilters categories={categories} currentCategoryId={category.id} />
                </Suspense>
              </div>
            </aside>
            
            {/* Main Content */}
            <main className="lg:col-span-4">
              {/* Sort and Results Count */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {totalCount} products in {category.name}
                    {resolvedSearchParams.search && (
                      <span> matching "{resolvedSearchParams.search}"</span>
                    )}
                  </p>
                </div>
                <ProductSort currentSortBy={resolvedSearchParams.sortBy} basePath={`/category/${category.slug}`} />
              </div>
              
              {/* Products Grid */}
              <ProductsInfiniteGrid initialProducts={products} initialHasNextPage={hasNextPage} filters={filters} view="grid" />
            </main>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}