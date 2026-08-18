import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { purchaseOrderAPI } from '@/services/api/purchase-order-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackLink } from '@/components/ui/back-link';
import { ReceivedToggleButton } from '@/components/purchase-orders/ReceivedToggleButton';
import { DeletePurchaseOrderButton } from '@/components/purchase-orders/DeletePurchaseOrderButton';

export const metadata: Metadata = {
  title: 'Purchase Order',
  description: 'View a supplier purchase order.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminPurchaseOrderDetailPage({ params }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { id } = await params;

  const po = await purchaseOrderAPI.getPurchaseOrder(id, token).catch(() => null);
  if (!po) notFound();

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/admin/reports/purchase-orders" label="Back to Purchase Orders" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{po.supplierName}</h1>
            <p className="text-muted-foreground">
              {po.vendor?.businessName ?? 'Platform-level'} • Ordered {new Date(po.orderDate).toLocaleDateString()}
              {po.receivedDate ? ` • Received ${new Date(po.receivedDate).toLocaleDateString()}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={po.isReceived ? 'success' : 'warning'}>{po.isReceived ? 'Received' : 'Pending'}</Badge>
            <ReceivedToggleButton purchaseOrderId={po.id} isReceived={po.isReceived} />
            <DeletePurchaseOrderButton purchaseOrderId={po.id} isReceived={po.isReceived} returnPath="/admin/reports/purchase-orders" />
          </div>
        </div>

        {po.notes && <p className="mt-4 text-sm text-muted-foreground">{po.notes}</p>}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium">Category</th>
                    <th className="px-6 py-3 font-medium text-right">Quantity</th>
                    <th className="px-6 py-3 font-medium text-right">Unit Cost</th>
                    <th className="px-6 py-3 font-medium text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {po.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-3 font-medium">{item.productName}</td>
                      <td className="px-6 py-3 text-muted-foreground">{item.categoryName ?? '—'}</td>
                      <td className="px-6 py-3 text-right">{item.quantity}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(item.unitCost)}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(item.quantity * item.unitCost)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold bg-muted/60 border-t-2">
                    <td className="px-6 py-3" colSpan={4}>
                      Total
                    </td>
                    <td className="px-6 py-3 text-right">{formatCurrency(po.totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
