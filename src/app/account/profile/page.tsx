import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ProfileForm } from '@/components/account/ProfileForm';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'Profile Settings - TechArena Uganda',
  description: 'Update your TechArena profile information and preferences.',
};

export default async function ProfilePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/account' },
    { label: 'Profile', href: '/account/profile' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update your personal information and account preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Suspense fallback={<div>Loading profile...</div>}>
              <ProfileForm user={session.user} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}