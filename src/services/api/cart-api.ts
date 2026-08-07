// Real cart calls against the live TechArena backend. Cart requires authentication -
// there's no guest/session-based cart on this backend (GET /cart with no token is a
// plain 401), so callers must gate on an active session before using this.
import { apiClient } from './client';
import { normalizeProduct } from './normalize';
import type { CartItem } from '@/types';

interface RawCartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string | null;
  quantity: number;
  price: string | number;
  createdAt: string;
  updatedAt: string;
  product?: any;
}

interface RawCartResponse {
  cart: { id: string; userId?: string; sessionId?: string; createdAt: string; updatedAt: string };
  totals: { subtotal: number; itemCount: number; items: RawCartItem[] };
}

function normalizeCartItem(raw: RawCartItem): CartItem {
  const price = typeof raw.price === 'string' ? parseFloat(raw.price) : raw.price;
  return {
    id: raw.id,
    cartId: raw.cartId,
    productId: raw.productId,
    variantId: raw.variantId ?? undefined,
    quantity: raw.quantity,
    price,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    product: raw.product ? normalizeProduct(raw.product) : undefined,
    totalPrice: price * raw.quantity,
  } as CartItem;
}

async function getCart() {
  const raw = await apiClient.get<RawCartResponse>('/cart');
  return {
    items: raw.totals.items.map(normalizeCartItem),
    totalAmount: raw.totals.subtotal,
    totalItems: raw.totals.itemCount,
    currency: 'UGX',
  };
}

export const cartAPI = {
  getCart,

  // The add/update/remove/clear endpoints don't consistently return the populated
  // cart (some return just the mutated item, some just a message) - re-fetch after
  // each mutation so callers always get product-populated items back.
  async addToCart(productId: string, quantity: number = 1, variantId?: string) {
    await apiClient.post('/cart/add', { productId, quantity, variantId });
    return getCart();
  },

  async updateCartItem(itemId: string, quantity: number) {
    await apiClient.put(`/cart/items/${itemId}`, { quantity });
    return getCart();
  },

  async removeFromCart(itemId: string) {
    await apiClient.delete(`/cart/items/${itemId}`);
    return getCart();
  },

  async clearCart() {
    await apiClient.delete('/cart/clear');
    return { success: true };
  },
};

export default cartAPI;
