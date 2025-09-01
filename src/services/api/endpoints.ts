// Legacy GraphQL endpoints - now replaced with mock API
// These are kept for reference but not used in the application

export const API_ENDPOINTS = {
  // Products
  PRODUCTS: '/api/products',
  PRODUCT: '/api/products/:slug',
  FEATURED_PRODUCTS: '/api/products/featured',
  SEARCH_PRODUCTS: '/api/products/search',
  
  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY: '/api/categories/:slug',
  
  // Cart
  CART: '/api/cart',
  CART_ADD: '/api/cart/add',
  CART_UPDATE: '/api/cart/update',
  CART_REMOVE: '/api/cart/remove',
  CART_CLEAR: '/api/cart/clear',
  
  // Orders
  ORDERS: '/api/orders',
  ORDER: '/api/orders/:id',
  CREATE_ORDER: '/api/orders/create',
  
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
  USER: '/api/auth/user',
  
  // Reviews
  REVIEWS: '/api/reviews',
  CREATE_REVIEW: '/api/reviews/create',
  
  // Vendor
  VENDOR_PROFILE: '/api/vendor/profile',
  VENDOR_PRODUCTS: '/api/vendor/products',
  VENDOR_ORDERS: '/api/vendor/orders',
  
  // Admin
  ADMIN_USERS: '/api/admin/users',
  ADMIN_VENDORS: '/api/admin/vendors',
};