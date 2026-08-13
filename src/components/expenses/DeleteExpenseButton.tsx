'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { expenseAPI } from '@/services/api/expense-api';
import { ApiError } from '@/services/api/client';

export function DeleteExpenseButton({ expenseId, expenseType }: { expenseId: string; expenseType: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Delete this "${expenseType}" expense? This can't be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await expenseAPI.deleteExpense(expenseId);
      toast({ title: 'Expense deleted' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-destructive hover:text-destructive">
      <Icons.trash2 className="h-4 w-4" />
    </Button>
  );
}
