import { Metadata } from 'next';
import { categoriesAPI } from '@/services/api/categories-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { BackLink } from '@/components/ui/back-link';
import { CategoryFormDialog } from '@/components/admin/CategoryFormDialog';
import { CategoryTree } from '@/components/admin/CategoryTree';

export const metadata: Metadata = {
  title: 'Manage Categories',
  description: 'Create and organize product categories.',
};

export default async function AdminCategoriesPage() {
  // Categories are a small, hand-curated list (unlike products/orders), so this
  // fetches them all in one page rather than paginating - a tree only makes sense
  // when every node is on screen at once.
  const { categories, totalCount } = await categoriesAPI.getCategories({ limit: 200 }).catch(() => ({ categories: [], totalCount: 0 }));

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-4xl">
        <BackLink href="/admin/dashboard" label="Back to Dashboard" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
            <p className="text-muted-foreground">
              {totalCount} categor{totalCount !== 1 ? 'ies' : 'y'}, organized as a tree
            </p>
          </div>
          <CategoryFormDialog
            allCategories={categories}
            trigger={
              <Button size="lg">
                <Icons.plus className="mr-2 h-5 w-5" />
                New Category
              </Button>
            }
          />
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            <CategoryTree categories={categories} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
