import { Metadata } from 'next';
import { auth } from '@/auth';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'Log Expense',
  description: 'Log a new shop expense.',
};

export default async function NewVendorExpensePage() {
  const session = await auth();

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-2xl">
        <BackLink href="/vendor/expenses" label="Back to Expenses" />
        <h1 className="text-3xl font-bold tracking-tight mb-6">Log Expense</h1>
        <ExpenseForm returnPath="/vendor/expenses" />
      </div>
    </main>
  );
}
