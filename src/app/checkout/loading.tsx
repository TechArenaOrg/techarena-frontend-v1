import { PageHeaderSkeleton, CheckoutFormSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <main className="flex-1">
      <div className="container py-6 max-w-3xl">
        <PageHeaderSkeleton />
        <CheckoutFormSkeleton />
      </div>
    </main>
  );
}
