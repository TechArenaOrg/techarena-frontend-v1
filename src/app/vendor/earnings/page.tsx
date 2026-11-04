import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';

export const metadata: Metadata = {
  title: 'My Earnings',
  description: 'What you have earned and what is still owed to you.',
};

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function VendorEarningsPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const summary = await ledgerAPI.getPayoutSummary({ page: currentPage, limit: 20 }, token);
  const { pendingPayout, paidOut, totalEarned, entries } = summary;

  const stats = [
    { title: 'Pending Payout', value: formatCurrency(pendingPayout), icon: Icons.clock, description: 'Owed to you, not yet paid out' },
    { title: 'Paid Out', value: formatCurrency(paidOut), icon: Icons.dollarSign, description: 'Already settled outside the platform' },
    { title: 'Total Earned', value: formatCurrency(totalEarned), icon: Icons.trendingUp, description: 'Lifetime, net of commission' },
  ];

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Earnings</h1>
          <p className="text-muted-foreground">What you have earned and what is still owed to you, net of commission.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {entries.items.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No earnings recorded yet.</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-6 py-3 font-semibold text-foreground">Date</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Note</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Status</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {entries.items.map((entry) => (
                        <tr key={entry.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
                          <td className="px-6 py-3 text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-muted-foreground">
                            {entry.note || '—'}
                            {entry.orderId && (
                              <Link href={`/vendor/orders/${entry.orderId}`} className="ml-2 underline hover:text-foreground">
                                View Order
                              </Link>
                            )}
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant={entry.isSettled ? 'success' : 'warning'}>{entry.isSettled ? 'Paid Out' : 'Pending'}</Badge>
                          </td>
                          <td className="px-6 py-3 text-right">{formatCurrency(entry.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y">
                  {entries.items.map((entry) => (
                    <div key={entry.id} className="p-4 space-y-1.5 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        <Badge variant={entry.isSettled ? 'success' : 'warning'} className="shrink-0">
                          {entry.isSettled ? 'Paid Out' : 'Pending'}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        {entry.note || '—'}
                        {entry.orderId && (
                          <Link href={`/vendor/orders/${entry.orderId}`} className="ml-2 underline hover:text-foreground">
                            View Order
                          </Link>
                        )}
                      </p>
                      <p className="font-medium pt-1">{formatCurrency(entry.amount)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {entries.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={entries.currentPage}
              totalPages={entries.totalPages}
              hasNextPage={entries.hasNextPage}
              hasPreviousPage={entries.hasPreviousPage}
            />
          </div>
        )}
      </div>
    </main>
  );
}
