// Chart of Accounts: ledger accounts with computed balances, plus the entries/transfers
// that move them. Account creation is admin-only; vendors can post entries against
// accounts they own but only see/act on their own scope (server-enforced).
import { apiClient } from './client';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export type LedgerAccountKind = 'cash' | 'payable' | 'receivable' | 'stock';

export interface LedgerAccount {
  id: string;
  name: string;
  kind: LedgerAccountKind;
  vendorId: string | null;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  accountId: string;
  amount: number;
  direction: 'in' | 'out' | null;
  isSettled: boolean | null;
  transferGroupId: string | null;
  note: string | null;
  date: string;
  recordedBy: string;
  createdAt: string;
  updatedAt: string;
  // Set only on entries the backend auto-posts for an order's payment/refund -
  // null for manually-created entries.
  orderId: string | null;
}

export interface LedgerAccountInput {
  name: string;
  kind: LedgerAccountKind;
  vendorId?: string | null;
}

export interface LedgerEntryInput {
  accountId: string;
  amount: number;
  direction?: 'in' | 'out';
  isSettled?: boolean;
  note?: string;
  date: string;
}

export interface LedgerTransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface PayoutSummary {
  pendingPayout: number;
  paidOut: number;
  totalEarned: number;
  entries: {
    items: LedgerEntry[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

function toNumber(value: unknown): number {
  const n = typeof value === 'string' ? parseFloat(value) : (value as number);
  return Number.isNaN(n) ? 0 : n;
}

function normalizeAccount(raw: any): LedgerAccount {
  return { ...raw, balance: toNumber(raw.balance) };
}

function normalizeEntry(raw: any): LedgerEntry {
  return { ...raw, amount: toNumber(raw.amount) };
}

export const ledgerAPI = {
  async getAccounts(token?: string) {
    const raw = await apiClient.get<any[]>('/ledger-accounts', { token });
    return raw.map(normalizeAccount);
  },

  // The backend has no single-account GET route - the list is small (a handful of
  // accounts per vendor/platform) so we fetch it and find the one we want. This also
  // preserves the list endpoint's own scoping (vendors only ever see their own accounts).
  async getAccount(id: string, token?: string) {
    const accounts = await ledgerAPI.getAccounts(token);
    return accounts.find((account) => account.id === id) ?? null;
  },

  async createAccount(input: LedgerAccountInput, token?: string) {
    const raw = await apiClient.post<any>('/ledger-accounts', input, { token });
    return normalizeAccount(raw);
  },

  async getEntries(
    params: { accountId?: string; page?: number; limit?: number; startDate?: string; endDate?: string },
    token?: string
  ) {
    const raw = await apiClient.get<RawPage<any>>('/ledger-entries', { params, token });
    return {
      entries: raw.items.map(normalizeEntry),
      totalCount: raw.pagination.total,
      currentPage: raw.pagination.page,
      totalPages: raw.pagination.totalPages,
      hasNextPage: raw.pagination.hasNextPage,
      hasPreviousPage: raw.pagination.hasPrevPage,
    };
  },

  async createEntry(input: LedgerEntryInput, token?: string) {
    const raw = await apiClient.post<any>('/ledger-entries', input, { token });
    return normalizeEntry(raw);
  },

  async transfer(input: LedgerTransferInput, token?: string) {
    const raw = await apiClient.post<{ outEntry: any; inEntry: any }>('/ledger-entries/transfer', input, { token });
    return { outEntry: normalizeEntry(raw.outEntry), inEntry: normalizeEntry(raw.inEntry) };
  },

  async deleteEntry(id: string, token?: string) {
    await apiClient.delete<void>(`/ledger-entries/${id}`, { token });
  },

  // Admin/super_admin only - flips an existing payable/receivable entry's isSettled
  // flag, e.g. once a vendor has actually been paid outside the platform. Sends the
  // entry's full current values rather than just the changed field, since this is a
  // PUT (undocumented whether it's a partial or full update).
  async updateEntry(id: string, input: LedgerEntryInput, token?: string) {
    const raw = await apiClient.put<any>(`/ledger-entries/${id}`, input, { token });
    return normalizeEntry(raw);
  },

  // Admin-only; backend rejects with 409 if the account still has entries.
  async deleteAccount(id: string, token?: string) {
    await apiClient.delete<void>(`/ledger-accounts/${id}`, { token });
  },

  // As a vendor: always returns their own summary, vendorId is ignored.
  // As admin/super_admin: vendorId is required - backend 400s without it.
  async getPayoutSummary(params: { vendorId?: string; page?: number; limit?: number }, token?: string): Promise<PayoutSummary> {
    const raw = await apiClient.get<any>('/ledger-entries/payouts/summary', { params, token });
    const items: any[] = raw.entries.items;
    return {
      pendingPayout: toNumber(raw.pendingPayout),
      paidOut: toNumber(raw.paidOut),
      totalEarned: toNumber(raw.totalEarned),
      entries: {
        items: items.map(normalizeEntry),
        totalCount: raw.entries.pagination.total,
        currentPage: raw.entries.pagination.page,
        totalPages: raw.entries.pagination.totalPages,
        hasNextPage: raw.entries.pagination.hasNextPage,
        hasPreviousPage: raw.entries.pagination.hasPrevPage,
      },
    };
  },
};

export default ledgerAPI;
