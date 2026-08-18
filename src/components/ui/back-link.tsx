import Link from 'next/link';
import { Icons } from '@/components/ui/icons';

export function BackLink({ href, label = 'Back' }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <Icons.arrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}
