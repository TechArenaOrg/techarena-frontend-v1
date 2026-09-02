'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI } from '@/services/api/orders-api';
import { ApiError } from '@/services/api/client';
import type { OrderItemStatus } from '@/types';

const STATUSES: OrderItemStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

export function OrderItemStatusSelect({
  orderId,
  itemId,
  currentStatus,
}: {
  orderId: string;
  itemId: string;
  currentStatus: OrderItemStatus;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderItemStatus>(currentStatus);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await ordersAPI.updateOrderItemStatus(orderId, itemId, status);
      toast({ title: 'Item status updated' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setStatus(currentStatus);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(value) => setStatus(value as OrderItemStatus)} disabled={isSaving}>
        <SelectTrigger className="w-[150px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" onClick={handleSave} disabled={isSaving || status === currentStatus}>
        {isSaving ? 'Saving...' : 'Update'}
      </Button>
    </div>
  );
}
