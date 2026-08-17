import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { TransferForm } from '@/components/ledger/TransferForm';

export const metadata: Metadata = {
  title: 'Transfer Funds',
  description: 'Move money between your cash accounts.',
};

export default async function VendorLedgerTransferPage() {
  const session = await auth();
  if (!session?.user) redirect('/auth/login');
  const role = (session.user as any).role;
  if (role !== 'vendor') redirect(role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard');

  const token = (session as any).accessToken;
  const accounts = await ledgerAPI.getAccounts(token);
  const cashAccounts = accounts.filter((a) => a.kind === 'cash');

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Transfer Funds</h1>
        <TransferForm returnPath="/vendor/ledger" cashAccounts={cashAccounts} />
      </div>
    </main>
  );
}
