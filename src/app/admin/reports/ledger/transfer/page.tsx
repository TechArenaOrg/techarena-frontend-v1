import { Metadata } from 'next';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { TransferForm } from '@/components/ledger/TransferForm';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'Transfer Funds',
  description: 'Move money between cash accounts.',
};

export default async function AdminLedgerTransferPage() {
  const session = await auth();
  const token = (session as any).accessToken;
  const accounts = await ledgerAPI.getAccounts(token);
  const cashAccounts = accounts.filter((a) => a.kind === 'cash');

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-xl">
        <BackLink href="/admin/reports/ledger" label="Back to Chart of Accounts" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">Transfer Funds</h1>
        <TransferForm returnPath="/admin/reports/ledger" cashAccounts={cashAccounts} />
      </div>
    </main>
  );
}
