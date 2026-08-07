import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { categoriesAPI } from '@/services/api/categories-api';
import { ProductForm } from '@/components/vendor/ProductForm';

export const metadata: Metadata = {
  title: 'Add Product',
  description: 'List a new product in your store.',
};

export default async function NewProductPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role !== 'vendor') {
    redirect(role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard');
  }

  const categories = await categoriesAPI.getCategories();

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Add Product</h1>
        <ProductForm categories={categories} />
      </div>
    </main>
  );
}
