'use client';

import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  variant?: 'destructive' | 'default';
}

// Same Radix-free portal pattern as SimpleModal - styled replacement for
// window.confirm(), used for destructive actions like deleting an account.
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isConfirming = false,
  variant = 'destructive',
}: ConfirmDialogProps) {
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className="fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 shadow-lg"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {variant === 'destructive' && (
            <div className="rounded-full bg-destructive/10 p-3">
              <Icons.trash2 className="h-5 w-5 text-destructive" />
            </div>
          )}
          <div className="space-y-1.5">
            <h2 className="text-lg font-semibold leading-none tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-center">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isConfirming}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
}
