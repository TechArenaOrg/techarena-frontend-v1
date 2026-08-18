import { BreadcrumbSkeleton, PageHeaderSkeleton, Skeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSkeleton />
      <div className="mt-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
