'use client';

import { ReactNode, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddressForm } from '@/components/account/AddressForm';
import type { Address } from '@/types';

interface AddressFormDialogProps {
  trigger: ReactNode;
  address?: Address;
  onSaved: (address: Address) => void;
}

export function AddressFormDialog({ trigger, address, onSaved }: AddressFormDialogProps) {
  const [open, setOpen] = useState(false);
  const isEditing = !!address;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Address' : 'Add Address'}</DialogTitle>
        </DialogHeader>
        <AddressForm
          address={address}
          onCancel={() => setOpen(false)}
          onSuccess={(saved) => {
            setOpen(false);
            onSaved(saved);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
