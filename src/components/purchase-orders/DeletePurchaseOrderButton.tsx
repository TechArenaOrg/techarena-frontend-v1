'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { purchaseOrderAPI } from '@/services/api/purchase-order-api';
import { ApiError } from '@/services/api/client';

export function DeletePurchaseOrderButton({
  purchaseOrderId,
  isReceived,
  returnPath,
}: {
  purchaseOrderId: string;
  isReceived: boolean;
  returnPath?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmMessage = isReceived
      ? 'Delete this purchase order? Since it was received, the stock it added will be reversed.'
      : "Delete this purchase order? This can't be undone.";
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await purchaseOrderAPI.deletePurchaseOrder(purchaseOrderId);
      toast({ title: 'Purchase order deleted' });
      if (returnPath) {
        router.push(returnPath);
      }
      router.refresh();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-destructive hover:text-destructive">
      <Icons.trash2 className="h-4 w-4" />
      {returnPath ? <span className="ml-2">Delete</span> : null}
    </Button>
  );
}
