'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ExpenseDateRangeFilter({
  startDate,
  endDate,
  basePath,
}: {
  startDate?: string;
  endDate?: string;
  basePath: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="startDate">From</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate ?? ''}
          onChange={(e) => updateParam('startDate', e.target.value)}
          className="w-[160px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="endDate">To</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate ?? ''}
          onChange={(e) => updateParam('endDate', e.target.value)}
          className="w-[160px]"
        />
      </div>
    </div>
  );
}
