import { Metadata } from 'next';
import { Suspense } from 'react';
import { DashboardStatsSkeleton, PageHeaderSkeleton } from '@/components/ui/skeletons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your account, orders, and preferences.',
};

async function DashboardStats() {
  // Mock data - replace with actual API calls
  const stats = [
    {
      title: 'Total Orders',
      value: '24',
      description: '+2 from last month',
      icon: Icons.package,
    },
    {
      title: 'Wishlist Items',
      value: '8',
      description: '3 items on sale',
      icon: Icons.heart,
    },
    {
      title: 'Total Spent',
      value: 'UGX 2,450,000',
      description: '+12% from last month',
      icon: Icons.dollarSign,
    },
    {
      title: 'Saved Amount',
      value: 'UGX 180,000',
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
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

async function RecentOrders() {
  // Mock data - replace with actual API calls
  const orders = [
    {
      id: 'ORD-001',
      status: 'Delivered',
      total: 'UGX 890,000',
      date: '2024-03-15',
      items: 2,
    },
    {
      id: 'ORD-002',
      status: 'Processing',
      total: 'UGX 450,000',
      date: '2024-03-18',
      items: 1,
    },
    {
      id: 'ORD-003',
      status: 'Shipped',
      total: 'UGX 1,200,000',
      date: '2024-03-20',
      items: 3,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Your latest orders and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
              <div className="space-y-1">
                <p className="text-sm font-medium">{order.id}</p>
                <p className="text-sm text-muted-foreground">
                  {order.items} item{order.items > 1 ? 's' : ''} • {order.date}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">{order.total}</p>
                <p className="text-xs text-muted-foreground">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/orders">View All Orders</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
        <div className="container">
          <Suspense fallback={<PageHeaderSkeleton />}>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's an overview of your account activity.
              </p>
            </div>
          </Suspense>

          <Suspense fallback={<DashboardStatsSkeleton />}>
            <DashboardStats />
          </Suspense>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Suspense fallback={<Card className="p-6"><div className="space-y-3"><div className="h-4 bg-gray-200 rounded animate-pulse" /><div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" /></div></Card>}>
              <RecentOrders />
            </Suspense>

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
                  <Link href="/orders">
                    <Icons.package className="mr-2 h-4 w-4" />
                    Track Orders
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/wishlist">
                    <Icons.heart className="mr-2 h-4 w-4" />
                    View Wishlist
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/profile">
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
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse" />
                      <div className="h-2 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
    </main>
  );
}