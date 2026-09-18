import { DetailHeaderSkeleton, OrderDetailSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-4xl">
        <DetailHeaderSkeleton actions={2} />
        <OrderDetailSkeleton cards={2} itemColumns={6} />
      </div>
    </main>
  );
}
