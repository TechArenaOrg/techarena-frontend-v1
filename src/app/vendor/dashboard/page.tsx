import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { vendorAPI } from '@/services/api/vendor-api';
import { productsAPI } from '@/services/api/products-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';

export const metadata: Metadata = {
  title: 'Vendor Dashboard',
  description: 'Manage your products, orders, and store performance.',
};

type VendorDashboard = Awaited<ReturnType<typeof vendorAPI.getMyDashboard>>;

function StatsGrid({ analytics }: { analytics: VendorDashboard['analytics'] }) {
  const stats = [
    { title: 'Total Products', value: String(analytics.totalProducts), icon: Icons.package },
    { title: 'Total Orders', value: String(analytics.totalOrders), icon: Icons.shoppingCart },
    { title: 'Total Revenue', value: formatCurrency(analytics.totalRevenue), icon: Icons.dollarSign },
    { title: 'Avg. Order Value', value: formatCurrency(analytics.averageOrderValue), icon: Icons.trendingUp },
    { title: 'Low Stock Items', value: String(analytics.lowStockProducts), icon: Icons.clock },
    {
      title: 'Avg. Rating',
      value: analytics.averageRating ? analytics.averageRating.toFixed(1) : 'No reviews yet',
      icon: Icons.star,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function RecentOrdersCard({ orders }: { orders: VendorDashboard['recentOrders'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Latest orders containing your products</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.customerName} • {order.createdAt.toLocaleDateString()}
                  </p>
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

function LowStockCard({
  products,
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
}: {
  products: Awaited<ReturnType<typeof productsAPI.getProducts>>['products'];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
        <CardDescription>Items at or below their low-stock threshold</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing low on stock right now.</p>
        ) : (
          <>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                  <div>
                    <Link href={`/vendor/products/${product.id}/edit`} className="text-sm font-medium hover:text-primary">
                      {product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <Badge variant="destructive">{product.stockQuantity} left</Badge>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  hasNextPage={hasNextPage}
                  hasPreviousPage={hasPreviousPage}
                  paramName="lowStockPage"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TopProductsCard({ topProducts }: { topProducts: VendorDashboard['analytics']['topProducts'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Your best performers</CardDescription>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No product data yet.</p>
        ) : (
          <div className="space-y-3">
            {topProducts.map((product: any) => (
              <div key={product.productId} className="flex items-center justify-between">
                <Link href={`/vendor/products/${product.productId}/edit`} className="text-sm hover:text-primary">
                  {product.productName}
                </Link>
                <span className="text-sm font-medium">{formatCurrency(product.price)}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PageProps {
  searchParams: Promise<{ lowStockPage?: string }>;
}

export default async function VendorDashboardPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;
  if (role !== 'vendor') {
    redirect(role === 'admin' || role === 'super_admin' ? '/admin/dashboard' : '/dashboard');
  }

  const token = (session as any).accessToken;
  const { lowStockPage } = await searchParams;
  const currentLowStockPage = lowStockPage ? Number(lowStockPage) : 1;

  const { vendor, analytics, recentOrders } = await vendorAPI.getMyDashboard(token);
  const lowStock = await productsAPI.getProducts(
    { vendorId: vendor.id, lowStock: true, page: currentLowStockPage, limit: 5 },
    token
  );

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{vendor.businessName}</h1>
            <p className="text-muted-foreground">Your vendor dashboard and store performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={vendor.status === 'approved' ? 'default' : 'secondary'} className="capitalize">
              {vendor.status}
            </Badge>
            <Button asChild>
              <Link href="/vendor/products">
                <Icons.package className="mr-2 h-4 w-4" />
                Manage Products
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vendor/expenses">
                <Icons.creditCard className="mr-2 h-4 w-4" />
                Expenses
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vendor/purchase-orders">
                <Icons.truck className="mr-2 h-4 w-4" />
                Purchase Orders
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/vendor/ledger">
                <Icons.fileText className="mr-2 h-4 w-4" />
                My Accounts
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <StatsGrid analytics={analytics} />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          <RecentOrdersCard orders={recentOrders} />
          <LowStockCard
            products={lowStock.products}
            currentPage={lowStock.currentPage}
            totalPages={lowStock.totalPages}
            hasNextPage={lowStock.hasNextPage}
            hasPreviousPage={lowStock.hasPreviousPage}
          />
          <TopProductsCard topProducts={analytics.topProducts} />
        </div>
      </div>
    </main>
  );
}
