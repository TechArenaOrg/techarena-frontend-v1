import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { ordersAPI } from '@/services/api/orders-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';

export const metadata: Metadata = {
  title: 'Orders',
  description: 'Orders containing your products.',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function VendorOrdersPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const { orders, totalCount, totalPages, hasNextPage, hasPreviousPage } = await ordersAPI.getVendorOrders(
    { page: currentPage, limit: 20 },
    token
  );

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            {totalCount} order{totalCount !== 1 ? 's' : ''} containing your products
          </p>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No orders yet.</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-6 py-3 font-semibold text-foreground">Order</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Date</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Items</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Total</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Order Status</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
                          <td className="px-6 py-3 font-semibold text-primary">{order.orderNumber}</td>
                          <td className="px-6 py-3 text-muted-foreground">{new Date(order.placedAt).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-muted-foreground">{order.items.length}</td>
                          <td className="px-6 py-3 text-right">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-6 py-3">
                            <OrderStatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/vendor/orders/${order.id}`}>View</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-primary">{order.orderNumber}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.placedAt).toLocaleDateString()} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/vendor/orders/${order.id}`}>View</Link>
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
