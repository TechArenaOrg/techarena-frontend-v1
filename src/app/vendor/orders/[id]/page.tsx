import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { ordersAPI } from '@/services/api/orders-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackLink } from '@/components/ui/back-link';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { OrderItemStatusSelect } from '@/components/order/OrderItemStatusSelect';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View and update your items on an order.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendorOrderDetailPage({ params }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { id } = await params;

  const [order, { vendor }] = await Promise.all([
    ordersAPI.getVendorOrder(id, token),
    vendorAPI.getMyDashboard(token),
  ]);
  if (!order) notFound();

  // /vendor/orders is already scoped to this vendor, but an order can span multiple
  // vendors - only show/act on the items that are actually this vendor's own.
  const myItems = order.items.filter((item) => item.vendorId === vendor.id);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/vendor/orders" label="Back to Orders" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{order.orderNumber}</h1>
            <p className="text-muted-foreground">Placed {new Date(order.placedAt).toLocaleString()}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>{order.shippingAddress.streetAddress}</p>
            {order.shippingAddress.apartment && <p>{order.shippingAddress.apartment}</p>}
            <p>
              {order.shippingAddress.city}
              {order.shippingAddress.stateProvince ? `, ${order.shippingAddress.stateProvince}` : ''}
            </p>
            <p>{order.shippingAddress.country}</p>
            {order.customerPhone && <p>{order.customerPhone}</p>}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Your Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium text-right">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {myItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-3 font-medium">{item.productName}</td>
                      <td className="px-6 py-3 text-right">{item.quantity}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(item.totalPrice)}</td>
                      <td className="px-6 py-3">
                        <OrderItemStatusSelect orderId={order.id} itemId={item.id} currentStatus={item.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden divide-y">
              {myItems.map((item) => (
                <div key={item.id} className="p-4 space-y-2">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty {item.quantity} • {formatCurrency(item.totalPrice)}
                  </p>
                  <OrderItemStatusSelect orderId={order.id} itemId={item.id} currentStatus={item.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
