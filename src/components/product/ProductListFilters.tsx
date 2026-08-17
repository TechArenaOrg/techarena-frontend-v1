'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/ui/icons';
import type { Category } from '@/types';

interface ProductListFiltersProps {
  basePath: string;
  categories: Category[];
  currentSearch?: string;
  currentCategoryId?: string;
  currentLowStock?: boolean;
  currentFeatured?: boolean;
  currentStatus?: string;
}

const ALL_CATEGORIES = 'all';
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
}: ProductListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch ?? '');

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
    router.push(`${basePath}?${params.toString()}`);
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
    params.delete('page');
    router.push(`${basePath}?${params.toString()}`);
  };

  const hasActiveFilters =
    !!currentSearch ||
    !!currentCategoryId ||
    !!currentLowStock ||
    !!currentFeatured ||
    (!!currentStatus && currentStatus !== DEFAULT_STATUS);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5 flex-1 min-w-[200px]">
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
  );
}
