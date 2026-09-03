'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { 
  User, 
  Package, 
  Heart, 
  CreditCard, 
  MapPin, 
  Bell, 
  Settings, 
  LogOut,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: User,
    description: 'Overview of your account'
  },
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
    name: 'Payment Methods',
    href: '/account/payment-methods',
    icon: CreditCard,
    description: 'Manage payment options'
  },
  {
    name: 'Addresses',
    href: '/account/addresses',
    icon: MapPin,
    description: 'Shipping and billing addresses'
  },
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

export function AccountSidebar() {
  const pathname = usePathname();

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