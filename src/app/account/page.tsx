import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AccountDashboard } from '@/components/account/AccountDashboard';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'My Account - TechArena Uganda',
  description: 'Manage your TechArena account, orders, profile, and preferences.',
};

export default async function AccountPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/account' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {session.user.name}! Manage your account and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Suspense fallback={<div>Loading dashboard...</div>}>
              <AccountDashboard user={session.user} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}