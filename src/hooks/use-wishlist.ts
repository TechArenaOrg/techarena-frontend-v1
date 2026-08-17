'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/types';
import { CACHE_KEYS } from '@/lib/constants';
import { storage } from '@/lib/utils';

// Wishlist has no backend support - it's localStorage-only. Every component that calls
// this hook must see the SAME data, so the React Query cache (keyed by CACHE_KEYS.WISHLIST)
// is used as the shared in-memory store: mutating it via queryClient.setQueryData notifies
// every other component subscribed to the same key immediately, the same way useCart's
// query cache keeps the header badge and cart page in sync.
const WISHLIST_KEY = [CACHE_KEYS.WISHLIST];

interface UseWishlistReturn {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
}

export function useWishlist(): UseWishlistReturn {
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: () => storage.get<Product[]>(CACHE_KEYS.WISHLIST) || [],
    staleTime: Infinity,
  });

  const persist = (next: Product[]) => {
    storage.set(CACHE_KEYS.WISHLIST, next);
    queryClient.setQueryData(WISHLIST_KEY, next);
  };

  const addItem = (product: Product) => {
    if (items.some((item) => item.id === product.id)) return;
    persist([...items, product]);
  };

  const removeItem = (productId: string) => {
    persist(items.filter((item) => item.id !== productId));
  };

  const isInWishlist = (productId: string) => items.some((item) => item.id === productId);

  const clearWishlist = () => {
    storage.remove(CACHE_KEYS.WISHLIST);
    queryClient.setQueryData(WISHLIST_KEY, []);
  };

  return {
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
    itemCount: items.length,
  };
}
