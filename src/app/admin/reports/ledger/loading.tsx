import { AccountGroupsSkeleton, Skeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <Skeleton className="h-4 w-36 mb-4" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="mt-6">
          <AccountGroupsSkeleton groups={3} />
        </div>
      </div>
    </main>
  );
}
