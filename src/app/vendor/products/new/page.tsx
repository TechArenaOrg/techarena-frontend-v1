import { Metadata } from 'next';
import { auth } from '@/auth';
import { categoriesAPI } from '@/services/api/categories-api';
import { ProductForm } from '@/components/vendor/ProductForm';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'Add Product',
  description: 'List a new product in your store.',
};

export default async function NewProductPage() {
  const session = await auth();

  const { categories } = await categoriesAPI.getCategories();

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/vendor/products" label="Back to Products" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">Add Product</h1>
        <ProductForm categories={categories} />
      </div>
    </main>
  );
}
