// Real vendor dashboard data via the backend's GET /dashboard/vendor aggregate
// (vendor profile + analytics + recent orders + products + low-stock + pending reviews).
import { apiClient } from './client';
import { normalizeProduct } from './normalize';

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
};

export default vendorAPI;
