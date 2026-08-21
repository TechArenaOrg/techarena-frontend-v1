'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LedgerEntryForm } from '@/components/ledger/LedgerEntryForm';
import type { LedgerAccount } from '@/services/api/ledger-api';

interface LedgerEntryFormDialogProps {
  trigger: ReactNode;
  account: LedgerAccount;
}

export function LedgerEntryFormDialog({ trigger, account }: LedgerEntryFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Entry — {account.name}</DialogTitle>
        </DialogHeader>
        <LedgerEntryForm
          account={account}
          bare
          returnPath=""
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
