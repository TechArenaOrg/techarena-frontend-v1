'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { productsAPI } from '@/services/api/products-api';
import { ApiError } from '@/services/api/client';

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Remove "${productName}"? This deactivates it - it's hidden from customers and your default product list, but stays in your records and can be reactivated later.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await productsAPI.deleteProduct(productId);
      toast({ title: 'Product deactivated' });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof ApiError ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-destructive hover:text-destructive">
      <Icons.trash2 className="h-4 w-4" />
    </Button>
  );
}
