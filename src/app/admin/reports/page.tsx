import { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Sales summary and stock status reports by department.',
};

const REPORTS = [
  {
    href: '/admin/reports/sales-summary',
    title: 'Sales Summary',
    description: 'Units sold, revenue, cost, and profit by department for any period.',
    icon: Icons.trendingUp,
  },
  {
    href: '/admin/reports/stock-status',
    title: 'Stock Status',
    description: 'Current on-hand inventory value and margin by department.',
    icon: Icons.package,
  },
  {
    href: '/admin/reports/expenses',
    title: 'Expenses',
    description: 'Log and review platform and vendor expenses.',
    icon: Icons.creditCard,
  },
  {
    href: '/admin/reports/purchase-orders',
    title: 'Purchase Orders',
    description: 'Track supplier restocking orders and receive stock.',
    icon: Icons.truck,
  },
  {
    href: '/admin/reports/ledger',
    title: 'Chart of Accounts',
    description: 'Cash, payable, and receivable balances across the platform.',
    icon: Icons.fileText,
  },
];

export default function AdminReportsPage() {
  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">Department-level summaries of sales and inventory.</p>

        <div className="grid gap-4 md:grid-cols-2 mt-6">
          {REPORTS.map((report) => {
            const Icon = report.icon;
            return (
              <Link key={report.href} href={report.href}>
                <Card className="h-full transition-colors hover:border-primary/50">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle>{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{report.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
