import { Metadata } from 'next';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { TransferForm } from '@/components/ledger/TransferForm';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'Transfer Funds',
  description: 'Move money between your cash accounts.',
};

export default async function VendorLedgerTransferPage() {
  const session = await auth();
  
  const token = (session as any).accessToken;
  const accounts = await ledgerAPI.getAccounts(token);
  const cashAccounts = accounts.filter((a) => a.kind === 'cash');

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-xl">
        <BackLink href="/vendor/ledger" label="Back to My Accounts" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">Transfer Funds</h1>
        <TransferForm returnPath="/vendor/ledger" cashAccounts={cashAccounts} />
      </div>
    </main>
  );
}
