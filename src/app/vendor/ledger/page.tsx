import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { TransferFormDialog } from '@/components/ledger/TransferFormDialog';

export const metadata: Metadata = {
  title: 'My Accounts',
  description: 'Your cash, payable, and receivable accounts.',
};

const KIND_LABELS: Record<string, string> = { cash: 'Cash', payable: 'Payable', receivable: 'Receivable', stock: 'Stock' };

export default async function VendorLedgerPage() {
  const session = await auth();
  
  const token = (session as any).accessToken;
  const accounts = await ledgerAPI.getAccounts(token);
  const cashAccounts = accounts.filter((a) => a.kind === 'cash');
  const grandTotal = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Accounts</h1>
            <p className="text-muted-foreground">Cash, payable, receivable, and stock balances for your store.</p>
          </div>
          {cashAccounts.length >= 2 && (
            <TransferFormDialog
              cashAccounts={cashAccounts}
              trigger={
                <Button variant="outline">
                  <Icons.rotateCounterClockwise className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
              }
            />
          )}
        </div>

        {accounts.length === 0 ? (
          <Card className="mt-6">
            <CardContent className="text-center py-16">
              <p className="text-muted-foreground">
                You don't have any ledger accounts yet. Only admins can create them — ask your admin to set up your Petty Cash, Bank, Mobile
                Money, Creditors, Debtors, and Stock accounts.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mt-6">
              <CardContent className="p-0">
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-6 py-3 font-semibold text-foreground">Account</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Kind</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Balance</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {accounts.map((account) => (
                        <tr key={account.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
                          <td className="px-6 py-3 font-medium">{account.name}</td>
                          <td className="px-6 py-3">
                            <Badge variant="outline">{KIND_LABELS[account.kind]}</Badge>
                          </td>
                          <td className="px-6 py-3 text-right">{formatCurrency(account.balance)}</td>
                          <td className="px-6 py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/vendor/ledger/${account.id}`}>View Entries</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y">
                  {accounts.map((account) => (
                    <div key={account.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium">{account.name}</p>
                        <Badge variant="outline" className="shrink-0">{KIND_LABELS[account.kind]}</Badge>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <p className="font-medium">{formatCurrency(account.balance)}</p>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/vendor/ledger/${account.id}`}>View Entries</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardContent className="p-6 flex items-center justify-between">
                <span className="font-bold">Grand Total</span>
                <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
