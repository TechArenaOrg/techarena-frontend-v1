// React Query hooks for API calls with mock data
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { mockAPI } from './mock-endpoints';
import { Product, Category, User, Order } from '@/types';

// Auth Hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => mockAPI.auth.getCurrentUser(),
    retry: false,
  });
}

export function useLogin() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => 
      mockAPI.auth.login(credentials.email, credentials.password),
    onSuccess: (data) => {
      toast({
        title: 'Login successful',
        description: `Welcome back!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRegister() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: any) => mockAPI.auth.register(data),
    onSuccess: (data) => {
      toast({
        title: 'Registration successful',
        description: `Welcome to TechArena!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useLogout() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => mockAPI.auth.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    },
  });
}

// Product Hooks
export function useProducts(filters?: any) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => mockAPI.products.getProducts(filters),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => mockAPI.products.getProduct(slug),
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => mockAPI.products.getFeaturedProducts(),
  });
}

export function useSearchProducts() {
  return useMutation({
    mutationFn: (params: { query: string; filters?: any }) =>
      mockAPI.products.searchProducts(params.query),
  });
}

// Category Hooks
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => mockAPI.categories.getCategories(),
  });
}

export function useFeaturedCategories() {
  return useQuery({
    queryKey: ['featuredCategories'],
    queryFn: () => mockAPI.categories.getFeaturedCategories(),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => mockAPI.categories.getCategory(slug),
    enabled: !!slug,
  });
}

// Cart Hooks
export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => mockAPI.cart.getCart(),
  });
}

export function useAddToCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (item: { productId: string; quantity: number; variantId?: string }) =>
      mockAPI.cart.addToCart(item.productId, item.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Added to cart',
        description: 'Item has been added to your cart.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateCartItem() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      mockAPI.cart.updateCartItem(id, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Cart updated',
        description: 'Item quantity has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveFromCart() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => mockAPI.cart.removeFromCart(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Order Hooks
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => mockAPI.orders.getOrders(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => mockAPI.orders.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: any) => mockAPI.orders.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: 'Order placed',
        description: 'Your order has been successfully placed!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Review Hooks
export function useCreateReview() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (reviewData: any) => mockAPI.reviews.createReview(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product'] });
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review!',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Wishlist Hooks
export function useWishlist() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => mockAPI.wishlist.getWishlist(),
  });
}

export function useAddToWishlist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => mockAPI.wishlist.addToWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: 'Added to wishlist',
        description: 'Item has been added to your wishlist.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveFromWishlist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (productId: string) => mockAPI.wishlist.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}