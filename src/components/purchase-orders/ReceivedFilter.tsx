'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const ALL = 'all';

export function ReceivedFilter({ currentValue, basePath }: { currentValue?: string; basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === ALL) {
      params.delete('received');
    } else {
      params.set('received', next);
    }
    params.delete('page');
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="receivedFilter">Status</Label>
      <Select value={currentValue ?? ALL} onValueChange={handleChange}>
        <SelectTrigger id="receivedFilter" className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          <SelectItem value="false">Pending</SelectItem>
          <SelectItem value="true">Received</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
