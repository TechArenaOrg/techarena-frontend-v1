import { DetailHeaderSkeleton, OrderDetailSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <DetailHeaderSkeleton actions={1} />
        <OrderDetailSkeleton cards={1} itemColumns={5} />
      </div>
    </main>
  );
}
