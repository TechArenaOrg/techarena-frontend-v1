import { Card, CardContent } from '@/components/ui/card';
import { DetailHeaderSkeleton, DataTableSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <DetailHeaderSkeleton actions={2} />

        <Card className="mt-6">
          <CardContent className="p-0">
            <DataTableSkeleton columns={5} rows={4} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
