'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { ledgerAPI, LedgerAccountInput } from '@/services/api/ledger-api';
import { ApiError } from '@/services/api/client';

const STARTER_ACCOUNTS: Omit<LedgerAccountInput, 'vendorId'>[] = [
  { name: 'Petty Cash', kind: 'cash' },
  { name: 'Bank', kind: 'cash' },
  { name: 'Mobile Money', kind: 'cash' },
  { name: 'Creditors', kind: 'payable' },
  { name: 'Debtors', kind: 'receivable' },
];

export function BootstrapVendorAccountsButton({ vendorId, vendorName }: { vendorId: string; vendorName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!window.confirm(`Create the standard 5 ledger accounts (Petty Cash, Bank, Mobile Money, Creditors, Debtors) for ${vendorName}?`)) {
      return;
    }

    setIsCreating(true);
    try {
      for (const account of STARTER_ACCOUNTS) {
        await ledgerAPI.createAccount({ ...account, vendorId });
      }
      toast({ title: 'Starter accounts created' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Creation failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCreate} disabled={isCreating}>
      <Icons.plus className="mr-2 h-4 w-4" />
      {isCreating ? 'Creating...' : 'Set Up Starter Accounts'}
    </Button>
  );
}
