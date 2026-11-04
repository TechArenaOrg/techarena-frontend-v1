import { Icons } from '@/components/ui/icons';
import type { SectionNavItem } from '@/components/ui/mobile-section-nav';

// Plain module (no 'use client') so admin/layout.tsx, a Server Component, can call
// getAdminNavItems() directly - a function exported from a 'use client' file can only
// be used as a Client Component, never invoked from server code.
const ALL_ADMIN_NAV_ITEMS: (SectionNavItem & { superAdminOnly?: boolean })[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: Icons.layoutDashboard },
  { href: '/admin/products', label: 'Manage Products', icon: Icons.package },
  { href: '/admin/categories', label: 'Manage Categories', icon: Icons.folderTree },
  { href: '/admin/orders', label: 'Manage Orders', icon: Icons.shoppingCart },
  { href: '/admin/vendors', label: 'Vendor Applications', icon: Icons.store },
  { href: '/admin/users', label: 'Manage Users', icon: Icons.users },
  { href: '/admin/sales-report', label: 'Sales Report', icon: Icons.trendingUp },
  { href: '/admin/reports', label: 'Reports', icon: Icons.fileText },
  // Destructive (clean/restore all platform data) and backend-enforced super_admin-only
  // - hidden for a plain admin rather than shown disabled, since there's genuinely
  // nothing for them to do with it.
  { href: '/admin/data-management', label: 'Data Management', icon: Icons.database, superAdminOnly: true },
  { href: '/admin/settings', label: 'Settings', icon: Icons.settings },
];

export function getAdminNavItems(role: string): SectionNavItem[] {
  return ALL_ADMIN_NAV_ITEMS.filter((item) => !item.superAdminOnly || role === 'super_admin');
}
