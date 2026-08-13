import { Metadata } from 'next';
import { Suspense } from 'react';
import { productsAPI } from '@/services/api/products-api';
import { ProductCard } from '@/components/product/ProductCard';
import { PageHeaderSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our wide selection of technology products in Uganda.',
};

interface ProductsSearchParams {
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sortBy?: string;
  page?: string;
}

function ProductGrid({ products }: { products: Awaited<ReturnType<typeof productsAPI.getProducts>>['products'] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No products found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductFilters() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            <div className="space-y-2">
              {['Laptops', 'Smartphones', 'Tablets', 'Gaming', 'Accessories'].map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox id={category} />
                  <Label htmlFor={category}>{category}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Price Range</h3>
            <div className="px-3">
              <Slider
                defaultValue={[100000, 2000000]}
                max={5000000}
                min={0}
                step={50000}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>UGX 100,000</span>
                <span>UGX 2,000,000</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Brand</h3>
            <div className="space-y-2">
              {['Apple', 'Samsung', 'Dell', 'HP', 'Lenovo'].map((brand) => (
                <div key={brand} className="flex items-center space-x-2">
                  <Checkbox id={brand} />
                  <Label htmlFor={brand}>{brand}</Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Rating</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="flex items-center">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Icons.star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                    {Array.from({ length: 5 - rating }).map((_, i) => (
                      <Icons.star key={i} className="w-4 h-4 text-gray-300" />
                    ))}
                    <span className="ml-1">& Up</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Icons.x className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductsPageProps {
  searchParams: Promise<ProductsSearchParams>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1;
  const { products, totalCount, totalPages, hasNextPage, hasPreviousPage } = await productsAPI.getProducts({
    search: resolvedSearchParams.search,
    minPrice: resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined,
    maxPrice: resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined,
    sortBy: resolvedSearchParams.sortBy,
    page: currentPage,
    limit: 12,
  });

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
                <Select defaultValue="newest">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <ProductFilters />
            </div>

            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{totalCount} Products</Badge>
                  <span className="text-sm text-muted-foreground">showing results for all products</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="icon">
                    <Icons.grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Icons.list className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ProductGrid products={products} />

              <div className="mt-8 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                />
              </div>
            </div>
          </div>
        </div>
    </main>
  );
}