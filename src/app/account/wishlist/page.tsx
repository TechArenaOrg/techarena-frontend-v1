import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { WishlistGrid } from '@/components/account/WishlistGrid';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'My Wishlist - TechArena Uganda',
  description: 'View and manage your saved products and wishlist items.',
};

export default async function WishlistPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/account' },
    { label: 'Wishlist', href: '/account/wishlist' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your saved products and items you want to purchase later.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Suspense fallback={<div>Loading wishlist...</div>}>
              <WishlistGrid />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}