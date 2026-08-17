'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { ledgerAPI } from '@/services/api/ledger-api';
import { ApiError } from '@/services/api/client';

export function DeleteLedgerEntryButton({ entryId, isTransfer }: { entryId: string; isTransfer: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmMessage = isTransfer
      ? "Delete this transfer? Both sides of the transfer will be removed. This can't be undone."
      : "Delete this entry? This can't be undone.";
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    try {
      await ledgerAPI.deleteEntry(entryId);
      toast({ title: 'Entry deleted' });
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
    </Button>
  );
}
