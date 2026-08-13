import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { vendorAPI } from '@/services/api/vendor-api';
import { productsAPI } from '@/services/api/products-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { DeleteProductButton } from '@/components/vendor/DeleteProductButton';

export const metadata: Metadata = {
  title: 'My Products',
  description: 'Manage your product listings.',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function VendorProductsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role !== 'vendor') {
    redirect(role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard');
  }

  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const token = (session as any).accessToken;
  const { vendor } = await vendorAPI.getMyDashboard(token);
  const { products, totalCount, totalPages, hasNextPage, hasPreviousPage } = await productsAPI.getProducts(
    { vendorId: vendor.id, page: currentPage, limit: 20 },
    token
  );

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
            <p className="text-muted-foreground">{totalCount} product{totalCount !== 1 ? 's' : ''} in your store</p>
          </div>
          <Button asChild>
            <Link href="/vendor/products/new">
              <Icons.plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">You haven't listed any products yet.</p>
                <Button asChild>
                  <Link href="/vendor/products/new">Add your first product</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {products.map((product) => (
                  <div key={product.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        SKU: {product.sku} • {formatCurrency(product.price)} • {product.stockQuantity} in stock
                      </p>
                    </div>
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className="capitalize justify-self-center">
                      {product.status}
                    </Badge>
                    <div className="flex items-center gap-1 justify-self-end">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/vendor/products/${product.id}/edit`}>Edit</Link>
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
