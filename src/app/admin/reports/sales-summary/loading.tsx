import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GroupedTableSkeleton, Skeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <Skeleton className="h-4 w-36 mb-4" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-56" />
        </div>

        <Skeleton className="h-16 w-full mt-6 rounded-lg" />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-4 w-28" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <GroupedTableSkeleton columns={5} groups={3} rowsPerGroup={3} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
