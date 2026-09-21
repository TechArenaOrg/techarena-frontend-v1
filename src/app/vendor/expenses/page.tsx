import { Metadata } from 'next';
import { auth } from '@/auth';
import { expenseAPI } from '@/services/api/expense-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { ExpenseDateRangeFilter } from '@/components/expenses/ExpenseDateRangeFilter';
import { DeleteExpenseButton } from '@/components/expenses/DeleteExpenseButton';
import { ExpenseFormDialog } from '@/components/expenses/ExpenseFormDialog';

export const metadata: Metadata = {
  title: 'My Expenses',
  description: 'Log and track your shop expenses.',
};

interface PageProps {
  searchParams: Promise<{ startDate?: string; endDate?: string; page?: string }>;
}

export default async function VendorExpensesPage({ searchParams }: PageProps) {
  const session = await auth();

  const token = (session as any).accessToken;
  const { startDate, endDate, page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const { expenses, totalCount, totalPages, hasNextPage, hasPreviousPage } = await expenseAPI.getExpenses(
    { startDate, endDate, page: currentPage, limit: 20 },
    token
  );

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Expenses</h1>
            <p className="text-muted-foreground">{totalCount} expense{totalCount !== 1 ? 's' : ''} logged</p>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <ExpenseDateRangeFilter startDate={startDate} endDate={endDate} basePath="/vendor/expenses" />
            <ExpenseFormDialog
              trigger={
                <Button>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Log Expense
                </Button>
              }
            />
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {expenses.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No expenses logged yet.</p>
                <ExpenseFormDialog trigger={<Button>Log your first expense</Button>} />
              </div>
            ) : (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Notes</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium text-right">Amount</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {expenses.map((expense) => (
                        <tr key={expense.id}>
                          <td className="px-6 py-3">{expense.type}</td>
                          <td className="px-6 py-3 text-muted-foreground">{expense.notes || '—'}</td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-3 text-right">{formatCurrency(expense.amount)}</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <ExpenseFormDialog
                                expenseId={expense.id}
                                trigger={
                                  <Button variant="ghost" size="sm">
                                    Edit
                                  </Button>
                                }
                              />
                              <DeleteExpenseButton expenseId={expense.id} expenseType={expense.type} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold bg-muted/60 border-t-2">
                        <td className="px-6 py-3" colSpan={3}>
                          Total (this page)
                        </td>
                        <td className="px-6 py-3 text-right">{formatCurrency(total)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="sm:hidden divide-y">
                  {expenses.map((expense) => (
                    <div key={expense.id} className="p-4 space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{expense.type}</p>
                        <p className="font-medium shrink-0">{formatCurrency(expense.amount)}</p>
                      </div>
                      {expense.notes && <p className="text-sm text-muted-foreground">{expense.notes}</p>}
                      <p className="text-sm text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                      <div className="flex items-center gap-1 pt-1">
                        <ExpenseFormDialog
                          expenseId={expense.id}
                          trigger={
                            <Button variant="ghost" size="sm">
                              Edit
                            </Button>
                          }
                        />
                        <DeleteExpenseButton expenseId={expense.id} expenseType={expense.type} />
                      </div>
                    </div>
                  ))}
                  <div className="p-4 flex items-center justify-between font-bold bg-muted/60">
                    <span>Total (this page)</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />
          </div>
        )}
      </div>
    </main>
  );
}
