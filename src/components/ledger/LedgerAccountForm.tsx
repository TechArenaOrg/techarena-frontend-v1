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
import { ledgerAPI, LedgerAccountKind } from '@/services/api/ledger-api';
import { ApiError } from '@/services/api/client';
import type { Vendor } from '@/types';

interface LedgerAccountFormProps {
  returnPath: string;
  vendors: Vendor[];
  onSuccess?: () => void;
  onCancel?: () => void;
  bare?: boolean;
}

export function LedgerAccountForm({ returnPath, vendors, onSuccess, onCancel, bare }: LedgerAccountFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [kind, setKind] = useState<LedgerAccountKind>('cash');
  const [vendorId, setVendorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter an account name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await ledgerAPI.createAccount({ name: name.trim(), kind, vendorId: vendorId || null });
      toast({ title: 'Ledger account created' });
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
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bank" required disabled={isSubmitting} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kind">Kind</Label>
            <Select value={kind} onValueChange={(value) => setKind(value as LedgerAccountKind)} disabled={isSubmitting}>
              <SelectTrigger id="kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash (petty cash, bank, mobile money...)</SelectItem>
                <SelectItem value="payable">Payable (money the business owes)</SelectItem>
                <SelectItem value="receivable">Receivable (money owed to the business)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor (leave blank for a platform-level account)</Label>
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

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create Account'}
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
        <CardTitle>New Ledger Account</CardTitle>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
