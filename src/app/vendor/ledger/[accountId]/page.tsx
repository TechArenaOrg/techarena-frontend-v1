import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Pagination } from '@/components/ui/pagination';
import { BackLink } from '@/components/ui/back-link';
import { DeleteLedgerEntryButton } from '@/components/ledger/DeleteLedgerEntryButton';
import { LedgerEntryFormDialog } from '@/components/ledger/LedgerEntryFormDialog';
import { ApiError } from '@/services/api/client';

export const metadata: Metadata = {
  title: 'Account Entries',
  description: 'Entries for one of your ledger accounts.',
};

interface PageProps {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function VendorLedgerAccountPage({ params, searchParams }: PageProps) {
  const session = await auth();
  
  const token = (session as any).accessToken;
  const { accountId } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const [account, entriesResult] = await Promise.all([
    ledgerAPI.getAccount(accountId, token).catch((err) => {
      if (err instanceof ApiError && (err.status === 404 || err.status === 403)) return null;
      throw err;
    }),
    ledgerAPI.getEntries({ accountId, page: currentPage, limit: 20 }, token),
  ]);
  if (!account) notFound();

  const { entries, totalPages, hasNextPage, hasPreviousPage } = entriesResult;

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container max-w-3xl">
        <BackLink href="/vendor/ledger" label="Back to My Accounts" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
            <p className="text-muted-foreground">Current balance: {formatCurrency(account.balance)}</p>
          </div>
          <LedgerEntryFormDialog
            account={account}
            trigger={
              <Button>
                <Icons.plus className="mr-2 h-4 w-4" />
                Record Entry
              </Button>
            }
          />
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No entries recorded yet.</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-6 py-3 font-semibold text-foreground">Date</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Note</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Type</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Amount</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {entries.map((entry) => (
                        <tr key={entry.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
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

                <div className="sm:hidden divide-y">
                  {entries.map((entry) => (
                    <div key={entry.id} className="p-4 space-y-1.5 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                        {entry.direction ? (
                          <Badge variant={entry.direction === 'in' ? 'success' : 'destructive'} className="shrink-0">
                            {entry.direction === 'in' ? 'In' : 'Out'}
                          </Badge>
                        ) : (
                          <Badge variant={entry.isSettled ? 'success' : 'warning'} className="shrink-0">
                            {entry.isSettled ? 'Settled' : 'Outstanding'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">
                        {entry.note || '—'}
                        {entry.transferGroupId && (
                          <Badge variant="outline" className="ml-2">
                            Transfer
                          </Badge>
                        )}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-medium">{formatCurrency(entry.amount)}</p>
                        <DeleteLedgerEntryButton entryId={entry.id} isTransfer={!!entry.transferGroupId} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
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
