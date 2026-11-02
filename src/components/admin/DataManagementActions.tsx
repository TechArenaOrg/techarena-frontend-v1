'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DestructiveActionDialog } from '@/components/admin/DestructiveActionDialog';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { adminDataAPI } from '@/services/api/admin-data-api';
import { ApiError } from '@/services/api/client';

export function BackupNowButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  const handleBackup = async () => {
    setIsWorking(true);
    try {
      await adminDataAPI.takeSnapshot(label.trim() || undefined);
      toast({ title: 'Backup created' });
      setOpen(false);
      setLabel('');
      router.refresh();
    } catch (err) {
      toast({
        title: 'Backup failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.rotateCounterClockwise className="mr-2 h-4 w-4" />
        Backup Now
      </Button>
      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Take a backup now"
              className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg"
            >
              <div className="space-y-1.5 text-center">
                <h2 className="text-lg font-semibold leading-none tracking-tight">Take a backup now?</h2>
                <p className="text-sm text-muted-foreground">This creates a snapshot of all current data you can restore to later.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="snapshotLabel" className="text-xs">
                  Optional label
                </Label>
                <Input
                  id="snapshotLabel"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Before Black Friday launch"
                  disabled={isWorking}
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isWorking}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleBackup} disabled={isWorking}>
                  {isWorking ? 'Backing up...' : 'Backup Now'}
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}

export function CleanDataButton({ survivingEmails }: { survivingEmails: string[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const handleClean = async () => {
    setIsWorking(true);
    try {
      const result = await adminDataAPI.cleanData('CLEAN DATA', undefined);
      toast({ title: 'All data wiped', description: `A backup was taken first (snapshot ${result.backupSnapshotId.slice(0, 8)}).` });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: 'Clean failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        <Icons.trash2 className="mr-2 h-4 w-4" />
        Clean All Data
      </Button>
      <DestructiveActionDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleClean}
        title="Wipe all platform data?"
        requiredPhrase="CLEAN DATA"
        confirmLabel="Clean All Data"
        isConfirming={isWorking}
        description={
          <>
            <p>
              This permanently deletes every product, vendor, order, and category, and every user account except:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-0.5">
              {survivingEmails.map((email) => (
                <li key={email} className="font-mono text-xs">{email}</li>
              ))}
            </ul>
            <p className="mt-2">A backup is taken automatically first, so this can be undone by restoring it.</p>
          </>
        }
      />
    </>
  );
}

export function RestoreSnapshotButton({ snapshotId, snapshotLabel }: { snapshotId: string; snapshotLabel: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  const handleRestore = async () => {
    setIsWorking(true);
    try {
      const result = await adminDataAPI.restoreSnapshot(snapshotId, 'RESTORE DATA');
      toast({
        title: 'Data restored',
        description: `Current state was backed up first (snapshot ${result.backupSnapshotId.slice(0, 8)}) before restoring.`,
      });
      setOpen(false);
      router.refresh();
    } catch (err) {
      toast({
        title: 'Restore failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setOpen(true)}>
        Restore
      </Button>
      <DestructiveActionDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleRestore}
        title={`Restore "${snapshotLabel}"?`}
        requiredPhrase="RESTORE DATA"
        confirmLabel="Restore"
        isConfirming={isWorking}
        description={
          <>
            <p>This wipes all current data and replaces it with exactly what's in this snapshot. The current state is backed up first, so this can also be undone.</p>
            <p className="mt-2 font-medium text-foreground">
              If your account didn't exist yet at the time of this snapshot, you'll be signed out and will need to sign in with an account that did exist then.
            </p>
          </>
        }
      />
    </>
  );
}
