'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import { usersAPI } from '@/services/api/users-api';
import { ApiError } from '@/services/api/client';
import type { UserRole } from '@/types';

// 'vendor' is deliberately excluded - the backend only grants/revokes it through the
// vendor approve/reject/suspend flow (see /admin/vendors), not this endpoint.
const ALL_ROLE_OPTIONS: { value: Exclude<UserRole, 'vendor'>; label: string; requiresSuperAdmin?: boolean }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'official_store_manager', label: 'Official Store Manager' },
  { value: 'admin', label: 'Admin', requiresSuperAdmin: true },
  { value: 'super_admin', label: 'Super Admin', requiresSuperAdmin: true },
];

interface UserRoleSelectProps {
  userId: string;
  currentRole: UserRole;
  isSelf: boolean;
  actorIsSuperAdmin: boolean;
}

export function UserRoleSelect({ userId, currentRole, isSelf, actorIsSuperAdmin }: UserRoleSelectProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pendingRole, setPendingRole] = useState<Exclude<UserRole, 'vendor'> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (currentRole === 'vendor') {
    return <span className="text-sm text-muted-foreground">Managed via Vendor Applications</span>;
  }

  if (isSelf) {
    return <span className="text-sm text-muted-foreground">You can't change your own role</span>;
  }

  // A plain admin can't revoke admin/super_admin any more than they can grant it, so
  // there's nothing they can validly change this row to - show it read-only instead of
  // an editable dropdown whose current value wouldn't even appear in its own options.
  if ((currentRole === 'admin' || currentRole === 'super_admin') && !actorIsSuperAdmin) {
    return <span className="text-sm text-muted-foreground">Only a super admin can change this role</span>;
  }

  const options = ALL_ROLE_OPTIONS.filter((o) => !o.requiresSuperAdmin || actorIsSuperAdmin);

  const handleConfirm = async () => {
    if (!pendingRole) return;
    setIsSaving(true);
    try {
      await usersAPI.updateUserRole(userId, pendingRole);
      toast({ title: 'Role updated' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Could not update role',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
      setPendingRole(null);
    }
  };

  return (
    <>
      <Select value={currentRole} onValueChange={(v) => setPendingRole(v as Exclude<UserRole, 'vendor'>)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ConfirmDialog
        open={!!pendingRole}
        onCancel={() => setPendingRole(null)}
        onConfirm={handleConfirm}
        title="Change this user's role?"
        description={`They will be switched to "${options.find((o) => o.value === pendingRole)?.label}". This takes effect immediately.`}
        confirmLabel="Change Role"
        variant="default"
        isConfirming={isSaving}
      />
    </>
  );
}
