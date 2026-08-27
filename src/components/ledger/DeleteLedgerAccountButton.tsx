'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { ledgerAPI } from '@/services/api/ledger-api';
import { ApiError } from '@/services/api/client';

export function DeleteLedgerAccountButton({ accountId, returnPath }: { accountId: string; returnPath: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await ledgerAPI.deleteAccount(accountId);
      toast({ title: 'Account deleted' });
      router.push(returnPath);
      router.refresh();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
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
        <Icons.trash2 className="mr-2 h-4 w-4" />
        Delete Account
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete this account?"
        description="This can't be undone."
        confirmLabel="Delete"
        isConfirming={isDeleting}
      />
    </>
  );
}
