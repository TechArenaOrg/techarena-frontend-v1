'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

export const VENDOR_NAV_ITEMS = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: Icons.layoutDashboard },
  { href: '/vendor/products', label: 'Manage Products', icon: Icons.package },
  { href: '/vendor/orders', label: 'Orders', icon: Icons.shoppingCart },
  { href: '/vendor/expenses', label: 'Expenses', icon: Icons.creditCard },
  { href: '/vendor/purchase-orders', label: 'Purchase Orders', icon: Icons.truck },
  { href: '/vendor/ledger', label: 'My Accounts', icon: Icons.fileText },
];

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-56 shrink-0 border-r bg-primary/30 dark:bg-primary/35">
      <div className="sticky top-14 p-4 space-y-1">
        <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Vendor
        </p>
        {VENDOR_NAV_ITEMS.map((item) => {
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
