import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { BackLink } from '@/components/ui/back-link';
import { DeleteLedgerEntryButton } from '@/components/ledger/DeleteLedgerEntryButton';

export const metadata: Metadata = {
  title: 'Ledger Account',
  description: 'Entries for a ledger account.',
};

interface PageProps {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminLedgerAccountPage({ params, searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { accountId } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const [account, { entries, totalPages, hasNextPage, hasPreviousPage }, vendors] = await Promise.all([
    ledgerAPI.getAccount(accountId, token).catch(() => null),
    ledgerAPI.getEntries({ accountId, page: currentPage, limit: 20 }, token),
    vendorAPI.getVendors(token),
  ]);
  if (!account) notFound();
  const vendorName = account.vendorId ? vendors.find((v) => v.id === account.vendorId)?.businessName ?? 'Vendor' : 'Platform-level';

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/admin/reports/ledger" label="Back to Chart of Accounts" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
            <p className="text-muted-foreground">
              {vendorName} • Current balance: {formatCurrency(account.balance)}
            </p>
          </div>
          <Button asChild>
            <Link href={`/admin/reports/ledger/${account.id}/new-entry`}>
              <Icons.plus className="mr-2 h-4 w-4" />
              Record Entry
            </Link>
          </Button>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No entries recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="px-6 py-3 font-medium">Date</th>
                      <th className="px-6 py-3 font-medium">Note</th>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium text-right">Amount</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-3 text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</td>
                        <td className="px-6 py-3 text-muted-foreground">
                          {entry.note || '—'}
                          {entry.transferGroupId && (
                            <Badge variant="outline" className="ml-2">
                              Transfer
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {entry.direction ? (
                            <Badge variant={entry.direction === 'in' ? 'success' : 'destructive'}>{entry.direction === 'in' ? 'In' : 'Out'}</Badge>
                          ) : (
                            <Badge variant={entry.isSettled ? 'success' : 'warning'}>{entry.isSettled ? 'Settled' : 'Outstanding'}</Badge>
                          )}
                        </td>
                        <td className="px-6 py-3 text-right">{formatCurrency(entry.amount)}</td>
                        <td className="px-6 py-3 text-right">
                          <DeleteLedgerEntryButton entryId={entry.id} isTransfer={!!entry.transferGroupId} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} hasNextPage={hasNextPage} hasPreviousPage={hasPreviousPage} />
          </div>
        )}
      </div>
    </main>
  );
}
