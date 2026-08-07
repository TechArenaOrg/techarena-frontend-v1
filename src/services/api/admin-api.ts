// Real admin dashboard data via the backend's GET /dashboard/admin aggregate
// (platform stats + recent orders + pending vendor approvals + top products + system health).
import { apiClient } from './client';
import { normalizeVendor } from './normalize';

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
  };
}

export const adminAPI = {
  async getDashboard(token?: string) {
    const raw = await apiClient.get<any>('/dashboard/admin', token ? { token } : undefined);

    return {
      platformStats: raw.platformStats,
      recentOrders: (raw.recentOrders || []).map(normalizeLightOrder),
      pendingVendors: (raw.pendingVendors || []).map(normalizeVendor),
      topProducts: raw.topProducts || [],
      systemHealth: raw.systemHealth,
    };
  },
};

export default adminAPI;
