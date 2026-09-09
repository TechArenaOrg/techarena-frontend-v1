import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { ordersAPI } from '@/services/api/orders-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackLink } from '@/components/ui/back-link';
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge';
import { CancelOrderButton } from '@/components/order/CancelOrderButton';

export const metadata: Metadata = {
  title: 'Order Details',
  description: 'View your order.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderDetailPage({ params }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { id } = await params;

  // GET /orders/:id is scoped server-side to the requester - a customer can only
  // ever get back their own order here, another customer's id 404s just like a
  // missing one.
  const order = await ordersAPI.getOrder(id, token).catch(() => null);
  if (!order) notFound();

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/account/orders" label="Back to My Orders" />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{order.orderNumber}</h1>
            <p className="text-muted-foreground">Placed {new Date(order.placedAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={order.status} />
            <CancelOrderButton orderId={order.id} status={order.status} />
          </div>
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
            <CardTitle className="text-base">Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium text-right">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-3 font-medium">{item.productName}</td>
                      <td className="px-6 py-3 text-right">{item.quantity}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(item.totalPrice)}</td>
                      <td className="px-6 py-3">
                        <Badge variant="outline">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatCurrency(order.shippingAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
