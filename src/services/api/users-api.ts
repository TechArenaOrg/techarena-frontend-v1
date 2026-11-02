import { apiClient } from './client';
import type { UserRole, UserStatus } from '@/types';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export interface ProfileData {
  user: {
    id: string;
    email: string;
    phone: string | null;
  };
  profile: {
    firstName: string | null;
    lastName: string | null;
  };
}

export interface ProfileUpdateInput {
  firstName: string;
  lastName: string;
  phone: string | null;
}

function normalizeUser(raw: any) {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    lastLogin: raw.lastLogin ? new Date(raw.lastLogin) : undefined,
  };
}

export const usersAPI = {
  getProfile: () => apiClient.get<ProfileData>('/users/profile'),
  updateProfile: (input: ProfileUpdateInput) => apiClient.put<ProfileData['profile']>('/users/profile', input),

  // Admin/super_admin only.
  async getUsers(
    params: { page?: number; limit?: number; role?: UserRole; status?: UserStatus; search?: string },
    token?: string
  ) {
    const raw = await apiClient.get<RawPage<any>>('/users', { params, token });
    return {
      users: raw.items.map(normalizeUser),
      totalCount: raw.pagination.total,
      totalPages: raw.pagination.totalPages,
      hasNextPage: raw.pagination.hasNextPage,
      hasPreviousPage: raw.pagination.hasPrevPage,
    };
  },

  async getUser(id: string, token?: string) {
    const raw = await apiClient.get<any>(`/users/${id}`, { token });
    return normalizeUser(raw);
  },

  // Admin/super_admin only. 'vendor' is deliberately not a valid value here - that
  // role can only be granted/revoked via the vendor approve/reject/suspend endpoints.
  // Granting/revoking admin/super_admin 403s unless the caller is already super_admin,
  // and a caller can never change their own role (also a 403).
  async updateUserRole(id: string, role: Exclude<UserRole, 'vendor'>, token?: string) {
    const raw = await apiClient.patch<any>(`/users/${id}/role`, { role }, { token });
    return normalizeUser(raw);
  },
};

export default usersAPI;
