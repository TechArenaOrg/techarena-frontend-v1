import { Metadata } from 'next';
import Link from 'next/link';
import { auth } from '@/auth';
import { ledgerAPI } from '@/services/api/ledger-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { formatCurrency, groupByKey } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { BootstrapVendorAccountsButton } from '@/components/ledger/BootstrapVendorAccountsButton';
import { TransferFormDialog } from '@/components/ledger/TransferFormDialog';
import { NewLedgerAccountButton } from '@/components/ledger/NewLedgerAccountButton';
import { BackLink } from '@/components/ui/back-link';

export const metadata: Metadata = {
  title: 'Chart of Accounts',
  description: 'Ledger accounts and their live balances.',
};

const KIND_LABELS: Record<string, string> = { cash: 'Cash', payable: 'Payable', receivable: 'Receivable', stock: 'Stock' };

export default async function AdminLedgerPage() {
  const session = await auth();
  const token = (session as any).accessToken;

  const [accounts, vendors] = await Promise.all([ledgerAPI.getAccounts(token), vendorAPI.getVendors(token).catch(() => [])]);

  const platformAccounts = accounts.filter((a) => !a.vendorId);
  const cashAccounts = accounts.filter((a) => a.kind === 'cash');
  const vendorGroups = groupByKey(
    accounts.filter((a) => a.vendorId),
    (a) => a.vendorId as string
  );
  const vendorsWithoutAccounts = vendors.filter((v) => !accounts.some((a) => a.vendorId === v.id));

  const grandTotal = accounts.reduce((sum, a) => sum + a.balance, 0);

  function AccountTable({ rows }: { rows: typeof accounts }) {
    return (
      <>
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
              {rows.map((account) => (
                <tr key={account.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
                  <td className="px-6 py-3 font-medium">{account.name}</td>
                  <td className="px-6 py-3">
                    <Badge variant="outline">{KIND_LABELS[account.kind]}</Badge>
                  </td>
                  <td className="px-6 py-3 text-right">{formatCurrency(account.balance)}</td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/reports/ledger/${account.id}`}>View Entries</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="sm:hidden divide-y">
          {rows.map((account) => (
            <div key={account.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{account.name}</p>
                <Badge variant="outline" className="shrink-0">{KIND_LABELS[account.kind]}</Badge>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="font-medium">{formatCurrency(account.balance)}</p>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/admin/reports/ledger/${account.id}`}>View Entries</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <BackLink href="/admin/reports" label="Back to Reports" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chart of Accounts</h1>
            <p className="text-muted-foreground">Live balances across all cash, payable, receivable, and stock accounts.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <TransferFormDialog
              cashAccounts={cashAccounts}
              trigger={
                <Button variant="outline">
                  <Icons.rotateCounterClockwise className="mr-2 h-4 w-4" />
                  Transfer
                </Button>
              }
            />
            <NewLedgerAccountButton vendors={vendors} />
          </div>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            <div className="px-6 py-3 bg-muted/40 font-medium">Platform Accounts</div>
            <AccountTable rows={platformAccounts} />
          </CardContent>
        </Card>

        {vendorGroups.map((group) => {
          const vendorName = vendors.find((v) => v.id === group.key)?.businessName ?? 'Vendor';
          return (
            <Card key={group.key} className="mt-6">
              <CardContent className="p-0">
                <div className="px-6 py-3 bg-muted/40 font-medium">{vendorName}</div>
                <AccountTable rows={group.items} />
              </CardContent>
            </Card>
          );
        })}

        {vendorsWithoutAccounts.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <p className="font-medium mb-1">Vendors without ledger accounts</p>
              <p className="text-sm text-muted-foreground mb-4">
                Only admins can create ledger accounts. Set up the standard accounts for these vendors so they can track their own cash.
              </p>
              <div className="space-y-3">
                {vendorsWithoutAccounts.map((vendor) => (
                  <div key={vendor.id} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                    <span className="text-sm font-medium">{vendor.businessName}</span>
                    <BootstrapVendorAccountsButton vendorId={vendor.id} vendorName={vendor.businessName} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardContent className="p-6 flex items-center justify-between">
            <span className="font-bold">Grand Total (all accounts)</span>
            <span className="text-lg font-bold">{formatCurrency(grandTotal)}</span>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
