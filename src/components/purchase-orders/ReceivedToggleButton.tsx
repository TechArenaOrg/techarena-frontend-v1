'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { purchaseOrderAPI } from '@/services/api/purchase-order-api';
import { ApiError } from '@/services/api/client';

export function ReceivedToggleButton({ purchaseOrderId, isReceived }: { purchaseOrderId: string; isReceived: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = async () => {
    const next = !isReceived;
    if (
      !window.confirm(
        next
          ? 'Mark this purchase order as received? Stock will be added to each item automatically.'
          : 'Undo receiving this purchase order? Stock added earlier will be reversed.'
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      await purchaseOrderAPI.updatePurchaseOrder(purchaseOrderId, { isReceived: next });
      toast({ title: next ? 'Marked as received' : 'Marked as not received' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button onClick={handleToggle} disabled={isSubmitting} variant={isReceived ? 'outline' : 'default'}>
      <Icons.truck className="mr-2 h-4 w-4" />
      {isSubmitting ? 'Saving...' : isReceived ? 'Undo Receive' : 'Mark as Received'}
    </Button>
  );
}
