'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { expenseAPI, Expense, ExpenseInput } from '@/services/api/expense-api';
import { ApiError } from '@/services/api/client';
import type { Vendor } from '@/types';

const SUGGESTED_TYPES = ['Transport', 'Internet / Airtime', 'Marketing', 'Rent / Shop expenses', 'Salaries / Commission', 'Mopping', 'Other'];

interface ExpenseFormProps {
  expense?: Expense;
  returnPath: string;
  // Only passed for the admin flow - lets an expense be assigned to a specific vendor,
  // or left unassigned for a platform-level expense (rent, admin salaries, etc).
  vendors?: Vendor[];
  // Set by callers rendering this form inside a Dialog instead of a full page.
  onSuccess?: () => void;
  onCancel?: () => void;
  bare?: boolean;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function ExpenseForm({ expense, returnPath, vendors, onSuccess, onCancel, bare }: ExpenseFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!expense;

  const [type, setType] = useState(expense?.type ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [date, setDate] = useState(expense?.date ?? todayIso());
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [vendorId, setVendorId] = useState(expense?.vendorId ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!type.trim()) {
      setError('Please enter or select an expense type.');
      return;
    }

    const input: ExpenseInput = {
      type: type.trim(),
      amount: parseFloat(amount),
      date,
      notes: notes || undefined,
      vendorId: vendors ? vendorId || null : undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await expenseAPI.updateExpense(expense.id, input);
        toast({ title: 'Expense updated' });
      } else {
        await expenseAPI.createExpense(input);
        toast({ title: 'Expense logged' });
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(returnPath);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formBody = (
    <>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {vendors && (
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor (leave blank for a platform-level expense)</Label>
              <Select value={vendorId} onValueChange={setVendorId} disabled={isSubmitting}>
                <SelectTrigger id="vendor">
                  <SelectValue placeholder="Platform-level (no vendor)" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Expense Type</Label>
              <Input
                id="type"
                list="expense-type-suggestions"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g. Transport"
                required
                disabled={isSubmitting}
              />
              <datalist id="expense-type-suggestions">
                {SUGGESTED_TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (UGX)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Log Expense'}
            </Button>
            <Button type="button" variant="outline" onClick={() => (onCancel ? onCancel() : router.push(returnPath))} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
    </>
  );

  return bare ? (
    formBody
  ) : (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Expense' : 'Log Expense'}</CardTitle>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
