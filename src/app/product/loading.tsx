import { BreadcrumbSkeleton, ProductDetailSkeleton } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <BreadcrumbSkeleton />
      <div className="mt-6">
        <ProductDetailSkeleton />
      </div>
    </div>
  );
}
