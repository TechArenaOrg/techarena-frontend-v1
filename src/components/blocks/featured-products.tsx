import { productsAPI } from '@/services/api/products-api';
import { Pagination } from '@/components/ui/pagination';
import { FeaturedProductsGrid } from '@/components/blocks/featured-products-grid';

export async function FeaturedProducts({ page }: { page: number }) {
  const { products, totalPages, hasNextPage, hasPreviousPage } = await productsAPI.getProducts({
    isFeatured: true,
    page,
    limit: 12,
  });

  if (products.length === 0) {
    return <p className="text-center text-muted-foreground">No featured products yet.</p>;
  }

  return (
    <div className="space-y-8">
      <FeaturedProductsGrid products={products} />
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            paramName="productsPage"
          />
        </div>
      )}
    </div>
  );
}
