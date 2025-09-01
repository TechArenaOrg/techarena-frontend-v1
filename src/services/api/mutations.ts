// Legacy GraphQL mutations - now replaced with mock API
// These are kept for reference but not used in the application

export const MUTATION_ENDPOINTS = {
  // Auth
  REGISTER_USER: '/api/auth/register',
  LOGIN_USER: '/api/auth/login',
  LOGOUT_USER: '/api/auth/logout',
  
  // Products
  CREATE_PRODUCT: '/api/products/create',
  UPDATE_PRODUCT: '/api/products/update',
  DELETE_PRODUCT: '/api/products/delete',
  
  // Orders
  CREATE_ORDER: '/api/orders/create',
  UPDATE_ORDER: '/api/orders/update',
  CANCEL_ORDER: '/api/orders/cancel',
  
  // Cart
  ADD_TO_CART: '/api/cart/add',
  UPDATE_CART_ITEM: '/api/cart/update',
  REMOVE_FROM_CART: '/api/cart/remove',
  CLEAR_CART: '/api/cart/clear',
  
  // Reviews
  CREATE_REVIEW: '/api/reviews/create',
  UPDATE_REVIEW: '/api/reviews/update',
  DELETE_REVIEW: '/api/reviews/delete',
};