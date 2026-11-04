import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { BackLink } from '@/components/ui/back-link';
import { SettlePayoutDialog } from '@/components/admin/SettlePayoutDialog';

export const metadata: Metadata = {
  title: 'Vendor Payouts',
  description: "A vendor's pending and settled payouts.",
};

interface PageProps {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminVendorPayoutsPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { vendorId } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  // The backend is a Render free-tier deploy that intermittently drops connections
  // while cold-starting - if the core fetches fail, show a retry message instead of
  // leaving the page stuck on loading.tsx's spinner forever.
  let vendors, summary, accounts;
  try {
    [vendors, summary, accounts] = await Promise.all([
      vendorAPI.getVendors(token),
      ledgerAPI.getPayoutSummary({ vendorId, page: currentPage, limit: 20 }, token),
      ledgerAPI.getAccounts(token),
    ]);
  } catch {
    return (
      <main className="flex-1 space-y-6 p-6">
        <div className="container max-w-3xl">
          <div className="text-center py-32">
            <p className="text-muted-foreground mb-4">Couldn't load this page right now. The server may still be starting up.</p>
            <Button asChild>
              <Link href={`/admin/vendors/${vendorId}/payouts`}>Try again</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }
  const vendor = vendors.find((v) => v.id === vendorId);
  if (!vendor) notFound();

  const cashAccounts = accounts.filter((a) => a.kind === 'cash' && !a.vendorId);
  const { pendingPayout, paidOut, totalEarned, entries } = summary;

  const stats = [
    { title: 'Pending Payout', value: formatCurrency(pendingPayout), icon: Icons.clock, description: 'Owed to this vendor, not yet paid out' },
    { title: 'Paid Out', value: formatCurrency(paidOut), icon: Icons.dollarSign, description: 'Already settled' },
    { title: 'Total Earned', value: formatCurrency(totalEarned), icon: Icons.trendingUp, description: 'Lifetime, net of commission' },
  ];

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/admin/vendors" label="Back to Vendor Management" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{vendor.businessName}</h1>
            <p className="text-muted-foreground">Payouts</p>
          </div>
          <SettlePayoutDialog vendorId={vendorId} vendorName={vendor.businessName} pendingPayout={pendingPayout} cashAccounts={cashAccounts} />
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
                <p className="text-muted-foreground">No payout entries yet.</p>
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
                              <Link href={`/admin/orders/${entry.orderId}`} className="ml-2 underline hover:text-foreground">
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
                          <Link href={`/admin/orders/${entry.orderId}`} className="ml-2 underline hover:text-foreground">
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
