import { Metadata } from 'next';
import { auth } from '@/auth';
import { vendorAPI } from '@/services/api/vendor-api';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export const metadata: Metadata = {
  title: 'Log Expense',
  description: 'Log a platform or vendor expense.',
};

export default async function NewAdminExpensePage() {
  const session = await auth();
  const token = (session as any).accessToken;
  const vendors = await vendorAPI.getVendors(token);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Log Expense</h1>
        <ExpenseForm vendors={vendors} returnPath="/admin/reports/expenses" />
      </div>
    </main>
  );
}
