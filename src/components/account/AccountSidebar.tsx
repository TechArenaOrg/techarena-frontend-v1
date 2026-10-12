'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import {
  User,
  Package,
  Heart,
  MapPin,
  Bell,
  Settings,
  Shield,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function AccountSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // This list used to be static and shown to every role unconditionally - an admin
  // or vendor would see "Orders"/"Wishlist" (shopping features neither role has a use
  // for) and "Dashboard" always pointed at the customer dashboard regardless of role.
  // Notifications and Security apply to every role equally (unlike Orders/Wishlist),
  // but the backend has no endpoints for either yet (no change-password-while-logged-in
  // or notification-preferences API) - kept visible as a roadmap placeholder pointing
  // at a "coming soon" page rather than a 404, for whenever that backend work lands.
  // Payment Methods was dropped outright - not on the roadmap, no page, pure dead link.
  const role = (session?.user as any)?.role;
  const isCustomer = role !== 'admin' && role !== 'vendor';
  const dashboardHref = role === 'admin' ? '/admin/dashboard' : role === 'vendor' ? '/vendor/dashboard' : '/dashboard';

  const navigationItems = [
    {
      name: 'Dashboard',
      href: dashboardHref,
      icon: User,
      description: 'Overview of your account'
    },
    ...(isCustomer ? [
      {
        name: 'Orders',
        href: '/account/orders',
        icon: Package,
        description: 'View and track your orders'
      },
      {
        name: 'Wishlist',
        href: '/account/wishlist',
        icon: Heart,
        description: 'Your saved products'
      },
      {
        name: 'Addresses',
        href: '/account/addresses',
        icon: MapPin,
        description: 'Shipping and billing addresses'
      },
    ] : []),
    {
      name: 'Notifications',
      href: '/account/notifications',
      icon: Bell,
      description: 'Email and SMS preferences'
    },
    {
      name: 'Profile Settings',
      href: '/account/profile',
      icon: Settings,
      description: 'Update your personal information'
    },
    {
      name: 'Security',
      href: '/account/security',
      icon: Shield,
      description: 'Password and security settings'
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
                    isActive && 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  )}
                >
                  <Icon className={cn(
                    'h-5 w-5',
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  )} />
                  <div className="flex-1">
                    <div className={cn(
                      'font-medium',
                      isActive ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    )}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Sign Out Button */}
      <Card>
        <CardContent className="p-4">
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}