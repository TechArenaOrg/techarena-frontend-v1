'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';

interface DestructiveActionDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  requiredPhrase: string;
  confirmLabel?: string;
  isConfirming?: boolean;
}

// Same portal pattern as ConfirmDialog, but for actions the backend itself requires a
// literal confirmation phrase for (data clean/restore) - typing it is the only way to
// enable the confirm button, so this can't be fat-fingered via a stray click.
export function DestructiveActionDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  requiredPhrase,
  confirmLabel = 'Confirm',
  isConfirming = false,
}: DestructiveActionDialogProps) {
  const [typed, setTyped] = useState('');

  if (!open || typeof document === 'undefined') return null;

  const matches = typed === requiredPhrase;

  const handleCancel = () => {
    setTyped('');
    onCancel();
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="rounded-full bg-destructive/10 p-3">
            <Icons.alertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div className="space-y-1.5 w-full">
            <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
            <div className="text-sm text-muted-foreground text-left">{description}</div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium block">
            Type <span className="font-mono font-bold">{requiredPhrase}</span> to confirm
          </label>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={isConfirming}
            autoComplete="off"
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-center">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isConfirming}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={!matches || isConfirming}>
            {isConfirming ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
}
