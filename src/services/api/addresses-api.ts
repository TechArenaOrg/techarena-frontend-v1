import { apiClient } from './client';
import type { Address, AddressFormData } from '@/types';

export const addressesAPI = {
  getAddresses: () => apiClient.get<Address[]>('/users/addresses'),
  createAddress: (input: AddressFormData) => apiClient.post<Address>('/users/addresses', input),
  updateAddress: (id: string, input: AddressFormData) => apiClient.put<Address>(`/users/addresses/${id}`, input),
  deleteAddress: (id: string) => apiClient.delete<void>(`/users/addresses/${id}`),
};

export default addressesAPI;
