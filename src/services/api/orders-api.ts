// Real order calls for the logged-in customer's own order history, via GET /orders
// (auto-scoped to the current user for the customer role). Uses the same unified
// {items, pagination} shape as /products, /categories, /vendors.
import { apiClient } from './client';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

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

export const ordersAPI = {
  async getMyOrders(params: { status?: string; page?: number; limit?: number }, token?: string) {
    const raw = await apiClient.get<RawPage<any>>('/orders', { params, token });
    const orders = raw.items.map(normalizeOrder);

    return {
      orders,
      totalCount: raw.pagination.total,
      currentPage: raw.pagination.page,
      totalPages: raw.pagination.totalPages,
      hasNextPage: raw.pagination.hasNextPage,
      hasPreviousPage: raw.pagination.hasPrevPage,
    };
  },
};

export default ordersAPI;
