import { Metadata } from 'next';
import { auth } from '@/auth';
import { usersAPI } from '@/services/api/users-api';
import { vendorAPI } from '@/services/api/vendor-api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { UserListFilters } from '@/components/admin/UserListFilters';
import { UserRoleSelect } from '@/components/admin/UserRoleSelect';
import { CreateVendorRecordDialog } from '@/components/admin/CreateVendorRecordDialog';
import type { UserRole, UserStatus } from '@/types';

export const metadata: Metadata = {
  title: 'Manage Users',
  description: 'View and manage user accounts and roles.',
};

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; role?: string; status?: string }>;
}

function displayName(user: any) {
  const name = `${user.profile?.firstName ?? ''} ${user.profile?.lastName ?? ''}`.trim();
  return name || user.email;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const currentUserId = (session as any).user.id;
  const actorIsSuperAdmin = (session as any).user.role === 'super_admin';
  const { page: pageParam, search, role, status } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;

  const [{ users, totalCount, totalPages, hasNextPage, hasPreviousPage }, vendors] = await Promise.all([
    usersAPI.getUsers(
      { search, role: role as UserRole | undefined, status: status as UserStatus | undefined, page: currentPage, limit: 20 },
      token
    ),
    // Only used to tell which users already have a vendor record - a hiccup fetching
    // it shouldn't take down the whole user list.
    vendorAPI.getVendors(token).catch(() => []),
  ]);
  const userIdsWithVendor = new Set(vendors.map((v) => v.userId));

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            {totalCount} user{totalCount !== 1 ? 's' : ''} across the platform
          </p>
        </div>

        <Card className="mt-6">
          <CardContent className="p-6">
            <UserListFilters currentSearch={search} currentRole={role} currentStatus={status} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No users found.</p>
              </div>
            ) : (
              <>
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-6 py-3 font-semibold text-foreground">Name</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Email</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Status</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Joined</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Role</th>
                        {actorIsSuperAdmin && <th className="px-6 py-3 font-semibold text-foreground">Vendor Record</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user: any) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
                          <td className="px-6 py-3 font-semibold">{displayName(user)}</td>
                          <td className="px-6 py-3 text-muted-foreground">{user.email}</td>
                          <td className="px-6 py-3">
                            <Badge variant={user.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-3">
                            <UserRoleSelect
                              userId={user.id}
                              currentRole={user.role}
                              isSelf={user.id === currentUserId}
                              actorIsSuperAdmin={actorIsSuperAdmin}
                            />
                          </td>
                          {actorIsSuperAdmin && (
                            <td className="px-6 py-3">
                              {userIdsWithVendor.has(user.id) ? (
                                <span className="text-sm text-muted-foreground">Has vendor record</span>
                              ) : (
                                <CreateVendorRecordDialog userId={user.id} userLabel={displayName(user)} />
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden divide-y">
                  {users.map((user: any) => (
                    <div key={user.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{displayName(user)}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={user.status === 'active' ? 'success' : 'secondary'} className="capitalize">
                          {user.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                      <div className="pt-1">
                        <UserRoleSelect
                          userId={user.id}
                          currentRole={user.role}
                          isSelf={user.id === currentUserId}
                          actorIsSuperAdmin={actorIsSuperAdmin}
                        />
                      </div>
                      {actorIsSuperAdmin && (
                        <div className="pt-1">
                          {userIdsWithVendor.has(user.id) ? (
                            <span className="text-sm text-muted-foreground">Has vendor record</span>
                          ) : (
                            <CreateVendorRecordDialog userId={user.id} userLabel={displayName(user)} />
                          )}
                        </div>
                      )}
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
