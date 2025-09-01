import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { mockAPI } from '@/services/api/mock-endpoints';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ProductFilters } from '@/components/product/ProductFilters';
import { ProductSort } from '@/components/product/ProductSort';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ProductCardSkeleton } from '@/components/ui/skeletons';
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
    const category = await mockAPI.categories.getCategory(resolvedParams.slug);
    
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
    const category = await mockAPI.categories.getCategory(resolvedParams.slug);
    
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
                {category.products?.length || 0} products
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
                  <ProductFilters categoryId={category.id} />
                </Suspense>
              </div>
            </aside>
            
            {/* Main Content */}
            <main className="lg:col-span-4">
              {/* Sort and Results Count */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.products?.length || 0} products in {category.name}
                    {resolvedSearchParams.search && (
                      <span> matching "{resolvedSearchParams.search}"</span>
                    )}
                  </p>
                </div>
                <ProductSort />
              </div>
              
              {/* Products Grid */}
              <Suspense fallback={
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              }>
                <ProductGrid 
                  searchParams={{
                    ...searchParams,
                    categoryId: category.id
                  }} 
                />
              </Suspense>
              
              {/* Empty State */}
              {category.products?.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl text-gray-400">{category.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    We're working on adding products to this category. Check back soon!
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}