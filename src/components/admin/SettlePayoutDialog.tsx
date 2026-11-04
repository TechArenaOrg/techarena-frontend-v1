'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleModal } from '@/components/ui/simple-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ledgerAPI, LedgerAccount } from '@/services/api/ledger-api';
import { ApiError } from '@/services/api/client';
import { formatCurrency } from '@/lib/utils';

interface SettlePayoutDialogProps {
  vendorId: string;
  vendorName: string;
  pendingPayout: number;
  // Platform cash accounts (Petty Cash, Bank, Mobile Money, ...) - whichever one the
  // payout actually went out from.
  cashAccounts: LedgerAccount[];
}

// Admin/super_admin only - the page that renders this only shows it to those roles.
// Atomically settles some or all of a vendor's pending payout via the backend's
// dedicated endpoint (splits/settles the Creditors entries and posts a matching
// cash-out entry in one transaction) - replaces the old single-flag "Mark as Paid".
export function SettlePayoutDialog({ vendorId, vendorName, pendingPayout, cashAccounts }: SettlePayoutDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cashAccountId, setCashAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const resetAndClose = () => {
    setOpen(false);
    setError(null);
    setCashAccountId('');
    setAmount('');
    setNote('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cashAccountId) {
      setError('Choose which account this payment came from.');
      return;
    }
    let parsedAmount: number | undefined;
    if (amount.trim()) {
      parsedAmount = parseFloat(amount);
      if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
        setError('Amount must be a positive number.');
        return;
      }
      if (parsedAmount > pendingPayout) {
        setError(`Amount can't exceed the pending payout of ${formatCurrency(pendingPayout)}.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await ledgerAPI.settlePayout({
        vendorId,
        cashAccountId,
        amount: parsedAmount,
        note: note.trim() || undefined,
      });
      toast({ title: 'Payout settled' });
      resetAndClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={pendingPayout <= 0}>
        Settle Payout
      </Button>
      <SimpleModal open={open} onClose={resetAndClose} title={`Settle Payout — ${vendorName}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            Pending payout: <span className="font-medium text-foreground">{formatCurrency(pendingPayout)}</span>
          </p>

          <div className="space-y-2">
            <Label htmlFor="settleCashAccount">Paid from</Label>
            <Select value={cashAccountId} onValueChange={setCashAccountId} disabled={isSubmitting}>
              <SelectTrigger id="settleCashAccount">
                <SelectValue placeholder="Select an account" />
              </SelectTrigger>
              <SelectContent>
                {cashAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settleAmount">Amount (UGX)</Label>
            <Input
              id="settleAmount"
              type="number"
              min={0}
              step="0.01"
              placeholder={`Full amount (${formatCurrency(pendingPayout)})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Leave blank to settle the full pending payout.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settleNote">Note</Label>
            <Input
              id="settleNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Settling...' : 'Settle Payout'}
            </Button>
            <Button type="button" variant="outline" onClick={resetAndClose} disabled={isSubmitting}>
              Cancel
            </Button>
          </div>
        </form>
      </SimpleModal>
    </>
  );
}
