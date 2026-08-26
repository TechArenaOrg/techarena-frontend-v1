'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SimpleModal } from '@/components/ui/simple-modal';
import { Icons } from '@/components/ui/icons';
import { LedgerAccountForm } from '@/components/ledger/LedgerAccountForm';
import type { Vendor } from '@/types';

export function NewLedgerAccountButton({ vendors }: { vendors: Vendor[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.plus className="mr-2 h-4 w-4" />
        New Account
      </Button>
      <SimpleModal open={open} onClose={() => setOpen(false)} title="New Ledger Account">
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
      </SimpleModal>
    </>
  );
}
