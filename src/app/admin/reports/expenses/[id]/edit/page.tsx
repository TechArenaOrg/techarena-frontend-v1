import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { expenseAPI } from '@/services/api/expense-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export const metadata: Metadata = {
  title: 'Edit Expense',
  description: 'Update a logged expense.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditAdminExpensePage({ params }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { id } = await params;

  const [expense, vendors] = await Promise.all([
    expenseAPI.getExpense(id, token).catch(() => null),
    vendorAPI.getVendors(token),
  ]);

  if (!expense) {
    notFound();
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Expense</h1>
        <ExpenseForm expense={expense} vendors={vendors} returnPath="/admin/reports/expenses" />
      </div>
    </main>
  );
}
