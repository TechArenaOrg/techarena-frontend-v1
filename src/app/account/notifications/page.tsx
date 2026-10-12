import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import { auth } from '@/auth';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Notifications - TechArena Uganda',
  description: 'Email and SMS notification preferences.',
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/account' },
    { label: 'Notifications', href: '/account/notifications' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Email and SMS notification preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>

          <main className="lg:col-span-3">
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>Notification preferences are coming soon.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
