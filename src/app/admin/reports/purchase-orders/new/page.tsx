import { Metadata } from 'next';
import { auth } from '@/auth';
import { vendorAPI } from '@/services/api/vendor-api';
import { productsAPI } from '@/services/api/products-api';
import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'New Purchase Order',
  description: 'Record a new supplier restocking order.',
};

export default async function NewAdminPurchaseOrderPage() {
  const session = await auth();
  const token = (session as any).accessToken;

  const [vendors, { products }] = await Promise.all([
    vendorAPI.getVendors(token).catch(() => []),
    productsAPI.getProducts({ limit: 200 }, token).catch(() => ({ products: [] })),
  ]);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/admin/reports/purchase-orders" label="Back to Purchase Orders" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">New Purchase Order</h1>
        <PurchaseOrderForm
          returnPath="/admin/reports/purchase-orders"
          products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }))}
          vendors={vendors}
        />
      </div>
    </main>
  );
}
