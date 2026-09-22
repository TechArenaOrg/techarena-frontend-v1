import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { dashboardAPI } from '@/services/api/dashboard-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { WishlistStatCard } from '@/components/dashboard/WishlistStatCard';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your account, orders, and preferences.',
};

type DashboardOrders = Awaited<ReturnType<typeof dashboardAPI.getMyDashboard>>['orders'];

function DashboardStats({
  totalOrders,
  totalSpent,
  savedAmount,
}: {
  totalOrders: number;
  totalSpent: number;
  savedAmount: number;
}) {
  const stats = [
    { title: 'Total Orders', value: String(totalOrders), icon: Icons.package },
    { title: 'Total Spent', value: formatCurrency(totalSpent), icon: Icons.dollarSign },
    {
      title: 'Saved Amount',
      value: formatCurrency(savedAmount),
      description: 'From deals and discounts',
      icon: Icons.trendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
      <WishlistStatCard />
    </div>
  );
}

function RecentOrders({ orders }: { orders: DashboardOrders }) {
  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest orders and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You haven't placed any orders yet.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Your latest orders and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice(0, 5).map((order: DashboardOrders[number]) => (
            <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
              <div className="space-y-1">
                <p className="text-sm font-medium">{order.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''} •{' '}
                  {order.placedAt.toLocaleDateString()}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">{formatCurrency(order.totalAmount)}</p>
                <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/account/orders">View All Orders</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface PageProps {
  searchParams: Promise<{ fresh?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role === 'vendor') {
    redirect('/vendor/dashboard');
  }
  if (role === 'admin' || role === 'super_admin') {
    redirect('/admin/dashboard');
  }
  // 'fresh' means this is a just-signed-in landing (Google OAuth can't jump straight
  // to '/' for a customer the way credentials login does, since the role isn't known
  // until after this redirect completes) - send them home like every other fresh
  // login. Without it, this is someone who explicitly clicked "Dashboard" in the menu
  // and should see the real page below.
  const { fresh } = await searchParams;
  if (role === 'customer' && fresh) {
    redirect('/');
  }
  if (role !== 'customer') {
    return (
      <main className="flex-1 space-y-6 p-6">
        <div className="container">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            No dashboard is built yet for the "{role}" role.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      </main>
    );
  }

  const { orders, totalOrders, totalSpent, savedAmount } = await dashboardAPI.getMyDashboard(
    (session as any).accessToken
  );

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your account activity.
          </p>
        </div>

        <div className="mt-6">
          <DashboardStats totalOrders={totalOrders} totalSpent={totalSpent} savedAmount={savedAmount} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <RecentOrders orders={orders} />

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/products">
                  <Icons.search className="mr-2 h-4 w-4" />
                  Browse Products
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/account/orders">
                  <Icons.package className="mr-2 h-4 w-4" />
                  Track Orders
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/account/wishlist">
                  <Icons.heart className="mr-2 h-4 w-4" />
                  View Wishlist
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/account/profile">
                  <Icons.user className="mr-2 h-4 w-4" />
                  Update Profile
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Based on your shopping history</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Coming soon.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
