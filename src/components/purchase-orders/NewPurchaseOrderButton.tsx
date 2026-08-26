'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { SimpleModal } from '@/components/ui/simple-modal';
import { Icons } from '@/components/ui/icons';
import { PurchaseOrderForm } from '@/components/purchase-orders/PurchaseOrderForm';
import type { Vendor } from '@/types';

interface ProductOption {
  id: string;
  name: string;
  sku: string;
}

interface NewPurchaseOrderButtonProps {
  products: ProductOption[];
  vendors?: Vendor[];
}

export function NewPurchaseOrderButton({ products, vendors }: NewPurchaseOrderButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.plus className="mr-2 h-4 w-4" />
        New Purchase Order
      </Button>
      <SimpleModal open={open} onClose={() => setOpen(false)} title="New Purchase Order" className="max-w-2xl">
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
      </SimpleModal>
    </>
  );
}
