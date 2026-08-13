import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { vendorAPI } from '@/services/api/vendor-api';
import { productsAPI } from '@/services/api/products-api';
import { categoriesAPI } from '@/services/api/categories-api';
import { ProductForm } from '@/components/vendor/ProductForm';

export const metadata: Metadata = {
  title: 'Edit Product',
  description: 'Update your product listing.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role !== 'vendor') {
    redirect(role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard');
  }

  const { id } = await params;
  const token = (session as any).accessToken;

  const [{ vendor }, product, { categories }] = await Promise.all([
    vendorAPI.getMyDashboard(token),
    productsAPI.getProductById(id, token).catch(() => null),
    categoriesAPI.getCategories(),
  ]);

  // The backend enforces real ownership on the write endpoints - this is just so a
  // vendor never even sees another vendor's product in their own edit form.
  if (!product || product.vendorId !== vendor.id) {
    notFound();
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Product</h1>
        <ProductForm categories={categories} product={product} />
      </div>
    </main>
  );
}
