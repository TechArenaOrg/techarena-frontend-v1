'use client';

import { useEffect, useState } from 'react';
import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AddressFormDialog } from '@/components/account/AddressFormDialog';
import { useToast } from '@/hooks/use-toast';
import { addressesAPI } from '@/services/api/addresses-api';
import { ApiError } from '@/services/api/client';
import type { Address } from '@/types';

export function AddressList() {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    addressesAPI
      .getAddresses()
      .then(setAddresses)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load addresses.'));
  }, []);

  const handleSaved = (saved: Address) => {
    setAddresses((prev) => {
      const existing = prev ?? [];
      const isNew = !existing.some((a) => a.id === saved.id);
      // Editing replaces the address in place so it doesn't jump position; only a
      // genuinely new address gets appended.
      const withSaved = isNew ? [...existing, saved] : existing.map((a) => (a.id === saved.id ? saved : a));
      // A new default replaces the previous default of the same type, matching the
      // backend's "one default per type" behavior.
      return withSaved.map((a) =>
        a.id !== saved.id && saved.isDefault && a.type === saved.type ? { ...a, isDefault: false } : a
      );
    });
    toast({ title: 'Address saved' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await addressesAPI.deleteAddress(deleteTarget.id);
      setAddresses((prev) => (prev ?? []).filter((a) => a.id !== deleteTarget.id));
      toast({ title: 'Address deleted' });
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-destructive">{error}</CardContent>
      </Card>
    );
  }

  if (!addresses) {
    return (
      <div className="flex justify-center py-12">
        <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddressFormDialog
          onSaved={handleSaved}
          trigger={
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          }
        />
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MapPin className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>You haven't added any addresses yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {address.type}
                    </Badge>
                    {address.isDefault && (
                      <Badge className="bg-primary text-primary-foreground border-0">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <AddressFormDialog
                      address={address}
                      onSaved={handleSaved}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit address">
                          <Pencil className="w-4 h-4" />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Delete address"
                      onClick={() => setDeleteTarget(address)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{address.streetAddress}</p>
                  {address.apartment && <p>{address.apartment}</p>}
                  <p>
                    {address.city}
                    {address.stateProvince ? `, ${address.stateProvince}` : ''}
                    {address.postalCode ? ` ${address.postalCode}` : ''}
                  </p>
                  <p>{address.country}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this address?"
        description="This can't be undone."
        confirmLabel="Delete"
        isConfirming={isDeleting}
      />
    </div>
  );
}
