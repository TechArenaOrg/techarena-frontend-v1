// Remembers a product a logged-out user tried to add to cart / buy now, so it can be
// completed automatically right after they sign in instead of being silently lost.
const STORAGE_KEY = 'techarena_pending_cart_action';

interface PendingCartAction {
  productId: string;
  quantity: number;
}

export function setPendingCartAction(productId: string, quantity: number = 1) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ productId, quantity }));
}

// Reads and clears the pending action in one step - it should only ever be resumed once.
export function takePendingCartAction(): PendingCartAction | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  window.localStorage.removeItem(STORAGE_KEY);
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
