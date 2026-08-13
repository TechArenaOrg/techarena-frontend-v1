import { Metadata } from 'next';
import { Fragment } from 'react';
import { auth } from '@/auth';
import { adminAPI } from '@/services/api/admin-api';
import { formatCurrency, groupByKey } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SalesReportFilters } from '@/components/admin/SalesReportFilters';

export const metadata: Metadata = {
  title: 'Sales Summary',
  description: 'Units sold, revenue, cost, and profit by department.',
};

type Period = 'day' | 'week' | 'month' | 'year';

interface PageProps {
  searchParams: Promise<{ period?: string; date?: string }>;
}

export default async function SalesSummaryPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const resolvedSearchParams = await searchParams;

  const period = (resolvedSearchParams.period as Period) || 'month';
  const date = resolvedSearchParams.date;

  // Grouping with subtotals needs the full period's rows at once, not one page at a
  // time - 500 comfortably covers the current catalog/order volume. If the product
  // catalog grows well past that, this should move to a backend-grouped endpoint.
  const report = await adminAPI.getSalesReport({ period, date, limit: 500 }, token);

  const rangeLabel = `${new Date(report.startDate).toLocaleDateString()} – ${new Date(
    new Date(report.endDate).getTime() - 1
  ).toLocaleDateString()}`;

  const departments = groupByKey(report.products, (p) => p.categoryName).map((group) => ({
    ...group,
    qty: group.items.reduce((sum, p) => sum + p.unitsSold, 0),
    extPrice: group.items.reduce((sum, p) => sum + p.revenue, 0),
    extCost: group.items.reduce((sum, p) => sum + p.cost, 0),
    profit: group.items.reduce((sum, p) => sum + p.profit, 0),
  }));

  const grandTotal = {
    qty: departments.reduce((sum, d) => sum + d.qty, 0),
    extPrice: departments.reduce((sum, d) => sum + d.extPrice, 0),
    extCost: departments.reduce((sum, d) => sum + d.extCost, 0),
    profit: departments.reduce((sum, d) => sum + d.profit, 0),
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Sales Summary</h1>
            <p className="text-muted-foreground">{rangeLabel}</p>
          </div>
          <SalesReportFilters period={period} date={date} basePath="/admin/reports/sales-summary" />
        </div>

        <Alert className="mt-6">
          <AlertDescription>
            "Profit" here is revenue minus cost minus vendor commission, same as the main Sales
            Report. Cost will read 0 for any product without a cost price set.
          </AlertDescription>
        </Alert>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>By Department</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {departments.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 pb-6">No sales in this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Department / Item</th>
                      <th className="px-6 py-3 font-medium text-right">Qty Sold</th>
                      <th className="px-6 py-3 font-medium text-right">Ext Price</th>
                      <th className="px-6 py-3 font-medium text-right">Ext Cost</th>
                      <th className="px-6 py-3 font-medium text-right">Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {departments.map((dept) => (
                      <Fragment key={dept.key}>
                        <tr className="bg-muted/40">
                          <td colSpan={5} className="px-6 py-2 font-semibold">
                            {dept.key}
                          </td>
                        </tr>
                        {dept.items.map((product) => (
                          <tr key={product.productId}>
                            <td className="px-6 py-3 pl-10">{product.productName}</td>
                            <td className="px-6 py-3 text-right">{product.unitsSold}</td>
                            <td className="px-6 py-3 text-right">{formatCurrency(product.revenue)}</td>
                            <td className="px-6 py-3 text-right">{formatCurrency(product.cost)}</td>
                            <td className="px-6 py-3 text-right">{formatCurrency(product.profit)}</td>
                          </tr>
                        ))}
                        <tr className="font-medium border-t">
                          <td className="px-6 py-2 pl-10">{dept.key} Subtotal</td>
                          <td className="px-6 py-2 text-right">{dept.qty}</td>
                          <td className="px-6 py-2 text-right">{formatCurrency(dept.extPrice)}</td>
                          <td className="px-6 py-2 text-right">{formatCurrency(dept.extCost)}</td>
                          <td className="px-6 py-2 text-right">{formatCurrency(dept.profit)}</td>
                        </tr>
                      </Fragment>
                    ))}
                    <tr className="font-bold bg-muted/60 border-t-2">
                      <td className="px-6 py-3">Grand Total</td>
                      <td className="px-6 py-3 text-right">{grandTotal.qty}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(grandTotal.extPrice)}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(grandTotal.extCost)}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(grandTotal.profit)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
