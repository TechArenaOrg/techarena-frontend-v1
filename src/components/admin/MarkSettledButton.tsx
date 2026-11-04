'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { ledgerAPI, LedgerEntry } from '@/services/api/ledger-api';
import { ApiError } from '@/services/api/client';

// Admin-only - shown on payable/receivable entries (direction is null for those
// kinds) that aren't settled yet. Flips isSettled to true, e.g. once a vendor has
// actually been paid their payout outside the platform.
export function MarkSettledButton({ entry }: { entry: LedgerEntry }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await ledgerAPI.updateEntry(entry.id, {
        accountId: entry.accountId,
        amount: entry.amount,
        isSettled: true,
        note: entry.note ?? undefined,
        date: entry.date,
      });
      toast({ title: 'Marked as paid' });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: 'Could not update entry',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Mark as Paid
      </Button>
      <ConfirmDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        title="Mark this entry as paid?"
        description="Only do this once you've actually paid this amount outside the platform (bank transfer, mobile money, etc). This can't be easily undone."
        confirmLabel="Mark as Paid"
        variant="default"
        isConfirming={isSaving}
      />
    </>
  );
}
