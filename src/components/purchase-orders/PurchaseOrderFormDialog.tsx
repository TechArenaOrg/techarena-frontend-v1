'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm';
import type { Vendor } from '@/types';

interface ProductOption {
  id: string;
  name: string;
  sku: string;
}

interface PurchaseOrderFormDialogProps {
  trigger: ReactNode;
  products: ProductOption[];
  vendors?: Vendor[];
}

export function PurchaseOrderFormDialog({ trigger, products, vendors }: PurchaseOrderFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>New Purchase Order</DialogTitle>
        </DialogHeader>
        <PurchaseOrderForm
          products={products}
          vendors={vendors}
          bare
          returnPath=""
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
