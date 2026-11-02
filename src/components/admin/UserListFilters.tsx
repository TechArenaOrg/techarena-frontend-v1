'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icons } from '@/components/ui/icons';

const ALL = 'all';
const ROLE_OPTIONS = [
  { value: ALL, label: 'All Roles' },
  { value: 'customer', label: 'Customer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'official_store_manager', label: 'Official Store Manager' },
  { value: 'admin', label: 'Admin' },
  { value: 'super_admin', label: 'Super Admin' },
];
const STATUS_OPTIONS = [
  { value: ALL, label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'banned', label: 'Banned' },
];

interface UserListFiltersProps {
  currentSearch?: string;
  currentRole?: string;
  currentStatus?: string;
}

export function UserListFilters({ currentSearch, currentRole, currentStatus }: UserListFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch ?? '');
  const [, startTransition] = useTransition();

  useEffect(() => {
    setSearch(currentSearch ?? '');
  }, [currentSearch]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    params.delete('page');
    startTransition(() => router.push(`/admin/users?${params.toString()}`));
  };

  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === (currentSearch ?? '')) return;
    const timeout = setTimeout(() => updateParams({ search: trimmed || undefined }), 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const hasActiveFilters = !!currentSearch || !!currentRole || !!currentStatus;

  const clearFilters = () => {
    setSearch('');
    router.push('/admin/users');
  };

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex-1 min-w-[200px] space-y-1.5">
        <Label htmlFor="userSearch">Search</Label>
        <Input
          id="userSearch"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="roleFilter">Role</Label>
        <Select value={currentRole ?? ALL} onValueChange={(value) => updateParams({ role: value === ALL ? undefined : value })}>
          <SelectTrigger id="roleFilter" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="statusFilter">Status</Label>
        <Select value={currentStatus ?? ALL} onValueChange={(value) => updateParams({ status: value === ALL ? undefined : value })}>
          <SelectTrigger id="statusFilter" className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters}>
          <Icons.x className="w-4 h-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
