import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import { expenseAPI } from '@/services/api/expense-api';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';

export const metadata: Metadata = {
  title: 'Edit Expense',
  description: 'Update a logged expense.',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVendorExpensePage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role !== 'vendor') {
    redirect(role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard');
  }

  const { id } = await params;
  const token = (session as any).accessToken;

  // The backend enforces real ownership (a vendor gets a 403 on another party's
  // expense) - this just turns that into a normal not-found page instead of a crash.
  const expense = await expenseAPI.getExpense(id, token).catch(() => null);
  if (!expense) {
    notFound();
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Expense</h1>
        <ExpenseForm expense={expense} returnPath="/vendor/expenses" />
      </div>
    </main>
  );
}
