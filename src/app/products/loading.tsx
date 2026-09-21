import { PageHeaderSkeleton, ProductCardSkeleton, Skeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1">
      <div className="container py-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
