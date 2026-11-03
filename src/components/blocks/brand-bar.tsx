import Link from 'next/link';
import { productsAPI } from '@/services/api/products-api';

// Only ever shows brands that actually have at least one product tagged with them -
// the backend's /products/brands endpoint already filters to distinct in-use brands,
// so this stays empty (and renders nothing) until a vendor sets a product's brand.
export async function BrandBar() {
  const brands = await productsAPI.getBrands().catch(() => []);

  if (brands.length === 0) {
    return null;
  }

  return (
    <nav className="bg-gray-900 dark:bg-black overflow-x-auto scrollbar-hide">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-6 py-2.5 whitespace-nowrap">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/products?brand=${encodeURIComponent(brand)}`}
              className="shrink-0 text-sm font-semibold text-gray-200 hover:text-white transition-colors"
            >
              {brand}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
