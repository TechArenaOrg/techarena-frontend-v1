import { categoriesAPI } from '@/services/api/categories-api';
import { Pagination } from '@/components/ui/pagination';
import { FeaturedCategoriesGrid } from '@/components/blocks/featured-categories-grid';

export async function FeaturedCategories({ page }: { page: number }) {
  const result = await categoriesAPI
    .getCategories({ isFeatured: true, page, limit: 6 })
    .catch(() => null);

  if (!result) {
    return <p className="text-center text-muted-foreground">Couldn't load featured categories right now.</p>;
  }

  const { categories, totalPages, hasNextPage, hasPreviousPage } = result;

  if (categories.length === 0) {
    return <p className="text-center text-muted-foreground">No featured categories yet.</p>;
  }

  return (
    <div className="space-y-8">
      <FeaturedCategoriesGrid categories={categories} />
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            paramName="categoriesPage"
          />
        </div>
      )}
    </div>
  );
}
