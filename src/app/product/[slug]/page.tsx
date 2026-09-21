import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productsAPI } from '@/services/api/products-api';
import { ProductDetail } from '@/components/product/ProductDetail';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { ProductReviews } from '@/components/product/ProductReviews';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ProductDetailSkeleton, ProductCardSkeleton } from '@/components/ui/skeletons';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const product = await productsAPI.getProduct(resolvedParams.slug);

    return {
      title: `${product.name} - TechArena Uganda`,
      description: product.description,
      keywords: [product.name, product.category?.name].filter(Boolean).join(', '),
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images?.map(img => img.url),
        url: `/product/${product.slug}`,
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Product Not Found - TechArena Uganda',
      description: 'The requested product could not be found.',
    };
  }
}

export default async function ProductPage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const product = await productsAPI.getProduct(resolvedParams.slug);

    const breadcrumbItems = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: product.name, href: `/product/${product.slug}` },
    ];

    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs items={breadcrumbItems} />
        
        <div className="mt-6 space-y-16">
          {/* Product Detail */}
          <Suspense fallback={<ProductDetailSkeleton />}>
            <ProductDetail product={product} />
          </Suspense>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              Customer Reviews
            </h2>
            <Suspense fallback={<div>Loading reviews...</div>}>
              <ProductReviews productId={product.id} reviews={product.reviews} />
            </Suspense>
          </section>

          {/* Related Products */}
          {product.relatedProducts && product.relatedProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
                Related Products
              </h2>
              <Suspense fallback={
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              }>
                <RelatedProducts products={product.relatedProducts} />
              </Suspense>
            </section>
          )}
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}