'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LedgerAccountForm } from '@/components/ledger/LedgerAccountForm';
import type { Vendor } from '@/types';

interface LedgerAccountFormDialogProps {
  trigger: ReactNode;
  vendors: Vendor[];
}

export function LedgerAccountFormDialog({ trigger, vendors }: LedgerAccountFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Ledger Account</DialogTitle>
        </DialogHeader>
        <LedgerAccountForm
          vendors={vendors}
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
