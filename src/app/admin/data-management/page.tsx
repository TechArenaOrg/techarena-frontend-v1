import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { adminDataAPI } from '@/services/api/admin-data-api';
import { usersAPI } from '@/services/api/users-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BackupNowButton, CleanDataButton, RestoreSnapshotButton } from '@/components/admin/DataManagementActions';

export const metadata: Metadata = {
  title: 'Data Management',
  description: 'Backups, and destructive data clean/restore tools.',
};

const REASON_LABEL: Record<string, string> = {
  manual: 'Manual backup',
  clean: 'Auto-backup before clean',
  restore: 'Auto-backup before restore',
};

export default async function AdminDataManagementPage() {
  const session = await auth();
  const token = (session as any).accessToken;
  const role = (session as any).user.role;

  // The backend 403s this for anyone but a super_admin - a plain admin shouldn't even
  // see the entry point, not just get a disabled button, since this is destructive.
  if (role !== 'super_admin') {
    redirect('/admin/dashboard');
  }

  const [snapshots, superAdmins] = await Promise.all([
    adminDataAPI.getSnapshots(token),
    usersAPI.getUsers({ role: 'super_admin', limit: 100 }, token),
  ]);
  const survivingEmails = superAdmins.users.map((u: any) => u.email);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
            <p className="text-muted-foreground">Backups and destructive data tools. Super admin only.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <BackupNowButton />
            <CleanDataButton survivingEmails={survivingEmails} />
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Snapshots</CardTitle>
            <CardDescription>Backups taken manually, or automatically before a clean/restore.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {snapshots.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No snapshots yet.</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-6 py-3 font-semibold text-foreground">Label</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Reason</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Created By</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Created At</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {snapshots.map((snapshot) => (
                        <tr key={snapshot.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
                          <td className="px-6 py-3 font-semibold text-primary">{snapshot.label || 'Untitled'}</td>
                          <td className="px-6 py-3">
                            <Badge variant={snapshot.reason === 'manual' ? 'secondary' : 'warning'}>
                              {REASON_LABEL[snapshot.reason] ?? snapshot.reason}
                            </Badge>
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">{snapshot.createdBy}</td>
                          <td className="px-6 py-3 text-muted-foreground">{snapshot.createdAt.toLocaleString()}</td>
                          <td className="px-6 py-3 text-right">
                            <RestoreSnapshotButton snapshotId={snapshot.id} snapshotLabel={snapshot.label || 'Untitled'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y">
                  {snapshots.map((snapshot) => (
                    <div key={snapshot.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-primary">{snapshot.label || 'Untitled'}</p>
                        <Badge variant={snapshot.reason === 'manual' ? 'secondary' : 'warning'}>
                          {REASON_LABEL[snapshot.reason] ?? snapshot.reason}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {snapshot.createdBy} • {snapshot.createdAt.toLocaleString()}
                      </p>
                      <div className="pt-1">
                        <RestoreSnapshotButton snapshotId={snapshot.id} snapshotLabel={snapshot.label || 'Untitled'} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
