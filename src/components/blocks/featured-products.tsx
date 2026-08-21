import { productsAPI } from '@/services/api/products-api';
import { FeaturedProductsInfinite } from '@/components/blocks/featured-products-infinite';

export async function FeaturedProducts() {
  const result = await productsAPI
    .getProducts({ isFeatured: true, page: 1, limit: 12 })
    .catch(() => null);

  if (!result) {
    return <p className="text-center text-muted-foreground">Couldn't load featured products right now.</p>;
  }

  if (result.products.length === 0) {
    return <p className="text-center text-muted-foreground">No featured products yet.</p>;
  }

  return <FeaturedProductsInfinite initialProducts={result.products} initialHasNextPage={result.hasNextPage} />;
}
