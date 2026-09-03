'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ledgerAPI, LedgerAccount } from '@/services/api/ledger-api';
import { ApiError } from '@/services/api/client';

interface LedgerEntryFormProps {
  account: LedgerAccount;
  returnPath: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  bare?: boolean;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function LedgerEntryForm({ account, returnPath, onSuccess, onCancel, bare }: LedgerEntryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const usesDirection = account.kind === 'cash' || account.kind === 'stock';

  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'in' | 'out'>('in');
  const [isSettled, setIsSettled] = useState(false);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIso());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsSubmitting(true);
    try {
      await ledgerAPI.createEntry({
        accountId: account.id,
        amount: parseFloat(amount),
        direction: usesDirection ? direction : undefined,
        isSettled: usesDirection ? undefined : isSettled,
        note: note || undefined,
        date,
      });
      toast({ title: 'Entry recorded' });
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (UGX)</Label>
              <CurrencyInput id="amount" value={amount} onChange={setAmount} required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required disabled={isSubmitting} />
            </div>
          </div>

          {usesDirection ? (
            <div className="space-y-2">
              <Label htmlFor="direction">Direction</Label>
              <Select value={direction} onValueChange={(value) => setDirection(value as 'in' | 'out')} disabled={isSubmitting}>
                <SelectTrigger id="direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {account.kind === 'stock' ? (
                    <>
                      <SelectItem value="in">In (stock added)</SelectItem>
                      <SelectItem value="out">Out (stock removed)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="in">In (money received)</SelectItem>
                      <SelectItem value="out">Out (money spent)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Checkbox id="isSettled" checked={isSettled} onCheckedChange={(checked) => setIsSettled(checked === true)} disabled={isSubmitting} />
              <Label htmlFor="isSettled" className="cursor-pointer">
                Already settled {account.kind === 'payable' ? '(paid off)' : '(collected)'}
              </Label>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" disabled={isSubmitting} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Record Entry'}
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
        <CardTitle>Record Entry — {account.name}</CardTitle>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
