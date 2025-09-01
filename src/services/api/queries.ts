// Legacy GraphQL queries - now replaced with mock API
// These are kept for reference but not used in the application

export const QUERY_ENDPOINTS = {
  // Users
  GET_CURRENT_USER: '/api/auth/user',
  GET_USER_PROFILE: '/api/users/profile',
  GET_USERS: '/api/users',
  
  // Products
  GET_PRODUCTS: '/api/products',
  GET_PRODUCT: '/api/products/:slug',
  GET_FEATURED_PRODUCTS: '/api/products/featured',
  SEARCH_PRODUCTS: '/api/products/search',
  
  // Categories
  GET_CATEGORIES: '/api/categories',
  GET_CATEGORY: '/api/categories/:slug',
  
  // Orders
  GET_ORDERS: '/api/orders',
  GET_ORDER: '/api/orders/:id',
  GET_USER_ORDERS: '/api/users/orders',
  
  // Cart
  GET_CART: '/api/cart',
  
  // Reviews
  GET_PRODUCT_REVIEWS: '/api/products/:id/reviews',
  GET_USER_REVIEWS: '/api/users/reviews',
  
  // Wishlist
  GET_WISHLIST: '/api/wishlist',
  
  // Dashboard
  GET_DASHBOARD_STATS: '/api/dashboard/stats',
};