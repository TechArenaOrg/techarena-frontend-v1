import { Metadata } from 'next';
import { auth } from '@/auth';
import { vendorAPI } from '@/services/api/vendor-api';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';
import { VendorStatusBadge } from '@/components/admin/VendorStatusBadge';
import { VendorStatusFilter } from '@/components/admin/VendorStatusFilter';
import { VendorApplicationActions } from '@/components/admin/VendorApplicationActions';
import type { VendorStatus } from '@/types';

export const metadata: Metadata = {
  title: 'Vendor Applications',
  description: 'Review and manage vendor applications.',
};

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminVendorsPage({ searchParams }: PageProps) {
  const session = await auth();
  const token = (session as any).accessToken;
  const { status, page: pageParam } = await searchParams;
  const currentPage = pageParam ? Number(pageParam) : 1;
  const effectiveStatus = status === 'all' ? undefined : ((status ?? 'pending') as VendorStatus);

  const { vendors, totalCount, totalPages, hasNextPage, hasPreviousPage } = await vendorAPI.getVendorApplications(
    { status: effectiveStatus, page: currentPage, limit: 20 },
    token
  );

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendor Applications</h1>
            <p className="text-muted-foreground">
              {totalCount} application{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          <VendorStatusFilter currentStatus={status} />
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {vendors.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No vendor applications found.</p>
              </div>
            ) : (
              <>
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/30 text-left text-muted-foreground">
                        <th className="px-6 py-3 font-semibold text-foreground">Business</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Applicant</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Applied</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Commission</th>
                        <th className="px-6 py-3 font-semibold text-foreground">Status</th>
                        <th className="px-6 py-3 font-semibold text-foreground text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {vendors.map((vendor) => (
                        <tr key={vendor.id} className="border-b hover:bg-muted/50 even:bg-muted/25">
                          <td className="px-6 py-3">
                            <p className="font-semibold text-primary">{vendor.businessName}</p>
                            {vendor.businessType && (
                              <p className="text-xs text-muted-foreground capitalize">{vendor.businessType.replace(/_/g, ' ')}</p>
                            )}
                          </td>
                          <td className="px-6 py-3 text-muted-foreground">{vendor.user?.email ?? '—'}</td>
                          <td className="px-6 py-3 text-muted-foreground">{new Date(vendor.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-muted-foreground">{vendor.commissionRate}%</td>
                          <td className="px-6 py-3">
                            <VendorStatusBadge status={vendor.status} />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <VendorApplicationActions vendorId={vendor.id} status={vendor.status} commissionRate={vendor.commissionRate} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="p-4 space-y-2 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-primary">{vendor.businessName}</p>
                          <p className="text-sm text-muted-foreground">{vendor.user?.email ?? '—'}</p>
                        </div>
                        <VendorStatusBadge status={vendor.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Applied {new Date(vendor.createdAt).toLocaleDateString()} • Commission {vendor.commissionRate}%
                      </p>
                      <div className="pt-1">
                        <VendorApplicationActions vendorId={vendor.id} status={vendor.status} commissionRate={vendor.commissionRate} />
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
