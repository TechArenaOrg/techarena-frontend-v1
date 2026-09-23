'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FilterChipRow } from '@/components/ui/filter-chip-row';

const ALL = 'all';

const OPTIONS = [
  { value: ALL, label: 'All' },
  { value: 'false', label: 'Pending' },
  { value: 'true', label: 'Received' },
];

export function ReceivedFilter({ currentValue, basePath }: { currentValue?: string; basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL) {
      params.delete('received');
    } else {
      params.set('received', next);
    }
    params.delete('page');
    startTransition(() => router.push(`${basePath}?${params.toString()}`));
  };

  return (
    <>
      <div className="sm:hidden">
        <FilterChipRow label="Status" options={OPTIONS} activeValue={currentValue ?? ALL} onSelect={handleChange} />
      </div>

      <div className="hidden sm:block space-y-1.5">
        <Label htmlFor="receivedFilter">Status</Label>
        <Select value={currentValue ?? ALL} onValueChange={handleChange}>
          <SelectTrigger id="receivedFilter" className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
