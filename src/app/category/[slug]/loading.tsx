import { BreadcrumbSkeleton, ProductCardSkeleton, Skeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSkeleton />

      <div className="mt-6">
        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
          </div>
          <Skeleton className="h-9 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-2xl mx-auto mb-2" />
          <Skeleton className="h-5 w-2/3 max-w-md mx-auto mb-6" />
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-lg" />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <Skeleton className="h-4 w-48 mb-4 sm:mb-0" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
