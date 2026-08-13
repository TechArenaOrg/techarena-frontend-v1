import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ordersAPI } from '@/services/api/orders-api';
import { OrdersList } from '@/components/account/OrdersList';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export const metadata: Metadata = {
  title: 'My Orders - TechArena Uganda',
  description: 'View and manage your TechArena orders and order history.',
};

interface SearchParams {
  status?: string;
  page?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const currentPage = resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1;
  const { orders, totalPages, hasNextPage, hasPreviousPage } = await ordersAPI.getMyOrders(
    { status: resolvedSearchParams.status, page: currentPage, limit: 10 },
    (session as any).accessToken
  );

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'My Account', href: '/account' },
    { label: 'Orders', href: '/account/orders' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="mt-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and manage your TechArena orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <OrdersList
              orders={orders}
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
            />
          </main>
        </div>
      </div>
    </div>
  );
}