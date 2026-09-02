'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Icons.layoutDashboard },
  { href: '/admin/products', label: 'Manage Products', icon: Icons.package },
  { href: '/admin/orders', label: 'Manage Orders', icon: Icons.shoppingCart },
  { href: '/admin/sales-report', label: 'Sales Report', icon: Icons.trendingUp },
  { href: '/admin/reports', label: 'Reports', icon: Icons.fileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-56 shrink-0 border-r bg-primary/30 dark:bg-primary/35">
      <div className="sticky top-14 p-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Admin
        </p>
        {NAV_ITEMS.map((item) => {
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
