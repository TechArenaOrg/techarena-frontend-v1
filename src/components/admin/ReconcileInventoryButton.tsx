'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { ledgerAPI } from '@/services/api/ledger-api';
import { ApiError } from '@/services/api/client';
import { formatCurrency } from '@/lib/utils';

// Admin/super_admin only - the caller only renders this for a vendor's Inventory
// (stock) account. Recomputes what Stock should be (quantity * cost across the
// vendor's products) and posts a correcting entry for any gap - fixes drift, e.g.
// stock that existed before this ledger automation shipped and never got a baseline.
export function ReconcileInventoryButton({ vendorId }: { vendorId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleConfirm = async () => {
    setIsRunning(true);
    try {
      const result = await ledgerAPI.reconcileInventory(vendorId);
      toast({
        title: result.entry ? 'Inventory reconciled' : 'Already correct',
        description: result.entry
          ? `Posted a correcting entry of ${formatCurrency(result.adjustmentAmount)}. Expected balance: ${formatCurrency(result.expectedBalance)}.`
          : `No adjustment needed - balance already matches ${formatCurrency(result.expectedBalance)}.`,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: 'Reconcile failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Reconcile Inventory
      </Button>
      <ConfirmDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Reconcile this vendor's Inventory?"
        description="Recomputes what Stock should be from current products (quantity x cost) and posts one correcting entry for any gap versus the current balance."
        confirmLabel="Reconcile"
        variant="default"
        isConfirming={isRunning}
      />
    </>
  );
}
