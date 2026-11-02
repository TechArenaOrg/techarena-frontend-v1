'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { getAdminNavItems } from '@/components/admin/admin-nav-items';

// Nav items carry icon component references, which can't cross a Server-to-Client
// prop boundary (functions aren't serializable over RSC) - so role-based filtering
// happens here, client-side via the session, rather than being computed server-side
// and passed down as a prop. Same reasoning as AccountSidebar.
export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? '';
  const items = getAdminNavItems(role);

  return (
    <aside className="hidden lg:block w-56 shrink-0 border-r bg-primary/30 dark:bg-primary/35">
      <div className="sticky top-14 p-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Admin
        </p>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
