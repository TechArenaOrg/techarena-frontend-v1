'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/ui/icons';
import { FilterChipRow } from '@/components/ui/filter-chip-row';
import type { Category, Vendor } from '@/types';

interface ProductListFiltersProps {
  basePath: string;
  categories: Category[];
  currentSearch?: string;
  currentCategoryId?: string;
  currentLowStock?: boolean;
  currentFeatured?: boolean;
  currentStatus?: string;
  // Only passed by the admin product list - vendors filter by their own
  // products automatically, so they don't need this control.
  vendors?: Vendor[];
  currentVendorId?: string;
}

const ALL_CATEGORIES = 'all';
const ALL_VENDORS = 'all';
const ALL_STATUSES = 'all';
const DEFAULT_STATUS = 'active';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: ALL_STATUSES, label: 'All Statuses' },
];

export function ProductListFilters({
  basePath,
  categories,
  currentSearch,
  currentCategoryId,
  currentLowStock,
  currentFeatured,
  currentStatus,
  vendors,
  currentVendorId,
}: ProductListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch ?? '');
  // Without this, every filter click is a full navigation to a page whose data comes
  // from searchParams - Next treats that as a real route change and swaps the whole
  // page out for loading.tsx while it refetches. Wrapping the navigation in a
  // transition tells it to keep the current page on screen instead.
  const [, startTransition] = useTransition();

  useEffect(() => {
    setSearch(currentSearch ?? '');
  }, [currentSearch]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete('page');
    startTransition(() => router.push(`${basePath}?${params.toString()}`));
  };

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === (currentSearch ?? '')) return;
    const timeout = setTimeout(() => updateParams({ search: trimmed || undefined }), 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const clearFilters = () => {
    setSearch('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('categoryId');
    params.delete('lowStock');
    params.delete('isFeatured');
    params.delete('status');
    params.delete('vendorId');
    params.delete('page');
    startTransition(() => router.push(`${basePath}?${params.toString()}`));
  };

  const hasActiveFilters =
    !!currentSearch ||
    !!currentCategoryId ||
    !!currentLowStock ||
    !!currentFeatured ||
    !!currentVendorId ||
    (!!currentStatus && currentStatus !== DEFAULT_STATUS);

  const categoryOptions = [{ value: ALL_CATEGORIES, label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))];
  const vendorOptions = vendors
    ? [{ value: ALL_VENDORS, label: 'All Vendors' }, ...vendors.map((v) => ({ value: v.id, label: v.businessName }))]
    : [];

  return (
    <>
      {/* Below lg: same treatment as the customer product filters - Status/Category/
          Vendor become single-row horizontal-scroll chips instead of full-width
          selects, so this stays a few compact rows instead of one field per row. */}
      <div className="space-y-2.5 lg:hidden">
        <div className="space-y-1.5">
          <Label htmlFor="productSearchMobile">Search</Label>
          <Input
            id="productSearchMobile"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterChipRow
          label="Status"
          options={STATUS_OPTIONS}
          activeValue={currentStatus ?? DEFAULT_STATUS}
          onSelect={(value) => updateParams({ status: value })}
        />

        <FilterChipRow
          label="Category"
          options={categoryOptions}
          activeValue={currentCategoryId ?? ALL_CATEGORIES}
          onSelect={(value) => updateParams({ categoryId: value === ALL_CATEGORIES ? undefined : value })}
        />

        {vendors && (
          <FilterChipRow
            label="Vendor"
            options={vendorOptions}
            activeValue={currentVendorId ?? ALL_VENDORS}
            onSelect={(value) => updateParams({ vendorId: value === ALL_VENDORS ? undefined : value })}
          />
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="lowStockFilterMobile"
              checked={!!currentLowStock}
              onCheckedChange={(checked) => updateParams({ lowStock: checked === true ? 'true' : undefined })}
            />
            <Label htmlFor="lowStockFilterMobile" className="cursor-pointer text-sm">
              Low Stock
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featuredFilterMobile"
              checked={!!currentFeatured}
              onCheckedChange={(checked) => updateParams({ isFeatured: checked === true ? 'true' : undefined })}
            />
            <Label htmlFor="featuredFilterMobile" className="cursor-pointer text-sm">
              Featured
            </Label>
          </div>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
            <Icons.x className="w-3.5 h-3.5 mr-1.5" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* lg+: original inline flex-wrap row, unchanged. */}
      <div className="hidden lg:flex lg:flex-wrap lg:items-end lg:gap-4">
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <Label htmlFor="productSearch">Search</Label>
          <Input
            id="productSearch"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="statusFilter">Status</Label>
          <Select
            value={currentStatus ?? DEFAULT_STATUS}
            onValueChange={(value) => updateParams({ status: value })}
          >
            <SelectTrigger id="statusFilter" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="categoryFilter">Category</Label>
          <Select
            value={currentCategoryId ?? ALL_CATEGORIES}
            onValueChange={(value) => updateParams({ categoryId: value === ALL_CATEGORIES ? undefined : value })}
          >
            <SelectTrigger id="categoryFilter" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {vendors && (
          <div className="space-y-1.5">
            <Label htmlFor="vendorFilter">Vendor</Label>
            <Select
              value={currentVendorId ?? ALL_VENDORS}
              onValueChange={(value) => updateParams({ vendorId: value === ALL_VENDORS ? undefined : value })}
            >
              <SelectTrigger id="vendorFilter" className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VENDORS}>All Vendors</SelectItem>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center space-x-2 pb-2.5">
          <Checkbox
            id="lowStockFilter"
            checked={!!currentLowStock}
            onCheckedChange={(checked) => updateParams({ lowStock: checked === true ? 'true' : undefined })}
          />
          <Label htmlFor="lowStockFilter" className="cursor-pointer">
            Low Stock
          </Label>
        </div>

        <div className="flex items-center space-x-2 pb-2.5">
          <Checkbox
            id="featuredFilter"
            checked={!!currentFeatured}
            onCheckedChange={(checked) => updateParams({ isFeatured: checked === true ? 'true' : undefined })}
          />
          <Label htmlFor="featuredFilter" className="cursor-pointer">
            Featured
          </Label>
        </div>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters}>
            <Icons.x className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </>
  );
}
