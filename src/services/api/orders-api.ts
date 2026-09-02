// Real order calls for the logged-in customer's own order history, via GET /orders
// (auto-scoped to the current user for the customer role - admins/vendors get every
// order through the same endpoint). Uses the same unified {items, pagination} shape
// as /products, /categories, /vendors.
import { apiClient } from './client';
import type { OrderStatus, OrderItemStatus } from '@/types';

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

export interface CheckoutAddress {
  type: 'shipping' | 'billing';
  streetAddress: string;
  apartment?: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  // ISO 3166-1 alpha-2, e.g. "UG" - the backend rejects anything longer.
  country: string;
}

export interface CreateOrderInput {
  items: { productId: string; quantity: number }[];
  shippingAddress: CheckoutAddress;
  billingAddress: CheckoutAddress;
  customerEmail?: string;
  // Must be strict E.164 (e.g. "+256772123456", no spaces/dashes) - the backend's
  // validator was previously broken for every format but is now fixed and confirmed
  // live for E.164 specifically. Use toE164Uganda() to normalize user input.
  customerPhone?: string;
  paymentMethod: 'credit_card' | 'mobile_money' | 'bank_transfer' | 'cash_on_delivery';
  notes?: string;
}

// Normalizes common ways a Ugandan number gets typed (with spaces/dashes, with a
// leading 0, with or without the country code) into the strict E.164 format the
// backend requires (e.g. "0772 123 456" / "772123456" / "+256772123456" -> "+256772123456").
export function toE164Uganda(input: string): string {
  const digits = input.replace(/[^\d+]/g, '');
  if (digits.startsWith('+256')) return digits;
  if (digits.startsWith('256')) return `+${digits}`;
  if (digits.startsWith('0')) return `+256${digits.slice(1)}`;
  return `+256${digits}`;
}

export interface ProcessPaymentInput {
  paymentMethod: 'credit_card' | 'mobile_money' | 'bank_transfer' | 'cash_on_delivery';
  // Unlike orders/add's customerPhone (which hard-rejects every real phone format
  // tried), this endpoint silently accepts an extra phone field without validating
  // or erroring on it - confirmed empirically. Not currently used by the backend's
  // (simulated) gateway response, but harmless to send.
  phone?: string;
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

  // Admin-only in practice: same GET /orders endpoint as getMyOrders, just named for
  // where it's actually used - the backend scopes admins to see every order server-side.
  async getOrders(params: { status?: string; page?: number; limit?: number }, token?: string) {
    return ordersAPI.getMyOrders(params, token);
  },

  async getOrder(id: string, token?: string) {
    const raw = await apiClient.get<any>(`/orders/${id}`, { token });
    return normalizeOrder(raw);
  },

  // Admin/Vendor only (backend-enforced). Confirmed live: shippedAt/deliveredAt
  // auto-populate when status crosses into 'shipped'/'delivered'.
  async updateOrderStatus(id: string, status: OrderStatus, token?: string) {
    const raw = await apiClient.put<any>(`/orders/${id}/status`, { status }, { token });
    return normalizeOrder(raw);
  },

  // Vendor-scoped: only orders containing that vendor's own products.
  async getVendorOrders(params: { page?: number; limit?: number }, token?: string) {
    const raw = await apiClient.get<RawPage<any>>('/vendor/orders', { params, token });
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

  // The backend has no single-order GET route scoped to a vendor - fetch the
  // vendor's order list and find the one we want, same pattern as
  // ledgerAPI.getAccount. Also preserves /vendor/orders's own scoping.
  async getVendorOrder(id: string, token?: string) {
    const { orders } = await ordersAPI.getVendorOrders({ limit: 100 }, token);
    return orders.find((order) => order.id === id) ?? null;
  },

  // Confirmed live: updating a vendor's item status auto-advances the parent
  // order's own status (and its shippedAt/deliveredAt) once every item on the
  // order reaches that status.
  async updateOrderItemStatus(orderId: string, itemId: string, status: OrderItemStatus, token?: string) {
    const raw = await apiClient.patch<any>(`/vendor/orders/${orderId}/items/${itemId}/status`, { status }, { token });
    return normalizeOrderItem(raw);
  },

  // Confirmed empirically against the live backend (Swagger has no DTO for this
  // endpoint) - see CHECKOUT_API_SPEC.md. Clears the cart server-side on success,
  // so callers don't need to call cartAPI.clearCart() afterward.
  async createOrder(input: CreateOrderInput) {
    const raw = await apiClient.post<any>('/orders/add', input);
    return normalizeOrder(raw);
  },

  // Response is { payment: {...}, gatewayResponse: {...} } - unwrap to the payment
  // record, which is what callers actually want.
  async processPayment(orderId: string, input: ProcessPaymentInput) {
    const raw = await apiClient.post<{ payment: any; gatewayResponse: any }>(`/orders/${orderId}/payment`, input);
    return raw.payment;
  },
};

export default ordersAPI;
