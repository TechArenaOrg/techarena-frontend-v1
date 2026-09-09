'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI } from '@/services/api/orders-api';
import { ApiError } from '@/services/api/client';
import type { OrderStatus } from '@/types';

// 'cancelled' is deliberately excluded here - setting it through this generic status
// update reverses stock and the inventory ledger but NOT any cash credited from the
// sale, confirmed live. Use CancelOrderButton instead, which goes through the
// dedicated cancel endpoint that reverses all three correctly.
const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'refunded', 'failed'];

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await ordersAPI.updateOrderStatus(orderId, status);
      toast({ title: 'Order status updated' });
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
      <Select value={status} onValueChange={(value) => setStatus(value as OrderStatus)} disabled={isSaving}>
        <SelectTrigger className="w-[160px]">
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
