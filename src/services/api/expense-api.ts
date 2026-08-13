// Real expense tracking via the backend's Expense feature. Vendors are auto-scoped to
// their own vendorId (server-enforced); admins can see/assign any vendorId, including
// null for platform-level expenses (rent, admin salaries, etc).
import { apiClient } from './client';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export interface Expense {
  id: string;
  type: string;
  amount: number;
  date: string;
  notes?: string;
  vendorId: string | null;
  recordedBy: string;
  vendor?: { businessName: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  type: string;
  amount: number;
  date: string;
  notes?: string;
  vendorId?: string | null;
}

export const expenseAPI = {
  async getExpenses(
    params: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      vendorId?: string;
      type?: string;
    },
    token?: string
  ) {
    const raw = await apiClient.get<RawPage<Expense>>('/expenses', { params, token });
    return {
      expenses: raw.items,
      totalCount: raw.pagination.total,
      currentPage: raw.pagination.page,
      totalPages: raw.pagination.totalPages,
      hasNextPage: raw.pagination.hasNextPage,
      hasPreviousPage: raw.pagination.hasPrevPage,
    };
  },

  async getExpense(id: string, token?: string) {
    return apiClient.get<Expense>(`/expenses/${id}`, { token });
  },

  async createExpense(input: ExpenseInput, token?: string) {
    return apiClient.post<Expense>('/expenses', input, { token });
  },

  async updateExpense(id: string, input: Partial<ExpenseInput>, token?: string) {
    return apiClient.put<Expense>(`/expenses/${id}`, input, { token });
  },

  async deleteExpense(id: string, token?: string) {
    await apiClient.delete<void>(`/expenses/${id}`, { token });
  },
};

export default expenseAPI;
