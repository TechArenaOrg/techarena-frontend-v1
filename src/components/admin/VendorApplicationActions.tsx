'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { vendorAPI } from '@/services/api/vendor-api';
import { ApiError } from '@/services/api/client';
import type { VendorStatus } from '@/types';

interface VendorApplicationActionsProps {
  vendorId: string;
  status: VendorStatus;
  commissionRate: number;
}

export function VendorApplicationActions({ vendorId, status, commissionRate }: VendorApplicationActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [confirmAction, setConfirmAction] = useState<'reject' | 'suspend' | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [rate, setRate] = useState(String(commissionRate));
  const [isSavingRate, setIsSavingRate] = useState(false);

  const run = async (action: () => Promise<unknown>, successTitle: string) => {
    setIsWorking(true);
    try {
      await action();
      toast({ title: successTitle });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Action failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsWorking(false);
      setConfirmAction(null);
    }
  };

  const handleSaveRate = async () => {
    const parsed = Number(rate);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
      toast({ title: 'Invalid commission rate', description: 'Enter a number between 0 and 100.', variant: 'destructive' });
      return;
    }
    setIsSavingRate(true);
    try {
      await vendorAPI.updateVendorCommission(vendorId, parsed);
      toast({ title: 'Commission rate updated' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Could not update commission',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingRate(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === 'pending' && (
        <>
          <Button size="sm" disabled={isWorking} onClick={() => run(() => vendorAPI.approveVendor(vendorId), 'Vendor approved')}>
            Approve
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" disabled={isWorking} onClick={() => setConfirmAction('reject')}>
            Reject
          </Button>
        </>
      )}

      {status === 'approved' && (
        <>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              max={100}
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="h-8 w-20"
              disabled={isSavingRate}
            />
            <span className="text-sm text-muted-foreground">%</span>
            <Button size="sm" variant="outline" disabled={isSavingRate || rate === String(commissionRate)} onClick={handleSaveRate}>
              {isSavingRate ? 'Saving...' : 'Save'}
            </Button>
          </div>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" disabled={isWorking} onClick={() => setConfirmAction('suspend')}>
            Suspend
          </Button>
        </>
      )}

      {(status === 'suspended' || status === 'rejected') && (
        <Button size="sm" variant="outline" disabled={isWorking} onClick={() => run(() => vendorAPI.approveVendor(vendorId), 'Vendor approved')}>
          Approve
        </Button>
      )}

      <ConfirmDialog
        open={confirmAction === 'reject'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => run(() => vendorAPI.rejectVendor(vendorId), 'Application rejected')}
        title="Reject this application?"
        description="The applicant will remain a customer and won't be granted vendor access."
        confirmLabel="Reject"
        isConfirming={isWorking}
      />
      <ConfirmDialog
        open={confirmAction === 'suspend'}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => run(() => vendorAPI.suspendVendor(vendorId), 'Vendor suspended')}
        title="Suspend this vendor?"
        description="Their account will be demoted back to a customer and their products/storefront will no longer be accessible as a vendor."
        confirmLabel="Suspend"
        isConfirming={isWorking}
      />
    </div>
  );
}
