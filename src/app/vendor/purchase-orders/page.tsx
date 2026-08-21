import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { purchaseOrderAPI } from '@/services/api/purchase-order-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { productsAPI } from '@/services/api/products-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { ReceivedFilter } from '@/components/purchase-orders/ReceivedFilter';
import { PurchaseOrderFormDialog } from '@/components/purchase-orders/PurchaseOrderFormDialog';

export const metadata: Metadata = {
  title: 'Purchase Orders',
  description: 'Track supplier restocking orders.',
};

interface PageProps {
  searchParams: Promise<{ received?: string; page?: string }>;
}

export default async function VendorPurchaseOrdersPage({ searchParams }: PageProps) {
  const session = await auth();
  
  const token = (session as any).accessToken;
  const { received, page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const [{ purchaseOrders, totalCount, totalPages, hasNextPage, hasPreviousPage }, dashboard] = await Promise.all([
    purchaseOrderAPI.getPurchaseOrders(
      { received: received === undefined ? undefined : received === 'true', page: currentPage, limit: 20 },
      token
    ),
    vendorAPI.getMyDashboard(token).catch(() => null),
  ]);
  // Only used to populate the New Purchase Order dialog's product picker - a hiccup
  // fetching either shouldn't take down the whole order list.
  const { products } = dashboard
    ? await productsAPI.getProducts({ vendorId: dashboard.vendor.id, limit: 200 }, token).catch(() => ({ products: [] }))
    : { products: [] };
  const productOptions = products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }));

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">
              {totalCount} order{totalCount !== 1 ? 's' : ''} placed with suppliers
            </p>
          </div>
          <div className="flex items-end gap-4">
            <ReceivedFilter currentValue={received} basePath="/vendor/purchase-orders" />
            <PurchaseOrderFormDialog
              products={productOptions}
              trigger={
                <Button>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  New Purchase Order
                </Button>
              }
            />
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No purchase orders match these filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Supplier</th>
                      <th className="px-6 py-3 font-medium">Order Date</th>
                      <th className="px-6 py-3 font-medium">Items</th>
                      <th className="px-6 py-3 font-medium text-right">Total</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {purchaseOrders.map((po) => (
                      <tr key={po.id}>
                        <td className="px-6 py-3 font-medium">{po.supplierName}</td>
                        <td className="px-6 py-3 text-muted-foreground">{new Date(po.orderDate).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-muted-foreground">{po.items.length}</td>
                        <td className="px-6 py-3 text-right">{formatCurrency(po.totalAmount)}</td>
                        <td className="px-6 py-3">
                          <Badge variant={po.isReceived ? 'success' : 'warning'}>{po.isReceived ? 'Received' : 'Pending'}</Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/vendor/purchase-orders/${po.id}`}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} />
          </div>
        )}
      </div>
    </main>
  );
}
