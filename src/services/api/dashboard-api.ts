// Real dashboard data for the logged-in customer, via the backend's dedicated
// GET /dashboard/profile aggregate (user + profile + addresses + recentOrders in one call).
// Customer-role only - the backend also has /dashboard/vendor and /dashboard/admin for
// those roles, not wired up yet since there's no vendor/admin dashboard UI built.
import { apiClient } from './client';
import { normalizeProduct } from './normalize';

function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isNaN(n) ? 0 : n;
}

function normalizeOrderItem(raw: any) {
  return {
    ...raw,
    unitPrice: toNumber(raw.unitPrice),
    totalPrice: toNumber(raw.totalPrice),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    product: raw.product ? normalizeProduct(raw.product) : undefined,
  };
}

function normalizeOrder(raw: any) {
  return {
    ...raw,
    subtotal: toNumber(raw.subtotal),
    taxAmount: toNumber(raw.taxAmount),
    shippingAmount: toNumber(raw.shippingAmount),
    discountAmount: toNumber(raw.discountAmount),
    totalAmount: toNumber(raw.totalAmount),
    placedAt: new Date(raw.placedAt),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    shippedAt: raw.shippedAt ? new Date(raw.shippedAt) : undefined,
    deliveredAt: raw.deliveredAt ? new Date(raw.deliveredAt) : undefined,
    cancelledAt: raw.cancelledAt ? new Date(raw.cancelledAt) : undefined,
    items: Array.isArray(raw.items) ? raw.items.map(normalizeOrderItem) : [],
  };
}

export const dashboardAPI = {
  // Runs server-side (a Server Component), where there's no browser token store - the
  // caller must pass the access token from the NextAuth session explicitly.
  async getMyDashboard(token?: string) {
    const [raw, ordersPage] = await Promise.all([
      apiClient.get<any>('/dashboard/profile', token ? { token } : undefined),
      // /dashboard/profile's recentOrders is a capped preview (not a full order
      // history), so recentOrders.length is not a real order count - limit: 1 here
      // just to cheaply read the real total from the pagination metadata.
      apiClient.get<{ pagination: { total: number } }>('/orders', { params: { limit: 1 }, token }),
    ]);
    const orders = Array.isArray(raw.recentOrders) ? raw.recentOrders.map(normalizeOrder) : [];

    const totalSpent = orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);

    // "Saved" = sum of (comparePrice - unitPrice) * quantity across order items where the
    // product has a compare-at price - a real discount figure, not a fabricated stat.
    const savedAmount = orders.reduce((sum: number, order: any) => {
      const orderSavings = order.items.reduce((itemSum: number, item: any) => {
        const comparePrice = item.product?.comparePrice;
        if (comparePrice && comparePrice > item.unitPrice) {
          return itemSum + (comparePrice - item.unitPrice) * item.quantity;
        }
        return itemSum;
      }, 0);
      return sum + orderSavings;
    }, 0);

    return {
      orders,
      totalOrders: ordersPage.pagination.total,
      totalSpent,
      savedAmount,
    };
  },
};

export default dashboardAPI;
