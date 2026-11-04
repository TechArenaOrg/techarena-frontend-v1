'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/hooks/use-toast';
import { categoriesAPI } from '@/services/api/categories-api';
import { ApiError } from '@/services/api/client';

interface DeleteCategoryButtonProps {
  categoryId: string;
  categoryName: string;
  childCount: number;
  productCount: number;
}

export function DeleteCategoryButton({ categoryId, categoryName, childCount, productCount }: DeleteCategoryButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const warnings = [
    childCount > 0 ? `${childCount} subcategor${childCount === 1 ? 'y' : 'ies'}` : null,
    productCount > 0 ? `${productCount} product${productCount === 1 ? '' : 's'}` : null,
  ].filter(Boolean);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await categoriesAPI.deleteCategory(categoryId);
      toast({ title: 'Category deleted' });
      setOpen(false);
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
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Icons.trash2 className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={`Delete "${categoryName}"?`}
        description={
          warnings.length > 0
            ? `This category still has ${warnings.join(' and ')}. The backend may refuse to delete it until those are moved or removed first.`
            : 'This cannot be undone.'
        }
        confirmLabel="Delete"
        isConfirming={isDeleting}
      />
    </>
  );
}
