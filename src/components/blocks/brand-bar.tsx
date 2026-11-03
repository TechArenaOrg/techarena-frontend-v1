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
    <section className="py-3 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-2">
          <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
            Shop by Brand
          </h2>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {brands.map((brand) => (
            <Link
              key={brand}
              href={`/products?brand=${encodeURIComponent(brand)}`}
              className="rounded-full bg-white dark:bg-gray-800 px-4 py-1.5 text-sm font-semibold text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
            >
              {brand}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
