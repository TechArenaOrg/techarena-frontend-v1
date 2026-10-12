import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Shield } from 'lucide-react';
import { auth } from '@/auth';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Security - TechArena Uganda',
  description: 'Password and security settings.',
};

export default async function SecurityPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/account' },
    { label: 'Security', href: '/account/security' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Security
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Password and security settings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>

          <main className="lg:col-span-3">
            <Card>
              <CardContent className="py-16 text-center text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>Password and security settings are coming soon.</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
