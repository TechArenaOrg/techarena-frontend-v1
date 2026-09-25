import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { productsAPI } from '@/services/api/products-api';
import { categoriesAPI } from '@/services/api/categories-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { DeleteProductButton } from '@/components/vendor/DeleteProductButton';
import { ProductListFilters } from '@/components/product/ProductListFilters';
import { ProductFormDialog } from '@/components/vendor/ProductFormDialog';
import { AddProductDialog } from '@/components/vendor/AddProductDialog';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Moderate product listings across the platform.',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    categoryId?: string;
    lowStock?: string;
    isFeatured?: string;
    status?: string;
    vendorId?: string;
  }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { page: pageParam, search, categoryId, lowStock, isFeatured, status, vendorId } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;
  const effectiveStatus = status === 'all' ? undefined : ((status ?? 'active') as 'draft' | 'active' | 'inactive' | 'out_of_stock');

  // The backend is a Render free-tier deploy that intermittently drops connections
  // while cold-starting - if the core fetches fail, show a retry message instead of
  // leaving the page stuck on loading.tsx's spinner forever.
  let data;
  try {
    const [productsResult, categoriesResult, inactiveResult, vendors] = await Promise.all([
      productsAPI.getProducts(
        {
          search,
          categoryId,
          vendorId,
          lowStock: lowStock === 'true' ? true : undefined,
          isFeatured: isFeatured === 'true' ? true : undefined,
          status: effectiveStatus,
          page: currentPage,
          limit: 20,
        },
        token
      ),
      categoriesAPI.getCategories({ limit: 20 }),
      productsAPI.getProducts({ status: 'inactive', limit: 1 }, token),
      // Only used for the admin vendor-picker in the Add/Edit Product dialog - a
      // hiccup fetching it shouldn't take down the whole product list.
      vendorAPI.getVendors(token).catch(() => []),
    ]);
    data = { ...productsResult, categories: categoriesResult.categories, inactiveCount: inactiveResult.totalCount, vendors };
  } catch {
    return (
      <main className="flex-1 space-y-6 p-6">
        <div className="container">
          <div className="text-center py-32">
            <p className="text-muted-foreground mb-4">Couldn't load products right now. The server may still be starting up.</p>
            <Button asChild>
              <Link href="/admin/products">Try again</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }
  const { products, totalCount, totalPages, hasNextPage, hasPreviousPage, categories, inactiveCount, vendors } = data;

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
          <p className="text-muted-foreground">
            {totalCount} product{totalCount !== 1 ? 's' : ''} across the platform
            {inactiveCount > 0 && (
              <>
                {' • '}
                <Link href="/admin/products?status=inactive" className="underline hover:text-foreground">
                  {inactiveCount} inactive
                </Link>
              </>
            )}
          </p>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <ProductListFilters
              basePath="/admin/products"
              categories={categories}
              currentSearch={search}
              currentCategoryId={categoryId}
              currentLowStock={lowStock === 'true'}
              currentFeatured={isFeatured === 'true'}
              currentStatus={status}
              vendors={vendors}
              currentVendorId={vendorId}
            />
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <AddProductDialog
            categories={categories}
            vendors={vendors}
            trigger={
              <Button size="lg">
                <Icons.plus className="mr-2 h-5 w-5" />
                Add Product
              </Button>
            }
          />
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No products yet.</p>
              </div>
            ) : (
              <div className="divide-y">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-3 p-4 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-x-1">
                        <span>
                          {product.vendor?.businessName ?? 'Unknown vendor'} • SKU: {product.sku} •
                        </span>
                        <span className="font-medium text-foreground">{formatCurrency(product.price)}</span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="line-through">{formatCurrency(product.comparePrice)}</span>
                        )}
                        <span>•</span>
                        <span
                          className={
                            product.stockQuantity === 0
                              ? 'text-red-600 dark:text-red-400 font-medium'
                              : product.stockQuantity <= product.lowStockThreshold
                              ? 'text-orange-600 dark:text-orange-400 font-medium'
                              : ''
                          }
                        >
                          {product.stockQuantity === 0 ? 'Out of stock' : `${product.stockQuantity} in stock`}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:contents">
                      <div className="flex items-center gap-2 sm:justify-self-center">
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                          {product.status}
                        </Badge>
                        {product.isFeatured && (
                          <Badge className="bg-orange-500 text-white border-0">
                            <Icons.star className="mr-1 h-3 w-3 fill-current" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 sm:justify-self-end">
                        <ProductFormDialog
                          categories={categories}
                          vendors={vendors}
                          productId={product.id}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          }
                        />
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />
          </div>
        )}
      </div>
    </main>
  );
}
