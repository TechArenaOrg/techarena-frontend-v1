'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CartItem, Product, ProductVariant } from '@/types';
import { CACHE_KEYS } from '@/lib/constants';
import { storage } from '@/lib/utils';

// Mock API functions - replace with actual API calls
const mockCartApi = {
  getCart: async (): Promise<{ items: CartItem[], itemCount: number, subtotal: number }> => {
    const items = storage.get<CartItem[]>(CACHE_KEYS.CART) || [];
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    return { items, itemCount, subtotal };
  },
  
  addItem: async (data: { productId: string; variantId?: string; quantity: number }): Promise<CartItem[]> => {
    const currentItems = storage.get<CartItem[]>(CACHE_KEYS.CART) || [];
    
    // Find existing item
    const existingItemIndex = currentItems.findIndex(
      item => item.productId === data.productId && item.variantId === data.variantId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      currentItems[existingItemIndex].quantity += data.quantity;
    } else {
      // Add new item (mock product data)
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        cartId: 'mock-cart-id',
        productId: data.productId,
        variantId: data.variantId,
        quantity: data.quantity,
        price: 50000, // Mock price
        createdAt: new Date(),
        updatedAt: new Date(),
        product: {
          id: data.productId,
          name: 'Mock Product',
          slug: 'mock-product',
          price: 50000,
          isInStock: true,
        } as Product,
        totalPrice: 50000 * data.quantity,
      };
      
      currentItems.push(newItem);
    }
    
    storage.set(CACHE_KEYS.CART, currentItems);
    return currentItems;
  },
  
  updateItem: async (itemId: string, quantity: number): Promise<CartItem[]> => {
    const currentItems = storage.get<CartItem[]>(CACHE_KEYS.CART) || [];
    const itemIndex = currentItems.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        currentItems.splice(itemIndex, 1);
      } else {
        currentItems[itemIndex].quantity = quantity;
        currentItems[itemIndex].totalPrice = currentItems[itemIndex].price * quantity;
        currentItems[itemIndex].updatedAt = new Date();
      }
    }
    
    storage.set(CACHE_KEYS.CART, currentItems);
    return currentItems;
  },
  
  removeItem: async (itemId: string): Promise<CartItem[]> => {
    const currentItems = storage.get<CartItem[]>(CACHE_KEYS.CART) || [];
    const filteredItems = currentItems.filter(item => item.id !== itemId);
    
    storage.set(CACHE_KEYS.CART, filteredItems);
    return filteredItems;
  },
  
  clearCart: async (): Promise<void> => {
    storage.remove(CACHE_KEYS.CART);
  },
};

export function useCart() {
  const queryClient = useQueryClient();
  
  // Get cart data
  const { data: cartData, isLoading } = useQuery({
    queryKey: [CACHE_KEYS.CART],
    queryFn: mockCartApi.getCart,
    staleTime: 0, // Always fetch fresh data
  });
  
  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: mockCartApi.addItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
    onError: (error) => {
      console.error('Failed to add item to cart:', error);
    },
  });
  
  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      mockCartApi.updateItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
  
  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: mockCartApi.removeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
  
  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: mockCartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });
    },
  });
  
  return {
    // Data
    items: cartData?.items || [],
    itemCount: cartData?.itemCount || 0,
    subtotal: cartData?.subtotal || 0,
    isLoading,
    
    // Actions
    addItem: addItemMutation.mutate,
    updateItem: (itemId: string, quantity: number) => 
      updateItemMutation.mutate({ itemId, quantity }),
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    
    // Loading states
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}