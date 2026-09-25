import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { adminAPI } from '@/services/api/admin-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Platform-wide stats, orders, and vendor approvals.',
};

type AdminDashboard = Awaited<ReturnType<typeof adminAPI.getDashboard>>;

function PlatformStatsGrid({ stats }: { stats: AdminDashboard['platformStats'] }) {
  const cards = [
    { title: 'Total Products', value: String(stats.totalProducts), icon: Icons.package },
    { title: 'Total Vendors', value: String(stats.totalVendors), icon: Icons.store },
    { title: 'Total Customers', value: String(stats.totalCustomers), icon: Icons.user },
    { title: 'Total Orders', value: String(stats.totalOrders), icon: Icons.shoppingCart },
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: Icons.dollarSign },
    { title: 'Avg. Order Value', value: formatCurrency(stats.averageOrderValue), icon: Icons.trendingUp },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SystemHealthCard({ health }: { health: AdminDashboard['systemHealth'] }) {
  const uptimeHours = Math.floor((health.uptime || 0) / (1000 * 60 * 60));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icons.shield className="h-4 w-4" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'} className="capitalize">
            {health.status}
          </Badge>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Uptime</span>
          <span>{uptimeHours}h</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Active Users</span>
          <span>{health.activeUsers}</span>
        </div>
        {health.lastBackup && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Backup</span>
            <span>{new Date(health.lastBackup).toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentOrdersCard({ orders }: { orders: AdminDashboard['recentOrders'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest orders across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order: AdminDashboard['recentOrders'][number]) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-b-0 hover:bg-muted/50 transition-colors -mx-2 px-2 rounded">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingVendorsCard({ vendors }: { vendors: AdminDashboard['pendingVendors'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Vendor Approvals</CardTitle>
        <CardDescription>Applications waiting for review</CardDescription>
      </CardHeader>
      <CardContent>
        {vendors.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending applications.</p>
        ) : (
          <div className="space-y-4">
            {vendors.map((vendor: AdminDashboard['pendingVendors'][number]) => (
              <div key={vendor.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div>
                  <p className="text-sm font-medium">{vendor.businessName}</p>
                  <p className="text-xs text-muted-foreground">{vendor.businessType}</p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {vendor.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TopProductsCard({ topProducts }: { topProducts: AdminDashboard['topProducts'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best performers platform-wide</CardDescription>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No product data yet.</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product: any) => (
              <div key={product.productId} className="flex items-center justify-between">
                <div>
                  <Link href={`/admin/products/${product.productId}/edit`} className="text-sm hover:text-primary">
                    {product.productName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{product.vendorBusinessName}</p>
                </div>
                <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const { platformStats, recentOrders, pendingVendors, topProducts, systemHealth } =
    await adminAPI.getDashboard((session as any).accessToken);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform-wide overview and moderation.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <div className="lg:col-span-2">
            <PlatformStatsGrid stats={platformStats} />
          </div>
          <SystemHealthCard health={systemHealth} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <RecentOrdersCard orders={recentOrders} />
          <PendingVendorsCard vendors={pendingVendors} />
          <TopProductsCard topProducts={topProducts} />
        </div>
      </div>
    </main>
  );
}
