'use client';

import { useEffect, useState } from 'react';
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

  // The server can never know what's in localStorage, so it always renders as if the
  // wishlist is empty. If the client's first render (the one React hydrates against)
  // already reflects real localStorage data, React sees a mismatch. Forcing `items` to
  // stay empty until after mount guarantees that first render matches the server, then
  // the real data appears a tick later - safe, since that update happens post-hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { data } = useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: () => storage.get<Product[]>(CACHE_KEYS.WISHLIST) || [],
    staleTime: Infinity,
  });
  const items = mounted ? data ?? [] : [];

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
