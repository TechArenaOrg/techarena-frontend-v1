import { Card, CardContent } from '@/components/ui/card';
import { DataTableSkeleton, Skeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <Skeleton className="h-4 w-36 mb-4" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            <DataTableSkeleton columns={6} rows={8} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
