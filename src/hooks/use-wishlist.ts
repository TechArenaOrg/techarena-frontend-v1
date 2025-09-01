'use client';

import * as React from 'react';
import { Product } from '@/types';
import { CACHE_KEYS } from '@/lib/constants';
import { storage } from '@/lib/utils';

interface UseWishlistReturn {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
}

export function useWishlist(): UseWishlistReturn {
  const [items, setItems] = React.useState<Product[]>([]);
  
  // Load wishlist from localStorage on mount
  React.useEffect(() => {
    const savedItems = storage.get<Product[]>(CACHE_KEYS.WISHLIST) || [];
    setItems(savedItems);
  }, []);
  
  // Save to localStorage whenever items change
  React.useEffect(() => {
    storage.set(CACHE_KEYS.WISHLIST, items);
  }, [items]);
  
  const addItem = React.useCallback((product: Product) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems; // Already in wishlist
      }
      return [...prevItems, product];
    });
  }, []);
  
  const removeItem = React.useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId));
  }, []);
  
  const isInWishlist = React.useCallback((productId: string) => {
    return items.some(item => item.id === productId);
  }, [items]);
  
  const clearWishlist = React.useCallback(() => {
    setItems([]);
    storage.remove(CACHE_KEYS.WISHLIST);
  }, []);
  
  return {
    items,
    addItem,
    removeItem,
    isInWishlist,
    clearWishlist,
    itemCount: items.length,
  };
}