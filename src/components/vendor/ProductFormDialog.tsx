'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Icons } from '@/components/ui/icons';
import { ProductForm } from '@/components/vendor/ProductForm';
import { productsAPI } from '@/services/api/products-api';
import type { Category, Product, Vendor } from '@/types';

interface ProductFormDialogProps {
  trigger: ReactNode;
  categories: Category[];
  vendors?: Vendor[];
  // When set, the dialog fetches this product's full record on open and shows the
  // edit form. When omitted, it shows the create form.
  productId?: string;
}

export function ProductFormDialog({ trigger, categories, vendors, productId }: ProductFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const isEditing = !!productId;

  useEffect(() => {
    if (open && productId) {
      setLoading(true);
      productsAPI
        .getProductById(productId)
        .then(setProduct)
        .finally(() => setLoading(false));
    }
    if (!open) {
      setProduct(null);
    }
  }, [open, productId]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        {isEditing && loading ? (
          <div className="flex justify-center py-12">
            <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : isEditing && !product ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Couldn't load this product.</p>
        ) : (
          <ProductForm
            categories={categories}
            vendors={vendors}
            product={product ?? undefined}
            bare
            returnPath=""
            onSuccess={() => {
              setOpen(false);
              router.refresh();
            }}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
