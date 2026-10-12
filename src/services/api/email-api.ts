import { apiClient } from './client';

export const emailAPI = {
  sendTest: (to: string) => apiClient.post<{ sent: boolean }>('/email/test', { to }),
};

export default emailAPI;
