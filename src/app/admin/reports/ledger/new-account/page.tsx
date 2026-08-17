import { Metadata } from 'next';
import { auth } from '@/auth';
import { vendorAPI } from '@/services/api/vendor-api';
import { LedgerAccountForm } from '@/components/ledger/LedgerAccountForm';

export const metadata: Metadata = {
  title: 'New Ledger Account',
  description: 'Create a new ledger account.',
};

export default async function NewLedgerAccountPage() {
  const session = await auth();
  const token = (session as any).accessToken;
  const vendors = await vendorAPI.getVendors(token);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">New Ledger Account</h1>
        <LedgerAccountForm returnPath="/admin/reports/ledger" vendors={vendors} />
      </div>
    </main>
  );
}
