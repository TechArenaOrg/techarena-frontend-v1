// Application Constants
export const APP_NAME = 'TechArena Uganda';
export const APP_DESCRIPTION = 'Uganda\'s Premier Technology Marketplace';
export const APP_VERSION = '1.0.0';

// Route Constants
export const ROUTES = {
  HOME: '/',
  
  // Authentication
  LOGIN: '/account/login',
  REGISTER: '/account/register',
  PROFILE: '/account/profile',
  FORGOT_PASSWORD: '/account/forgot-password',
  RESET_PASSWORD: '/account/reset-password',
  
  // Shopping
  PRODUCTS: '/products',
  PRODUCT: (slug: string) => `/product/${slug}`,
  CATEGORY: (slug: string) => `/category/${slug}`,
  SEARCH: '/search',
  CART: '/cart',
  CHECKOUT: '/checkout',
  
  // Orders
  ORDERS: '/account/orders',
  ORDER: (id: string) => `/account/orders/${id}`,
  
  // Vendor
  VENDOR_DASHBOARD: '/vendor/dashboard',
  VENDOR_PRODUCTS: '/vendor/products',
  VENDOR_ORDERS: '/vendor/orders',
  VENDOR_ANALYTICS: '/vendor/analytics',
  VENDOR_PROFILE: '/vendor/profile',
  
  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_SETTINGS: '/admin/settings',
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  OFFICIAL_STORE_MANAGER: 'official_store_manager',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  FAILED: 'failed',
} as const;

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.REFUNDED]: 'Refunded',
  [ORDER_STATUS.FAILED]: 'Failed',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  MOBILE_MONEY: 'mobile_money',
  BANK_TRANSFER: 'bank_transfer',
  CASH_ON_DELIVERY: 'cash_on_delivery',
} as const;

// Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CREDIT_CARD]: 'Credit Card',
  [PAYMENT_METHODS.MOBILE_MONEY]: 'Mobile Money',
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Bank Transfer',
  [PAYMENT_METHODS.CASH_ON_DELIVERY]: 'Cash on Delivery',
} as const;

// Product Status
export const PRODUCT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
} as const;

// Vendor Status
export const VENDOR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
} as const;

// Countries (East Africa focus)
export const COUNTRIES = [
  { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼' },
  { code: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: 'SS', name: 'South Sudan', flag: '🇸🇸' },
] as const;

// Uganda Districts (major ones)
export const UGANDA_DISTRICTS = [
  'Kampala',
  'Wakiso',
  'Mukono',
  'Jinja',
  'Entebbe',
  'Mbarara',
  'Gulu',
  'Lira',
  'Fort Portal',
  'Masaka',
  'Arua',
  'Soroti',
  'Mbale',
  'Kasese',
  'Hoima',
] as const;

// Product Categories (sample)
export const PRODUCT_CATEGORIES = [
  {
    id: 'computers',
    name: 'Computers & Laptops',
    slug: 'computers-laptops',
    icon: '💻',
    subcategories: ['Laptops', 'Desktops', 'Accessories', 'Components'],
  },
  {
    id: 'smartphones',
    name: 'Smartphones & Tablets',
    slug: 'smartphones-tablets',
    icon: '📱',
    subcategories: ['Smartphones', 'Tablets', 'Accessories', 'Cases'],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: '⚡',
    subcategories: ['Audio', 'Video', 'Gaming', 'Smart Home'],
  },
  {
    id: 'accessories',
    name: 'Accessories',
    slug: 'accessories',
    icon: '🔌',
    subcategories: ['Cables', 'Chargers', 'Storage', 'Networking'],
  },
  {
    id: 'software',
    name: 'Software',
    slug: 'software',
    icon: '💾',
    subcategories: ['Operating Systems', 'Productivity', 'Antivirus', 'Games'],
  },
] as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  MAX_LIMIT: 50,
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10,
  REVIEWS_PER_PAGE: 5,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER: 'user',
  CART: 'cart',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  WISHLIST: 'wishlist',
  RECENT_SEARCHES: 'recent_searches',
  VIEWED_PRODUCTS: 'viewed_products',
} as const;

// Theme Configuration
export const THEME = {
  COLORS: {
    PRIMARY: '#2563eb',
    SECONDARY: '#64748b',
    SUCCESS: '#22c55e',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const;

// Social Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/techarenaug',
  TWITTER: 'https://twitter.com/techarenaug',
  INSTAGRAM: 'https://instagram.com/techarenaug',
  LINKEDIN: 'https://linkedin.com/company/techarenaug',
  YOUTUBE: 'https://youtube.com/@techarenaug',
  WHATSAPP: 'https://wa.me/256700000000',
} as const;

// Contact Information
export const CONTACT_INFO = {
  EMAIL: 'techarenaug@gmail.com',
  PHONE: '+256 757 206 101',
  ADDRESS: 'Kampala, Uganda',
  BUSINESS_HOURS: 'Mon - Fri: 8:00 AM - 6:00 PM',
} as const;

// SEO Constants
export const SEO = {
  DEFAULT_TITLE: APP_NAME,
  DEFAULT_DESCRIPTION: APP_DESCRIPTION,
  DEFAULT_KEYWORDS: 'technology, electronics, computers, smartphones, Uganda, online shopping',
  DEFAULT_IMAGE: '/images/og-image.jpg',
  TWITTER_HANDLE: '@techarenaug',
} as const;

// Feature Flags
export const FEATURES = {
  WISHLIST: true,
  REVIEWS: true,
  COMPARISON: true,
  CHAT_SUPPORT: false,
  PUSH_NOTIFICATIONS: false,
  DARK_MODE: true,
  MULTI_LANGUAGE: false,
  CRYPTOCURRENCY_PAYMENT: false,
} as const;