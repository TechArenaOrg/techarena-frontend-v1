// Real vendor dashboard data via the backend's GET /dashboard/vendor aggregate
// (vendor profile + analytics + recent orders + products + low-stock + pending reviews).
import { apiClient } from './client';
import { normalizeProduct, normalizeVendor } from './normalize';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isNaN(n) ? 0 : n;
}

function normalizeLightOrder(raw: any) {
  return {
    id: raw.id,
    orderNumber: raw.orderNumber,
    status: raw.status,
    totalAmount: toNumber(raw.totalAmount),
    createdAt: new Date(raw.createdAt),
    customerName: raw.user?.profile
      ? `${raw.user.profile.firstName || ''} ${raw.user.profile.lastName || ''}`.trim()
      : raw.user?.email,
  };
}

export const vendorAPI = {
  async getMyDashboard(token?: string) {
    const raw = await apiClient.get<any>('/dashboard/vendor', token ? { token } : undefined);

    return {
      vendor: raw.vendor,
      analytics: {
        ...raw.analytics,
        totalRevenue: toNumber(raw.analytics.totalRevenue),
        averageOrderValue: toNumber(raw.analytics.averageOrderValue),
        recentOrders: (raw.analytics.recentOrders || []).map(normalizeLightOrder),
        topProducts: raw.analytics.topProducts || [],
      },
      recentOrders: (raw.recentOrders || []).map(normalizeLightOrder),
      products: (raw.products || []).map(normalizeProduct),
      lowStockProducts: (raw.lowStockProducts || []).map(normalizeProduct),
      pendingReviews: raw.pendingReviews || [],
    };
  },

  // Admin-only use case: picking which vendor a newly-created product belongs to
  // (admins aren't vendors themselves, so the backend can't infer this for them).
  async getVendors(token?: string) {
    const raw = await apiClient.get<RawPage<any>>('/vendors', { params: { limit: 100 }, token });
    return raw.items.map(normalizeVendor);
  },

  // Any authenticated user - creates a pending Vendor application for their own
  // account. Approving it (see below) is what actually flips their role to vendor.
  async applyToBecomeVendor(
    data: {
      businessName: string;
      businessType?: string;
      businessRegistrationNumber?: string;
      taxNumber?: string;
      description?: string;
      websiteUrl?: string;
    },
    token?: string
  ) {
    const raw = await apiClient.post<any>('/vendors', data, { token });
    return normalizeVendor(raw);
  },

  // Admin/super_admin only. Omit status to get every vendor regardless of status.
  async getVendorApplications(
    params: { status?: 'pending' | 'approved' | 'suspended' | 'rejected'; page?: number; limit?: number },
    token?: string
  ) {
    const raw = await apiClient.get<RawPage<any>>('/vendors', { params, token });
    return {
      vendors: raw.items.map(normalizeVendor),
      totalCount: raw.pagination.total,
      totalPages: raw.pagination.totalPages,
      hasNextPage: raw.pagination.hasNextPage,
      hasPreviousPage: raw.pagination.hasPrevPage,
    };
  },

  // Admin/super_admin only. Approving/rejecting/suspending a vendor application is
  // what the backend uses to flip the underlying user's role to/from 'vendor'.
  async approveVendor(id: string, token?: string) {
    const raw = await apiClient.put<any>(`/vendors/${id}/approve`, undefined, { token });
    return normalizeVendor(raw);
  },

  async rejectVendor(id: string, token?: string) {
    const raw = await apiClient.put<any>(`/vendors/${id}/reject`, undefined, { token });
    return normalizeVendor(raw);
  },

  async suspendVendor(id: string, token?: string) {
    const raw = await apiClient.put<any>(`/vendors/${id}/suspend`, undefined, { token });
    return normalizeVendor(raw);
  },

  async updateVendorCommission(id: string, commissionRate: number, token?: string) {
    const raw = await apiClient.put<any>(`/vendors/${id}/commission`, { commissionRate }, { token });
    return normalizeVendor(raw);
  },

  // super_admin only (a plain admin 403s) - edits the vendor's own business info,
  // separate from approve/reject/suspend (role) and commission (rate). All fields
  // optional - send only what changed.
  async updateVendor(
    id: string,
    data: {
      businessName?: string;
      businessType?: string;
      businessRegistrationNumber?: string;
      taxNumber?: string;
      description?: string;
      websiteUrl?: string;
    },
    token?: string
  ) {
    const raw = await apiClient.put<any>(`/vendors/${id}`, data, { token });
    return normalizeVendor(raw);
  },
};

export default vendorAPI;
