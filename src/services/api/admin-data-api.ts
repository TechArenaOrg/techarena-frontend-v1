// Super_admin-only data management: on-demand backups plus the destructive clean/restore
// actions. The backend 403s any of this for a non-super_admin, so the UI only needs to
// hide the entry point - it doesn't need its own authorization logic beyond that.
import { apiClient } from './client';

export interface DataSnapshot {
  id: string;
  label: string | null;
  reason: 'manual' | 'clean' | 'restore';
  createdBy: string;
  createdAt: Date;
}

function normalizeSnapshot(raw: any): DataSnapshot {
  return { ...raw, createdAt: new Date(raw.createdAt) };
}

export const adminDataAPI = {
  async getSnapshots(token?: string): Promise<DataSnapshot[]> {
    const raw = await apiClient.get<any>('/admin/data/snapshots', { token });
    const items: any[] = Array.isArray(raw) ? raw : raw.items ?? [];
    return items.map(normalizeSnapshot);
  },

  async takeSnapshot(label: string | undefined, token?: string) {
    const raw = await apiClient.post<any>('/admin/data/snapshot', label ? { label } : {}, { token });
    return normalizeSnapshot(raw);
  },

  // confirm must be the literal string "CLEAN DATA" - the backend rejects anything else.
  // keepEmails is optional: omitted, the backend keeps every current super_admin plus
  // whoever is calling this, so nobody can lock themselves out.
  async cleanData(confirm: string, keepEmails: string[] | undefined, token?: string) {
    return apiClient.post<{ backupSnapshotId: string }>(
      '/admin/data/clean',
      { confirm, ...(keepEmails ? { keepEmails } : {}) },
      { token }
    );
  },

  // confirm must be the literal string "RESTORE DATA".
  async restoreSnapshot(snapshotId: string, confirm: string, token?: string) {
    return apiClient.post<{ backupSnapshotId: string }>(`/admin/data/restore/${snapshotId}`, { confirm }, { token });
  },
};

export default adminDataAPI;
