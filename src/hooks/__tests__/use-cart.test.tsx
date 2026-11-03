import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCart } from '../use-cart';
import { ReactNode } from 'react';

// Mock the toast hook
jest.mock('../use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should initialize with empty cart', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('should add item to cart', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCart(), { wrapper });

    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100000,
      slug: 'test-product',
      image: '/test-image.jpg',
      vendor: { name: 'Test Vendor' },
      status: 'active' as const,
    };

    await act(async () => {
      await result.current.addItem(mockProduct, 2);
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].product.id).toBe('1');
      expect(result.current.items[0].quantity).toBe(2);
      expect(result.current.totalItems).toBe(2);
      expect(result.current.totalAmount).toBe(200000);
    });
  });

  it('should update existing item quantity when adding same product', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCart(), { wrapper });

    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100000,
      slug: 'test-product',
      image: '/test-image.jpg',
      vendor: { name: 'Test Vendor' },
      status: 'active' as const,
    };

    await act(async () => {
      await result.current.addItem(mockProduct, 1);
    });

    await act(async () => {
      await result.current.addItem(mockProduct, 2);
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(3);
      expect(result.current.totalItems).toBe(3);
    });
  });

  it('should update item quantity', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCart(), { wrapper });

    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100000,
      slug: 'test-product',
      image: '/test-image.jpg',
      vendor: { name: 'Test Vendor' },
      status: 'active' as const,
    };

    await act(async () => {
      await result.current.addItem(mockProduct, 1);
    });

    const cartItemId = result.current.items[0].id;

    await act(async () => {
      await result.current.updateQuantity(cartItemId, 5);
    });

    await waitFor(() => {
      expect(result.current.items[0].quantity).toBe(5);
      expect(result.current.totalItems).toBe(5);
      expect(result.current.totalAmount).toBe(500000);
    });
  });

  it('should remove item from cart', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCart(), { wrapper });

    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100000,
      slug: 'test-product',
      image: '/test-image.jpg',
      vendor: { name: 'Test Vendor' },
      status: 'active' as const,
    };

    await act(async () => {
      await result.current.addItem(mockProduct, 1);
    });

    const cartItemId = result.current.items[0].id;

    await act(async () => {
      await result.current.removeItem(cartItemId);
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalAmount).toBe(0);
    });
  });

  it('should clear all items from cart', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCart(), { wrapper });

    const mockProduct1 = {
      id: '1',
      name: 'Product 1',
      price: 100000,
      slug: 'product-1',
      image: '/image1.jpg',
      vendor: { name: 'Vendor 1' },
      status: 'active' as const,
    };

    const mockProduct2 = {
      id: '2',
      name: 'Product 2',
      price: 150000,
      slug: 'product-2',
      image: '/image2.jpg',
      vendor: { name: 'Vendor 2' },
      status: 'active' as const,
    };

    await act(async () => {
      await result.current.addItem(mockProduct1, 1);
      await result.current.addItem(mockProduct2, 2);
    });

    expect(result.current.items).toHaveLength(2);

    await act(async () => {
      await result.current.clearCart();
    });

    await waitFor(() => {
      expect(result.current.items).toHaveLength(0);
      expect(result.current.totalItems).toBe(0);
      expect(result.current.totalAmount).toBe(0);
    });
  });

  it('should persist cart data to localStorage', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCart(), { wrapper });

    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 100000,
      slug: 'test-product',
      image: '/test-image.jpg',
      vendor: { name: 'Test Vendor' },
      status: 'active' as const,
    };

    await act(async () => {
      await result.current.addItem(mockProduct, 1);
    });

    await waitFor(() => {
      const storedCart = localStorage.getItem('cart');
      expect(storedCart).toBeTruthy();
      
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        expect(parsedCart.items).toHaveLength(1);
        expect(parsedCart.items[0].product.id).toBe('1');
      }
    });
  });
});