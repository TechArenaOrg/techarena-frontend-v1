import { Badge } from '@/components/ui/badge';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' | 'info'> = {
  pending: 'secondary',
  confirmed: 'outline',
  processing: 'warning',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'destructive',
  refunded: 'destructive',
  failed: 'destructive',
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'outline'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
