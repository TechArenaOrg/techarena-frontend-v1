import { apiClient } from './client';

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

export const usersAPI = {
  getProfile: () => apiClient.get<ProfileData>('/users/profile'),
  updateProfile: (input: ProfileUpdateInput) => apiClient.put<ProfileData['profile']>('/users/profile', input),
};

export default usersAPI;
