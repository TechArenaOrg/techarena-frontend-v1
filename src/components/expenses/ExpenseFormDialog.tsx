'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Icons } from '@/components/ui/icons';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { expenseAPI, Expense } from '@/services/api/expense-api';
import type { Vendor } from '@/types';

interface ExpenseFormDialogProps {
  trigger: ReactNode;
  vendors?: Vendor[];
  // When set, the dialog fetches this expense's full record on open and shows the
  // edit form. When omitted, it shows the create form.
  expenseId?: string;
}

export function ExpenseFormDialog({ trigger, vendors, expenseId }: ExpenseFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(false);
  const isEditing = !!expenseId;

  useEffect(() => {
    if (open && expenseId) {
      setLoading(true);
      expenseAPI
        .getExpense(expenseId)
        .then(setExpense)
        .finally(() => setLoading(false));
    }
    if (!open) {
      setExpense(null);
    }
  }, [open, expenseId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Log Expense'}</DialogTitle>
        </DialogHeader>
        {isEditing && loading ? (
          <div className="flex justify-center py-12">
            <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isEditing && !expense ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Couldn't load this expense.</p>
        ) : (
          <ExpenseForm
            vendors={vendors}
            expense={expense ?? undefined}
            bare
            returnPath=""
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
