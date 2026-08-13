import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { productsAPI } from '@/services/api/products-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { DeleteProductButton } from '@/components/vendor/DeleteProductButton';

export const metadata: Metadata = {
  title: 'All Products',
  description: 'Moderate product listings across the platform.',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;
  const { products, totalCount, totalPages, hasNextPage, hasPreviousPage } = await productsAPI.getProducts(
    { page: currentPage, limit: 20 },
    token
  );

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
            <p className="text-muted-foreground">
              {totalCount} product{totalCount !== 1 ? 's' : ''} across the platform
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/products/new">
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
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
                  <div key={product.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.vendor?.businessName ?? 'Unknown vendor'} • SKU: {product.sku} •{' '}
                          {formatCurrency(product.price)} • {product.stockQuantity} in stock
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
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
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
                      </Button>
                      <DeleteProductButton productId={product.id} productName={product.name} />
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
