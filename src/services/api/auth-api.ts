// Real auth calls against the live TechArena backend (/auth/login, /auth/register, ...).
// Normalizes the backend's User shape (snake-free but slightly different field names,
// e.g. profile.avatar vs our profile.avatarUrl) into the frontend's `User` type.
import { apiClient } from './client';
import type { Gender, User, UserRole, UserStatus } from '@/types';

interface BackendProfile {
  id?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface BackendUser {
  id: string;
  email: string;
  role: string;
  status?: string;
  emailVerified: boolean;
  phone?: string | null;
  phoneVerified?: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  profile?: BackendProfile;
}

interface AuthResult {
  user: BackendUser;
  accessToken: string;
  refreshToken: string;
}

interface ProfileResponse {
  status: string;
  data: { user: BackendUser };
}

function normalizeUser(user: BackendUser): User {
  const now = new Date();
  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    status: (user.status as UserStatus) || 'active',
    emailVerified: user.emailVerified,
    phone: user.phone ?? undefined,
    phoneVerified: user.phoneVerified ?? false,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
    createdAt: user.createdAt ? new Date(user.createdAt) : now,
    updatedAt: user.updatedAt ? new Date(user.updatedAt) : now,
    profile: user.profile
      ? {
          id: user.profile.id || '',
          userId: user.id,
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatarUrl: user.profile.avatar ?? undefined,
          dateOfBirth: user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth) : undefined,
          gender: (user.profile.gender as Gender) ?? undefined,
          bio: user.profile.bio ?? undefined,
          createdAt: user.profile.createdAt ? new Date(user.profile.createdAt) : now,
          updatedAt: user.profile.updatedAt ? new Date(user.profile.updatedAt) : now,
        }
      : undefined,
  };
}

export const authAPI = {
  async login(email: string, password: string) {
    const result = await apiClient.post<AuthResult>('/auth/login', { email, password });
    return { user: normalizeUser(result.user), accessToken: result.accessToken, refreshToken: result.refreshToken };
  },

  async register(input: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const result = await apiClient.post<AuthResult>('/auth/register', input);
    return { user: normalizeUser(result.user), accessToken: result.accessToken, refreshToken: result.refreshToken };
  },

  async logout(token?: string) {
    await apiClient.post<void>('/auth/logout', undefined, token ? { token } : undefined);
  },

  async getCurrentUser(token?: string) {
    const result = await apiClient.get<ProfileResponse>('/auth/profile', token ? { token } : undefined);
    return normalizeUser(result.data.user);
  },
};

export default authAPI;
