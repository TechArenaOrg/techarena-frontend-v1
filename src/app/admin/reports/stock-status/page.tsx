import { Metadata } from 'next';
import { Fragment } from 'react';
import { auth } from '@/auth';
import { productsAPI } from '@/services/api/products-api';
import { formatCurrency, groupByKey } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const metadata: Metadata = {
  title: 'Stock Status',
  description: 'Current on-hand inventory value and margin by department.',
};

export default async function StockStatusPage() {
  const session = await auth();
  const token = (session as any).accessToken;

  // Point-in-time inventory snapshot across the whole catalog - 500 comfortably covers
  // the current volume. If the catalog grows well past that, this needs real pagination
  // or a backend-side grouped endpoint instead of fetching everything at once.
  const { products } = await productsAPI.getProducts({ limit: 500 }, token);

  const rows = products.map((product) => {
    const hasCost = product.costPrice !== undefined && product.costPrice !== null;
    const cost = hasCost ? product.costPrice! : 0;
    const marginPercent = hasCost && product.price > 0 ? ((product.price - cost) / product.price) * 100 : null;

    return {
      id: product.id,
      name: product.name,
      categoryName: product.category?.name,
      onHandQty: product.stockQuantity,
      cost,
      hasCost,
      price: product.price,
      marginPercent,
      extCost: cost * product.stockQuantity,
      extPrice: product.price * product.stockQuantity,
    };
  });

  const departments = groupByKey(rows, (r) => r.categoryName).map((group) => ({
    ...group,
    qty: group.items.reduce((sum, r) => sum + r.onHandQty, 0),
    extCost: group.items.reduce((sum, r) => sum + r.extCost, 0),
    extPrice: group.items.reduce((sum, r) => sum + r.extPrice, 0),
  }));

  const grandTotal = {
    qty: departments.reduce((sum, d) => sum + d.qty, 0),
    extCost: departments.reduce((sum, d) => sum + d.extCost, 0),
    extPrice: departments.reduce((sum, d) => sum + d.extPrice, 0),
  };

  const missingCostCount = rows.filter((r) => !r.hasCost).length;

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <h1 className="text-3xl font-bold tracking-tight">Stock Status</h1>
        <p className="text-muted-foreground">Current inventory value as of now, by department.</p>

        {missingCostCount > 0 && (
          <Alert className="mt-6">
            <AlertDescription>
              {missingCostCount} product{missingCostCount !== 1 ? 's have' : ' has'} no cost price set -
              their margin shows as "—" and their cost is treated as 0 in the totals below.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>By Department</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {departments.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 pb-6">No products yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Department / Item</th>
                      <th className="px-6 py-3 font-medium text-right">On-hand Qty</th>
                      <th className="px-6 py-3 font-medium text-right">Margin %</th>
                      <th className="px-6 py-3 font-medium text-right">Cost</th>
                      <th className="px-6 py-3 font-medium text-right">Price</th>
                      <th className="px-6 py-3 font-medium text-right">Ext Cost</th>
                      <th className="px-6 py-3 font-medium text-right">Ext Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {departments.map((dept) => (
                      <Fragment key={dept.key}>
                        <tr className="bg-muted/40">
                          <td colSpan={7} className="px-6 py-2 font-semibold">
                            {dept.key}
                          </td>
                        </tr>
                        {dept.items.map((row) => (
                          <tr key={row.id}>
                            <td className="px-6 py-3 pl-10">{row.name}</td>
                            <td className="px-6 py-3 text-right">{row.onHandQty}</td>
                            <td className="px-6 py-3 text-right">
                              {row.marginPercent !== null ? `${row.marginPercent.toFixed(1)}%` : '—'}
                            </td>
                            <td className="px-6 py-3 text-right">{row.hasCost ? formatCurrency(row.cost) : '—'}</td>
                            <td className="px-6 py-3 text-right">{formatCurrency(row.price)}</td>
                            <td className="px-6 py-3 text-right">{formatCurrency(row.extCost)}</td>
                            <td className="px-6 py-3 text-right">{formatCurrency(row.extPrice)}</td>
                          </tr>
                        ))}
                        <tr className="font-medium border-t">
                          <td className="px-6 py-2 pl-10">{dept.key} Subtotal</td>
                          <td className="px-6 py-2 text-right">{dept.qty}</td>
                          <td className="px-6 py-2" />
                          <td className="px-6 py-2" />
                          <td className="px-6 py-2" />
                          <td className="px-6 py-2 text-right">{formatCurrency(dept.extCost)}</td>
                          <td className="px-6 py-2 text-right">{formatCurrency(dept.extPrice)}</td>
                        </tr>
                      </Fragment>
                    ))}
                    <tr className="font-bold bg-muted/60 border-t-2">
                      <td className="px-6 py-3">Grand Total</td>
                      <td className="px-6 py-3 text-right">{grandTotal.qty}</td>
                      <td className="px-6 py-3" />
                      <td className="px-6 py-3" />
                      <td className="px-6 py-3" />
                      <td className="px-6 py-3 text-right">{formatCurrency(grandTotal.extCost)}</td>
                      <td className="px-6 py-3 text-right">{formatCurrency(grandTotal.extPrice)}</td>
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
