import { PageHeaderSkeleton, Skeleton } from '@/components/ui/skeletons';
import { Card, CardContent } from '@/components/ui/card';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <PageHeaderSkeleton />
        <Card className="mt-6">
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
