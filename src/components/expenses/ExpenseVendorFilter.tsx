'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Vendor } from '@/types';

const ALL = 'all';
const PLATFORM_ONLY = 'platform';

export function ExpenseVendorFilter({
  vendors,
  currentVendorId,
  basePath,
}: {
  vendors: Vendor[];
  currentVendorId?: string;
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = currentVendorId === undefined ? ALL : currentVendorId === 'null' ? PLATFORM_ONLY : currentVendorId;

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL) {
      params.delete('vendorId');
    } else if (next === PLATFORM_ONLY) {
      params.set('vendorId', 'null');
    } else {
      params.set('vendorId', next);
    }
    params.delete('page');
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="vendorFilter">Vendor</Label>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger id="vendorFilter" className="w-[220px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          <SelectItem value={PLATFORM_ONLY}>Platform-level only</SelectItem>
          {vendors.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id}>
              {vendor.businessName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
