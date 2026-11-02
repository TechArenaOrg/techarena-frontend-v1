import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Store } from 'lucide-react';
import { auth } from '@/auth';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { BecomeVendorForm } from '@/components/account/BecomeVendorForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Become a Vendor - TechArena Uganda',
  description: 'Apply to sell your products on TechArena.',
};

export default async function BecomeVendorPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any)?.role;

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/account' },
    { label: 'Become a Vendor', href: '/account/become-vendor' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Become a Vendor</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Apply to start selling your products on TechArena.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>

          <main className="lg:col-span-3">
            {role === 'vendor' ? (
              <Card>
                <CardContent className="py-16 text-center space-y-3">
                  <Store className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">You're already a vendor on TechArena.</p>
                  <Button asChild>
                    <Link href="/vendor/dashboard">Go to Vendor Dashboard</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <BecomeVendorForm />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
