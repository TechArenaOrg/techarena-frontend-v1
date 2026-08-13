import { Metadata } from 'next';
import { auth } from '@/auth';
import { adminAPI } from '@/services/api/admin-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { SalesReportFilters } from '@/components/admin/SalesReportFilters';

export const metadata: Metadata = {
  title: 'Sales Report',
  description: 'Revenue, commission, and profit by product.',
};

type Period = 'day' | 'week' | 'month' | 'year';

interface PageProps {
  searchParams: Promise<{ period?: string; date?: string; page?: string }>;
}

export default async function SalesReportPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const resolvedSearchParams = await searchParams;

  const period = (resolvedSearchParams.period as Period) || 'month';
  const date = resolvedSearchParams.date;
  const currentPage = resolvedSearchParams.page ? Number(resolvedSearchParams.page) : 1;

  const report = await adminAPI.getSalesReport({ period, date, breakdown: 'day', page: currentPage, limit: 20 }, token);

  const stats = [
    { title: 'Total Orders', value: String(report.totalOrders), icon: Icons.shoppingCart },
    { title: 'Units Sold', value: String(report.totalUnitsSold), icon: Icons.package },
    { title: 'Revenue', value: formatCurrency(report.totalRevenue), icon: Icons.dollarSign },
    { title: 'Commission', value: formatCurrency(report.totalCommission), icon: Icons.creditCard },
    { title: 'Profit (excl. cost)', value: formatCurrency(report.totalProfit), icon: Icons.trendingUp },
  ];

  const rangeLabel = `${new Date(report.startDate).toLocaleDateString()} – ${new Date(
    new Date(report.endDate).getTime() - 1
  ).toLocaleDateString()}`;

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
            <p className="text-muted-foreground">{rangeLabel}</p>
          </div>
          <SalesReportFilters period={period} date={date} />
        </div>

        <Alert className="mt-6">
          <AlertDescription>
            Cost data isn't tracked yet - no product has a cost price set, so "Profit" below is
            revenue minus vendor commission only, not a true margin. It'll become accurate once
            cost prices are entered per product.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mt-6">
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

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>By Product</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {report.products.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 pb-6">No sales in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Product</th>
                      <th className="px-6 py-3 font-medium">Vendor</th>
                      <th className="px-6 py-3 font-medium">Sold On</th>
                      <th className="px-6 py-3 font-medium text-right">Units</th>
                      <th className="px-6 py-3 font-medium text-right">Revenue</th>
                      <th className="px-6 py-3 font-medium text-right">Commission</th>
                      <th className="px-6 py-3 font-medium text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.products.map((product) => (
                      <tr key={product.productId}>
                        <td className="px-6 py-3">{product.productName}</td>
                        <td className="px-6 py-3 text-muted-foreground">{product.vendorName}</td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {product.dailySales && product.dailySales.length > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              {product.dailySales.map((day) => (
                                <span key={day.date} className="text-xs whitespace-nowrap">
                                  {new Date(day.date).toLocaleDateString()} · {day.unitsSold} unit
                                  {day.unitsSold !== 1 ? 's' : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">{product.unitsSold}</td>
                        <td className="px-6 py-3 text-right">{formatCurrency(product.revenue)}</td>
                        <td className="px-6 py-3 text-right">{formatCurrency(product.commissionAmount)}</td>
                        <td className="px-6 py-3 text-right font-medium">{formatCurrency(product.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {report.productsPagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={report.productsPagination.page}
              totalPages={report.productsPagination.totalPages}
              hasNextPage={report.productsPagination.hasNextPage}
              hasPreviousPage={report.productsPagination.hasPrevPage}
            />
          </div>
        )}
      </div>
    </main>
  );
}
