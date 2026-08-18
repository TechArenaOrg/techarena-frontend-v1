import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { vendorAPI } from '@/services/api/vendor-api';
import { productsAPI } from '@/services/api/products-api';
import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'New Purchase Order',
  description: 'Record a new supplier restocking order.',
};

export default async function NewVendorPurchaseOrderPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');
  const role = (session.user as any).role;
  if (role !== 'vendor') redirect(role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard');

  const token = (session as any).accessToken;
  const { vendor } = await vendorAPI.getMyDashboard(token);
  const { products } = await productsAPI.getProducts({ vendorId: vendor.id, limit: 200 }, token);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/vendor/purchase-orders" label="Back to Purchase Orders" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">New Purchase Order</h1>
        <PurchaseOrderForm
          returnPath="/vendor/purchase-orders"
          products={products.map((p) => ({ id: p.id, name: p.name, sku: p.sku }))}
        />
      </div>
    </main>
  );
}
