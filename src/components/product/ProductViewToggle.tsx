'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export function ProductViewToggle({ currentView }: { currentView: 'grid' | 'list' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const setView = (view: 'grid' | 'list') => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'grid') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    startTransition(() => router.push(`/products?${params.toString()}`));
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={currentView === 'grid' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setView('grid')}
        aria-label="Grid view"
      >
        <Icons.grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={currentView === 'list' ? 'default' : 'outline'}
        size="icon"
        onClick={() => setView('list')}
        aria-label="List view"
      >
        <Icons.list className="h-4 w-4" />
      </Button>
    </div>
  );
}
