'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

const PRICE_MIN = 0;
const PRICE_MAX = 5000000;
const PRICE_STEP = 50000;

const RATING_OPTIONS = [4, 3, 2, 1];

interface ProductFiltersProps {
  categories: Category[];
  currentCategoryId?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentMinRating?: number;
}

export function ProductFilters({
  categories,
  currentCategoryId,
  currentMinPrice,
  currentMaxPrice,
  currentMinRating,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    currentMinPrice ?? PRICE_MIN,
    currentMaxPrice ?? PRICE_MAX,
  ]);
  // Without this, every filter click is a full navigation to a page whose data comes
  // from searchParams - Next treats that as a real route change and swaps the whole
  // page out for loading.tsx while it refetches. Wrapping the navigation in a
  // transition tells it to keep the current page on screen instead.
  const [, startTransition] = useTransition();
  const navigate = (url: string) => startTransition(() => router.push(url));

  const toggleCategory = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentCategoryId === categoryId) {
      params.delete('categoryId');
    } else {
      params.set('categoryId', categoryId);
    }
    params.delete('page');
    navigate(`/products?${params.toString()}`);
  };

  const commitPriceRange = (range: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range[0] <= PRICE_MIN) {
      params.delete('minPrice');
    } else {
      params.set('minPrice', String(range[0]));
    }
    if (range[1] >= PRICE_MAX) {
      params.delete('maxPrice');
    } else {
      params.set('maxPrice', String(range[1]));
    }
    params.delete('page');
    navigate(`/products?${params.toString()}`);
  };

  const toggleMinRating = (rating: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (currentMinRating === rating) {
      params.delete('minRating');
    } else {
      params.set('minRating', String(rating));
    }
    params.delete('page');
    navigate(`/products?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('categoryId');
    params.delete('minPrice');
    params.delete('maxPrice');
    params.delete('minRating');
    params.delete('page');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    navigate(`/products?${params.toString()}`);
  };

  const hasActiveFilters =
    !!currentCategoryId || currentMinPrice !== undefined || currentMaxPrice !== undefined || currentMinRating !== undefined;

  return (
    <Card>
      <CardContent className="p-3 lg:p-6">
        {/* Below lg: one compact row per section (horizontal scroll instead of wrap,
            so a long category/rating list still costs only one line, not several),
            tight spacing throughout - the goal is for a product to already be visible
            on first load, not just reachable after scrolling past every filter.
            lg+ is untouched: the original vertical Card layout below. */}
        <div className="space-y-2.5 lg:hidden">
          {categories.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Category</p>
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {categories.map((category) => {
                  const active = currentCategoryId === category.id;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        'shrink-0 rounded-full border px-2.5 py-1 text-xs transition-colors',
                        active
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-input hover:bg-muted'
                      )}
                    >
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Price: UGX {priceRange[0].toLocaleString()} - UGX {priceRange[1].toLocaleString()}{priceRange[1] >= PRICE_MAX ? '+' : ''}
            </p>
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              onValueCommit={(value) => commitPriceRange(value as [number, number])}
              max={PRICE_MAX}
              min={PRICE_MIN}
              step={PRICE_STEP}
              className="w-full"
            />
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Rating</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {RATING_OPTIONS.map((rating) => {
                const active = currentMinRating === rating;
                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => toggleMinRating(rating)}
                    className={cn(
                      'flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors',
                      active
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input hover:bg-muted'
                    )}
                  >
                    <Icons.star className={cn('w-3 h-3 fill-current', active ? '' : 'text-yellow-400')} />
                    {rating}+ & Up
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
              <Icons.x className="w-3.5 h-3.5 mr-1.5" />
              Clear Filters
            </Button>
          )}
        </div>

        <div className="hidden lg:block space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Categories</h3>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories yet.</p>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={currentCategoryId === category.id}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Price Range</h3>
            <div className="px-3">
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                onValueCommit={(value) => commitPriceRange(value as [number, number])}
                max={PRICE_MAX}
                min={PRICE_MIN}
                step={PRICE_STEP}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <span>UGX {priceRange[0].toLocaleString()}</span>
                <span>UGX {priceRange[1].toLocaleString()}{priceRange[1] >= PRICE_MAX ? '+' : ''}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold mb-3">Rating</h3>
            <div className="space-y-2">
              {RATING_OPTIONS.map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <Checkbox
                    id={`rating-${rating}`}
                    checked={currentMinRating === rating}
                    onCheckedChange={() => toggleMinRating(rating)}
                  />
                  <Label htmlFor={`rating-${rating}`} className="flex items-center cursor-pointer">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Icons.star key={i} className="w-4 h-4 fill-current text-yellow-400" />
                    ))}
                    {Array.from({ length: 5 - rating }).map((_, i) => (
                      <Icons.star key={i} className="w-4 h-4 text-gray-300" />
                    ))}
                    <span className="ml-1">& Up</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <>
              <Separator />
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                <Icons.x className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
