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
import { Pagination } from '@/components/ui/pagination';
import { ExpenseDateRangeFilter } from '@/components/expenses/ExpenseDateRangeFilter';
import { ExpenseVendorFilter } from '@/components/expenses/ExpenseVendorFilter';
import { ReceivedFilter } from '@/components/purchase-orders/ReceivedFilter';
import { NewPurchaseOrderButton } from '@/components/purchase-orders/NewPurchaseOrderButton';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'Purchase Orders',
  description: 'Supplier restocking orders across the platform.',
};

interface PageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string; vendorId?: string; received?: string; page?: string }>;
}

export default async function AdminPurchaseOrdersPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { startDate, endDate, vendorId, received, page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const [{ purchaseOrders, totalCount, totalPages, hasNextPage, hasPreviousPage }, vendors, { products }] = await Promise.all([
    purchaseOrderAPI.getPurchaseOrders(
      { startDate, endDate, vendorId, received: received === undefined ? undefined : received === 'true', page: currentPage, limit: 20 },
      token
    ),
    // Both only used for the filter bar / New Purchase Order form - a hiccup
    // fetching either shouldn't take down the whole order list.
    vendorAPI.getVendors(token).catch(() => []),
    productsAPI.getProducts({ limit: 200 }, token).catch(() => ({ products: [] })),
  ]);
  const productOptions = products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }));

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <BackLink href="/admin/reports" label="Back to Reports" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-muted-foreground">
              {totalCount} order{totalCount !== 1 ? 's' : ''} placed with suppliers
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <ExpenseDateRangeFilter startDate={startDate} endDate={endDate} basePath="/admin/reports/purchase-orders" />
            <ExpenseVendorFilter vendors={vendors} currentVendorId={vendorId} basePath="/admin/reports/purchase-orders" />
            <ReceivedFilter currentValue={received} basePath="/admin/reports/purchase-orders" />
            <NewPurchaseOrderButton products={productOptions} vendors={vendors} />
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {purchaseOrders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No purchase orders match these filters.</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-6 py-3 font-semibold text-foreground">Supplier</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Vendor</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Order Date</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Items</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Total</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Status</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {purchaseOrders.map((po) => (
                        <tr key={po.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
                          <td className="px-6 py-3 font-medium">{po.supplierName}</td>
                          <td className="px-6 py-3 text-muted-foreground">{po.vendor?.businessName ?? 'Platform'}</td>
                          <td className="px-6 py-3 text-muted-foreground">{new Date(po.orderDate).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-muted-foreground">{po.items.length}</td>
                          <td className="px-6 py-3 text-right">{formatCurrency(po.totalAmount)}</td>
                          <td className="px-6 py-3">
                            <Badge variant={po.isReceived ? 'success' : 'warning'}>{po.isReceived ? 'Received' : 'Pending'}</Badge>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/reports/purchase-orders/${po.id}`}>View</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y">
                  {purchaseOrders.map((po) => (
                    <div key={po.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{po.supplierName}</p>
                        <Badge variant={po.isReceived ? 'success' : 'warning'} className="shrink-0">
                          {po.isReceived ? 'Received' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{po.vendor?.businessName ?? 'Platform'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(po.orderDate).toLocaleDateString()} • {po.items.length} item{po.items.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-medium">{formatCurrency(po.totalAmount)}</p>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/reports/purchase-orders/${po.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
