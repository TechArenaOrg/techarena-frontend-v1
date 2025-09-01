import {
  mockProducts,
  mockUsers,
  mockOrders,
  mockCategories,
  mockVendors,
  mockReviews,
  mockCartItems,
  mockWishlistItems
} from './mockData';
import { Product, User, Order, Category, Vendor, Review, CartItem, WishlistItem } from '@/types';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication API
export const authAPI = {
  async login(email: string, password: string) {
    await delay(1000);
    const user = mockUsers.find(u => u.email === email);
    if (!user || password !== 'password123') {
      throw new Error('Invalid credentials');
    }
    return {
      user,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  }) {
    await delay(1200);
    
    // Check if email already exists
    if (mockUsers.find(u => u.email === userData.email)) {
      throw new Error('Email already exists');
    }

    const userId = `user-${Date.now()}`;
    const newUser: User = {
      id: userId,
      email: userData.email,
      role: 'customer',
      status: 'active',
      emailVerified: true,
      phoneVerified: false,
      phone: userData.phone,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        id: `profile-${Date.now()}`,
        userId: userId,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    mockUsers.push(newUser);
    
    return {
      user: newUser,
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    };
  },

  async getCurrentUser() {
    await delay(500);
    return mockUsers[0]; // Return first user as current user
  },

  async logout() {
    await delay(300);
    return { success: true };
  }
};

// Products API
export const productsAPI = {
  async getProducts(params?: {
    categoryId?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    await delay(800);
    
    let products = [...mockProducts];
    
    // Apply filters
    if (params?.categoryId) {
      products = products.filter(p => p.categoryId === params.categoryId);
    }
    
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        (p.description && p.description.toLowerCase().includes(searchTerm))
      );
    }
    
    if (params?.minPrice) {
      products = products.filter(p => p.price >= params.minPrice!);
    }
    
    if (params?.maxPrice) {
      products = products.filter(p => p.price <= params.maxPrice!);
    }
    
    // Apply sorting
    switch (params?.sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);
    
    return {
      products: paginatedProducts,
      totalCount: products.length,
      currentPage: page,
      totalPages: Math.ceil(products.length / limit),
      hasNextPage: startIndex + limit < products.length,
      hasPreviousPage: page > 1
    };
  },

  async getProduct(slug: string) {
    await delay(500);
    const product = mockProducts.find(p => p.slug === slug);
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Get related products (same category)
    const relatedProducts = mockProducts
      .filter(p => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);
    
    // Get reviews for this product
    const productReviews = mockReviews.filter(r => r.productId === product.id);
    
    return {
      ...product,
      relatedProducts,
      reviews: productReviews
    };
  },

  async getFeaturedProducts(limit = 8) {
    await delay(600);
    return mockProducts.filter(p => p.isFeatured).slice(0, limit);
  },

  async searchProducts(query: string) {
    await delay(700);
    const searchTerm = query.toLowerCase();
    const results = mockProducts.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description && p.description.toLowerCase().includes(searchTerm))
    );
    
    return {
      products: results,
      totalCount: results.length,
      suggestions: []
    };
  }
};

// Categories API
export const categoriesAPI = {
  async getCategories() {
    await delay(400);
    return mockCategories;
  },

  async getCategory(slug: string) {
    await delay(500);
    const category = mockCategories.find(c => c.slug === slug);
    if (!category) {
      throw new Error('Category not found');
    }
    
    // Get products in this category
    const categoryProducts = mockProducts.filter(p => p.categoryId === category.id);
    
    return {
      ...category,
      products: categoryProducts
    };
  },

  async getFeaturedCategories() {
    await delay(300);
    return mockCategories.slice(0, 6);
  }
};

// Cart API
export const cartAPI = {
  async getCart() {
    await delay(400);
    const totalAmount = mockCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const totalItems = mockCartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      items: mockCartItems,
      totalAmount,
      totalItems,
      currency: 'UGX'
    };
  },

  async addToCart(productId: string, quantity: number = 1) {
    await delay(600);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = mockCartItems.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}`,
        cartId: `cart-${Date.now()}`,
        productId,
        quantity,
        price: product.price,
        totalPrice: product.price * quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
        product
      };
      mockCartItems.push(newItem);
    }

    return this.getCart();
  },

  async updateCartItem(itemId: string, quantity: number) {
    await delay(500);
    const item = mockCartItems.find(item => item.id === itemId);
    if (!item) {
      throw new Error('Cart item not found');
    }
    
    item.quantity = quantity;
    return this.getCart();
  },

  async removeFromCart(itemId: string) {
    await delay(400);
    const index = mockCartItems.findIndex(item => item.id === itemId);
    if (index === -1) {
      throw new Error('Cart item not found');
    }
    
    mockCartItems.splice(index, 1);
    return this.getCart();
  },

  async clearCart() {
    await delay(300);
    mockCartItems.length = 0;
    return { success: true };
  }
};

// Wishlist API
export const wishlistAPI = {
  async getWishlist() {
    await delay(500);
    return mockWishlistItems;
  },

  async addToWishlist(productId: string) {
    await delay(600);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const existingItem = mockWishlistItems.find(item => item.productId === productId);
    if (existingItem) {
      throw new Error('Product already in wishlist');
    }

    const newItem: WishlistItem = {
      id: `wishlist-${Date.now()}`,
      userId: `user-${Date.now()}`, // In a real app, this would be the current user's ID
      productId,
      product,
      createdAt: new Date()
    };
    
    mockWishlistItems.push(newItem);
    return newItem;
  },

  async removeFromWishlist(productId: string) {
    await delay(400);
    const index = mockWishlistItems.findIndex(item => item.productId === productId);
    if (index === -1) {
      throw new Error('Product not in wishlist');
    }
    
    mockWishlistItems.splice(index, 1);
    return { success: true };
  }
};

// Orders API
export const ordersAPI = {
  async getOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    await delay(800);
    
    let orders = [...mockOrders];
    
    if (params?.status) {
      orders = orders.filter(o => o.status === params.status);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);
    
    return {
      orders: paginatedOrders,
      totalCount: orders.length,
      currentPage: page,
      totalPages: Math.ceil(orders.length / limit)
    };
  },

  async getOrder(id: string) {
    await delay(600);
    const order = mockOrders.find(o => o.id === id);
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  },

  async createOrder(orderData: {
    items: Array<{productId: string; quantity: number; price: number}>;
    shippingAddress: any;
    billingAddress?: any;
    paymentMethod: string;
    notes?: string;
  }) {
    await delay(1500);
    
    const totalAmount = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = totalAmount * 0.18; // 18% VAT
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      userId: '1', // Current user
      orderNumber: `TA-${new Date().getFullYear()}-${String(mockOrders.length + 1).padStart(3, '0')}`,
      status: 'processing',
      subtotal: totalAmount,
      totalAmount: totalAmount + taxAmount,
      shippingAmount: 0,
      taxAmount,
      discountAmount: 0,
      placedAt: new Date(),
      notes: orderData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress || orderData.shippingAddress,
      items: orderData.items.map((item, index) => {
        const product = mockProducts.find(p => p.id === item.productId)!;
        return {
          id: `item-${Date.now()}-${index}`,
          orderId: `order-${Date.now()}`,
          productId: item.productId,
          vendorId: product.vendorId || 'vendor-default',
          productName: product.name,
          productSku: product.sku || `SKU-${product.id}`,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          status: 'pending' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          product,
          vendor: product.vendor || {
            id: 'vendor-default',
            userId: 'user-vendor',
            businessName: 'TechArena Store',
            slug: 'techarena-store',
            status: 'approved' as const,
            commissionRate: 0.15,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
      }),
      payments: []
    };
    
    mockOrders.push(newOrder);
    return newOrder;
  }
};

// Reviews API
export const reviewsAPI = {
  async getProductReviews(productId: string) {
    await delay(500);
    return mockReviews.filter(r => r.productId === productId);
  },

  async createReview(reviewData: {
    productId: string;
    rating: number;
    comment: string;
  }) {
    await delay(800);
    
    const newReview: Review = {
      id: `review-${Date.now()}`,
      productId: reviewData.productId,
      userId: '1', // Current user
      rating: reviewData.rating,
      content: reviewData.comment,
      isVerified: true,
      status: 'approved' as const,
      helpfulCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: '1',
        email: 'john@example.com',
        role: 'customer' as const,
        status: 'active' as const,
        emailVerified: true,
        phoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        profile: {
          id: 'profile-1',
          userId: '1',
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: '/images/avatars/john-doe.jpg',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      product: mockProducts.find(p => p.id === reviewData.productId)!
    };
    
    mockReviews.push(newReview);
    return newReview;
  }
};

// Vendors API
export const vendorsAPI = {
  async getVendors(params?: {
    page?: number;
    limit?: number;
  }) {
    await delay(600);
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedVendors = mockVendors.slice(startIndex, startIndex + limit);
    
    return {
      vendors: paginatedVendors,
      totalCount: mockVendors.length,
      currentPage: page,
      totalPages: Math.ceil(mockVendors.length / limit)
    };
  },

  async getVendor(slug: string) {
    await delay(500);
    const vendor = mockVendors.find(v => v.slug === slug);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
    
    const vendorProducts = mockProducts.filter(p => p.vendorId === vendor.id);
    const vendorReviews = mockReviews.filter(r => 
      vendorProducts.some(p => p.id === r.productId)
    );
    
    return {
      ...vendor,
      products: vendorProducts,
      reviews: vendorReviews
    };
  },

  async getVendorStats(vendorId: string) {
    await delay(700);
    const vendorProducts = mockProducts.filter(p => p.vendorId === vendorId);
    const vendorOrders = mockOrders.filter(o => 
      o.items.some(item => vendorProducts.some(p => p.id === item.productId))
    );
    
    return {
      totalProducts: vendorProducts.length,
      totalOrders: vendorOrders.length,
      totalRevenue: vendorOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      lowStockProducts: vendorProducts.filter(p => p.stockQuantity <= p.lowStockThreshold),
      recentOrders: vendorOrders.slice(0, 5)
    };
  }
};

// Admin API
export const adminAPI = {
  async getDashboardStats() {
    await delay(1000);
    return {
      totalRevenue: 750000,
      totalOrders: 142,
      totalProducts: 28,
      totalUsers: 85
    };
  },

  async getUsers(params?: {
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    await delay(800);
    
    let users = [...mockUsers];
    
    if (params?.role) {
      users = users.filter(u => u.role === params.role);
    }
    
    if (params?.status) {
      users = users.filter(u => u.status === params.status);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = users.slice(startIndex, startIndex + limit);
    
    return {
      users: paginatedUsers,
      totalCount: users.length,
      currentPage: page,
      totalPages: Math.ceil(users.length / limit)
    };
  },

  async getAllVendors(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    await delay(800);
    return vendorsAPI.getVendors(params);
  }
};

// Export all APIs
export const mockAPI = {
  auth: authAPI,
  products: productsAPI,
  categories: categoriesAPI,
  cart: cartAPI,
  wishlist: wishlistAPI,
  orders: ordersAPI,
  reviews: reviewsAPI,
  vendors: vendorsAPI,
  admin: adminAPI
};

export default mockAPI;