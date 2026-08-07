'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { cartAPI } from '@/services/api/cart-api';
import { CACHE_KEYS } from '@/lib/constants';

export function useCart() {
  const { status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const queryClient = useQueryClient();

  // The backend has no guest/session cart - GET /cart 401s without a logged-in user -
  // so the query is disabled entirely until there's an active session.
  const { data: cartData, isLoading: isCartLoading } = useQuery({
    queryKey: [CACHE_KEYS.CART],
    queryFn: cartAPI.getCart,
    enabled: isAuthenticated,
    staleTime: 0,
  });

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.CART] });

  const addItemMutation = useMutation({
    mutationFn: (data: { productId: string; variantId?: string; quantity: number }) =>
      cartAPI.addToCart(data.productId, data.quantity, data.variantId),
    onSuccess: invalidateCart,
    onError: (error) => {
      console.error('Failed to add item to cart:', error);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartAPI.updateCartItem(itemId, quantity),
    onSuccess: invalidateCart,
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartAPI.removeFromCart(itemId),
    onSuccess: invalidateCart,
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartAPI.clearCart(),
    onSuccess: invalidateCart,
  });

  return {
    // Data
    items: cartData?.items || [],
    itemCount: cartData?.totalItems || 0,
    subtotal: cartData?.totalAmount || 0,
    isLoading: isAuthenticated && isCartLoading,
    isAuthenticated,

    // Actions - mutateAsync so callers' `await addItem(...)` actually rejects on failure
    addItem: addItemMutation.mutateAsync,
    updateItem: (itemId: string, quantity: number) =>
      updateItemMutation.mutateAsync({ itemId, quantity }),
    removeItem: removeItemMutation.mutateAsync,
    clearCart: clearCartMutation.mutateAsync,

    // Loading states
    isAddingItem: addItemMutation.isPending,
    isUpdatingItem: updateItemMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}
