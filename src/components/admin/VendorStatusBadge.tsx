import { Badge } from '@/components/ui/badge';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  pending: 'secondary',
  approved: 'success',
  suspended: 'warning',
  rejected: 'destructive',
};

export function VendorStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'secondary'} className="capitalize">
      {status}
    </Badge>
  );
}
