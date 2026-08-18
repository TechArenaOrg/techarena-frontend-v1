import { DashboardStatsSkeleton, OrderItemSkeleton, PageHeaderSkeleton } from '@/components/ui/skeletons';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <PageHeaderSkeleton />
        <DashboardStatsSkeleton />
        <Card className="mt-6">
          <CardContent className="pt-6 divide-y">
            {Array.from({ length: 3 }).map((_, i) => (
              <OrderItemSkeleton key={i} />
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
