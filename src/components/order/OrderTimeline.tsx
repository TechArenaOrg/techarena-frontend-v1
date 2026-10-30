import { Check, Package, Truck, ClipboardCheck, Home, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const STEPS: { key: OrderStatus; label: string; icon: typeof Check }[] = [
  { key: 'pending', label: 'Order Placed', icon: ClipboardCheck },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Home },
];

const STEP_INDEX: Record<string, number> = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

interface OrderTimelineProps {
  status: OrderStatus;
  placedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

function formatStamp(date?: Date) {
  if (!date) return null;
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function OrderTimeline({ status, placedAt, shippedAt, deliveredAt, cancelledAt }: OrderTimelineProps) {
  if (status === 'cancelled' || status === 'refunded' || status === 'failed') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <XCircle className="h-5 w-5 shrink-0 text-destructive" />
        <div>
          <p className="font-medium text-destructive">
            {status === 'cancelled' ? 'Order Cancelled' : status === 'refunded' ? 'Order Refunded' : 'Order Failed'}
          </p>
          {cancelledAt && <p className="text-muted-foreground">{formatStamp(cancelledAt)}</p>}
        </div>
      </div>
    );
  }

  const currentIndex = STEP_INDEX[status] ?? 0;
  const stamps: Partial<Record<OrderStatus, Date | undefined>> = {
    pending: placedAt,
    shipped: shippedAt,
    delivered: deliveredAt,
  };

  const circleClass = (isComplete: boolean, isCurrent: boolean) =>
    cn(
      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2',
      isComplete && 'border-primary bg-primary text-primary-foreground',
      isCurrent && 'border-primary text-primary',
      !isComplete && !isCurrent && 'border-muted-foreground/30 text-muted-foreground/50'
    );

  const labelClass = (isComplete: boolean, isCurrent: boolean) =>
    cn('text-sm font-medium', (isComplete || isCurrent) ? 'text-foreground' : 'text-muted-foreground/60');

  return (
    <>
      {/* Mobile: vertical stepper */}
      <div className="flex flex-col sm:hidden">
        {STEPS.map((step, i) => {
          const isComplete = i < currentIndex || (i === currentIndex && status === 'delivered');
          const isCurrent = i === currentIndex && status !== 'delivered';
          const Icon = step.icon;
          const stamp = formatStamp(stamps[step.key]);

          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={circleClass(isComplete, isCurrent)}>
                  {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('my-1 w-0.5 flex-1', i < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20')} />
                )}
              </div>
              <div className="pb-6">
                <p className={labelClass(isComplete, isCurrent)}>{step.label}</p>
                {stamp && <p className="text-xs text-muted-foreground">{stamp}</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:flex sm:items-start">
        {STEPS.map((step, i) => {
          const isComplete = i < currentIndex || (i === currentIndex && status === 'delivered');
          const isCurrent = i === currentIndex && status !== 'delivered';
          const Icon = step.icon;
          const stamp = formatStamp(stamps[step.key]);

          return (
            <div key={step.key} className={cn('flex flex-col items-center', i < STEPS.length - 1 && 'flex-1')}>
              <div className="flex w-full items-center">
                <div className={circleClass(isComplete, isCurrent)}>
                  {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('h-0.5 flex-1', i < currentIndex ? 'bg-primary' : 'bg-muted-foreground/20')} />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className={labelClass(isComplete, isCurrent)}>{step.label}</p>
                {stamp && <p className="text-xs text-muted-foreground">{stamp}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
