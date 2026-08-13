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

  async getSalesReport(
    params: {
      period: 'day' | 'week' | 'month' | 'year';
      date?: string;
      breakdown?: 'day';
      page?: number;
      limit?: number;
    },
    token?: string
  ) {
    const raw = await apiClient.get<{
      period: string;
      startDate: string;
      endDate: string;
      totalOrders: number;
      totalUnitsSold: number;
      totalRevenue: number;
      totalCost: number;
      totalCommission: number;
      totalProfit: number;
      products: {
        items: {
          productId: string;
          productName: string;
          vendorName: string;
          unitsSold: number;
          revenue: number;
          cost: number;
          commissionAmount: number;
          profit: number;
          dailySales?: { date: string; unitsSold: number; revenue: number }[];
        }[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPrevPage: boolean;
        };
      };
    }>('/analytics/admin/sales-report', { params, token });

    return {
      ...raw,
      products: raw.products.items,
      productsPagination: raw.products.pagination,
    };
  },
};

export default adminAPI;
