import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { productsAPI } from '@/services/api/products-api';
import { categoriesAPI } from '@/services/api/categories-api';
import { ProductForm } from '@/components/vendor/ProductForm';

export const metadata: Metadata = {
  title: 'Edit Product',
  description: 'Moderate a product listing.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const token = (session as any).accessToken;

  const [product, categories] = await Promise.all([
    productsAPI.getProductById(id, token).catch(() => null),
    categoriesAPI.getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Product</h1>
        <ProductForm categories={categories} product={product} returnPath="/admin/products" />
      </div>
    </main>
  );
}
