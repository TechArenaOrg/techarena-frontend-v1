'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductFilters } from '@/components/product/ProductFilters';
import type { Category } from '@/types';

interface ProductFiltersResponsiveProps {
  categories: Category[];
  currentCategoryId?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentMinRating?: number;
}

// Below lg, the filter sidebar used to render inline, full-width, above the product
// grid - on a phone that meant scrolling past the entire Categories/Price/Rating block
// just to reach the first product, with no way to collapse it and no visibility into
// what was actually applied. This swaps that for a drawer with a filter-count badge.
export function ProductFiltersResponsive(props: ProductFiltersResponsiveProps) {
  const [open, setOpen] = useState(false);
  const activeCount = [
    !!props.currentCategoryId,
    props.currentMinPrice !== undefined,
    props.currentMaxPrice !== undefined,
    props.currentMinRating !== undefined,
  ].filter(Boolean).length;

  return (
    <>
      <div className="hidden lg:block">
        <ProductFilters {...props} />
      </div>

      <div className="lg:hidden mb-4">
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
              <ProductFilters {...props} />
            </div>
            {/* Results already update live behind the drawer as filters are picked -
                this just gives an explicit, satisfying way to go see them. */}
            <Button className="w-full mt-6" onClick={() => setOpen(false)}>
              View Results
            </Button>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
