import { Card, CardContent } from '@/components/ui/card';
import { DetailHeaderSkeleton, DataTableSkeleton, Skeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <DetailHeaderSkeleton actions={1} />
        <Skeleton className="h-4 w-48 mt-2" />

        <Card className="mt-6">
          <CardContent className="p-0">
            <DataTableSkeleton columns={5} rows={6} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
