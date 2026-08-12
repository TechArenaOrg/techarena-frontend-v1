import { Metadata } from 'next';
import { auth } from '@/auth';
import { categoriesAPI } from '@/services/api/categories-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { ProductForm } from '@/components/vendor/ProductForm';

export const metadata: Metadata = {
  title: 'Add Product',
  description: 'Create a product on behalf of a vendor.',
};

export default async function AdminNewProductPage() {
  const session = await auth();
  const token = (session as any).accessToken;

  const [categories, vendors] = await Promise.all([
    categoriesAPI.getCategories(),
    vendorAPI.getVendors(token),
  ]);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Add Product</h1>
        <ProductForm categories={categories} vendors={vendors} returnPath="/admin/products" />
      </div>
    </main>
  );
}
