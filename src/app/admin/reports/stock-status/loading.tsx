import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GroupedTableSkeleton, Skeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <Skeleton className="h-4 w-36 mb-4" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-4 w-28" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <GroupedTableSkeleton columns={7} groups={3} rowsPerGroup={3} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
