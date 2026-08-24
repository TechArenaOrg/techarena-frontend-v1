import { Metadata } from 'next';
import Link from 'next/link';
import { categoriesAPI } from '@/services/api/categories-api';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse all product categories at TechArena Uganda.',
};

export default async function CategoriesPage() {
  const { categories } = await categoriesAPI.getCategories({ limit: 100 }).catch(() => ({ categories: [] }));

  return (
    <main className="flex-1">
      <div className="container py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">All Categories</h1>
          <p className="text-muted-foreground">Browse our full range of technology categories</p>
        </div>

        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Couldn't load categories right now.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group block bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-800/40 dark:group-hover:to-indigo-800/40 transition-colors">
                  <span className="text-3xl">{category.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{category.products?.length || 0} products</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
