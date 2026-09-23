'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductListFilters } from '@/components/product/ProductListFilters';
import type { Category, Vendor } from '@/types';

interface ProductListFiltersResponsiveProps {
  basePath: string;
  categories: Category[];
  currentSearch?: string;
  currentCategoryId?: string;
  currentLowStock?: boolean;
  currentFeatured?: boolean;
  currentStatus?: string;
  vendors?: Vendor[];
  currentVendorId?: string;
}

const DEFAULT_STATUS = 'active';

// Same problem as the customer-facing product filters: below lg this row wraps into
// six-plus full-width fields (Search, Status, Category, Vendor, Low Stock, Featured)
// before an admin/vendor ever sees a single product. Collapses to a drawer + count
// badge on phones and portrait tablets; desktop (lg+) keeps the original inline row.
export function ProductListFiltersResponsive(props: ProductListFiltersResponsiveProps) {
  const [open, setOpen] = useState(false);
  const activeCount = [
    !!props.currentSearch,
    !!props.currentCategoryId,
    !!props.currentLowStock,
    !!props.currentFeatured,
    !!props.currentVendorId,
    !!props.currentStatus && props.currentStatus !== DEFAULT_STATUS,
  ].filter(Boolean).length;

  return (
    <>
      <div className="hidden lg:block">
        <ProductListFilters {...props} />
      </div>

      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetTitle>Filters</SheetTitle>
            <div className="mt-6">
              <ProductListFilters {...props} />
            </div>
            <Button className="w-full mt-6" onClick={() => setOpen(false)}>
              View Results
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
