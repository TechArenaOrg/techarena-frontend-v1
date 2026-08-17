// Supplier restocking, separate from customer Orders. Vendors are auto-scoped to their
// own vendorId (server-enforced); admins can see/create for any vendor, or vendorId=null
// for a platform-level purchase order.
import { apiClient } from './client';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  productName: string;
  categoryName: string | null;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string | null;
  supplierName: string;
  orderDate: string;
  receivedDate: string | null;
  isReceived: boolean;
  notes: string | null;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  vendor?: { businessName: string } | null;
}

export interface PurchaseOrderItemInput {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrderInput {
  vendorId?: string | null;
  supplierName: string;
  orderDate: string;
  notes?: string;
  items: PurchaseOrderItemInput[];
}

function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isNaN(n) ? 0 : n;
}

function normalizePurchaseOrder(raw: any): PurchaseOrder {
  return {
    ...raw,
    items: (raw.items || []).map((item: any) => ({
      ...item,
      quantity: toNumber(item.quantity),
      unitCost: toNumber(item.unitCost),
    })),
    totalAmount: toNumber(raw.totalAmount),
  };
}

export const purchaseOrderAPI = {
  async getPurchaseOrders(
    params: { page?: number; limit?: number; startDate?: string; endDate?: string; vendorId?: string; received?: boolean },
    token?: string
  ) {
    const raw = await apiClient.get<RawPage<any>>('/purchase-orders', { params, token });
    return {
      purchaseOrders: raw.items.map(normalizePurchaseOrder),
      totalCount: raw.pagination.total,
      currentPage: raw.pagination.page,
      totalPages: raw.pagination.totalPages,
      hasNextPage: raw.pagination.hasNextPage,
      hasPreviousPage: raw.pagination.hasPrevPage,
    };
  },

  async getPurchaseOrder(id: string, token?: string) {
    const raw = await apiClient.get<any>(`/purchase-orders/${id}`, { token });
    return normalizePurchaseOrder(raw);
  },

  async createPurchaseOrder(input: PurchaseOrderInput, token?: string) {
    const raw = await apiClient.post<any>('/purchase-orders', input, { token });
    return normalizePurchaseOrder(raw);
  },

  async updatePurchaseOrder(
    id: string,
    input: Partial<{ isReceived: boolean; vendorId: string | null; supplierName: string; orderDate: string; notes: string }>,
    token?: string
  ) {
    const raw = await apiClient.put<any>(`/purchase-orders/${id}`, input, { token });
    return normalizePurchaseOrder(raw);
  },

  async deletePurchaseOrder(id: string, token?: string) {
    await apiClient.delete<void>(`/purchase-orders/${id}`, { token });
  },
};

export default purchaseOrderAPI;
