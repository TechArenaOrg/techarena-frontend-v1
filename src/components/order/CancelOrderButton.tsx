'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { ordersAPI } from '@/services/api/orders-api';
import { ApiError } from '@/services/api/client';
import type { OrderStatus } from '@/types';

// Only 'pending' and 'confirmed' orders can be cancelled - backend-enforced, the
// same rule for every role. Self-hides once an order moves past that.
const CANCELLABLE: OrderStatus[] = ['pending', 'confirmed'];

export function CancelOrderButton({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!CANCELLABLE.includes(status)) return null;

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await ordersAPI.cancelOrder(orderId);
      toast({ title: 'Order cancelled' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Could not cancel order',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setConfirmOpen(true)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Icons.x className="mr-2 h-4 w-4" />
        Cancel Order
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this order?"
        description="This can't be undone. Stock and any payment recorded for it will be reversed."
        confirmLabel="Cancel Order"
        isConfirming={isCancelling}
      />
    </>
  );
}
