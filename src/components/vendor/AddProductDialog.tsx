'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProductForm } from '@/components/vendor/ProductForm';
import type { Category, Vendor } from '@/types';

interface AddProductDialogProps {
  trigger: ReactNode;
  categories: Category[];
  vendors?: Vendor[];
}

export function AddProductDialog({ trigger, categories, vendors }: AddProductDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>
        <ProductForm
          categories={categories}
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
