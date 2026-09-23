'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilterChipRow } from '@/components/ui/filter-chip-row';

const PERIODS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

export function SalesReportFilters({
  period,
  date,
  basePath = '/admin/sales-report',
}: {
  period: string;
  date?: string;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Changing the period/date invalidates whatever page we were on.
    params.delete('page');
    startTransition(() => router.push(`${basePath}?${params.toString()}`));
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
      <div className="sm:hidden">
        <FilterChipRow label="Period" options={PERIODS} activeValue={period} onSelect={(v) => updateParam('period', v)} />
      </div>

      <div className="hidden sm:block space-y-1.5">
        <Label htmlFor="period">Period</Label>
        <Select value={period} onValueChange={(v) => updateParam('period', v)}>
          <SelectTrigger id="period" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Any date within period</Label>
        <Input
          id="date"
          type="date"
          value={date ?? ''}
          onChange={(e) => updateParam('date', e.target.value)}
          className="w-full sm:w-[160px]"
        />
      </div>
    </div>
  );
}
