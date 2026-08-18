import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { LedgerEntryForm } from '@/components/ledger/LedgerEntryForm';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'Record Ledger Entry',
  description: 'Record a new ledger entry.',
};

interface PageProps {
  params: Promise<{ accountId: string }>;
}

export default async function NewLedgerEntryPage({ params }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { accountId } = await params;

  const account = await ledgerAPI.getAccount(accountId, token).catch(() => null);
  if (!account) notFound();

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-xl">
        <BackLink href={`/admin/reports/ledger/${account.id}`} label="Back to Account" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">Record Entry</h1>
        <LedgerEntryForm account={account} returnPath={`/admin/reports/ledger/${account.id}`} />
      </div>
    </main>
  );
}
