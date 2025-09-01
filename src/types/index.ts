// Core Types from SSCD
export type UserRole = 'customer' | 'vendor' | 'admin' | 'super_admin' | 'official_store_manager';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned';
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';
export type AddressType = 'billing' | 'shipping';
export type BusinessType = 'sole_proprietorship' | 'partnership' | 'corporation' | 'llc';
export type VendorStatus = 'pending' | 'approved' | 'suspended' | 'rejected';
export type CategoryStatus = 'active' | 'inactive';
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'out_of_stock';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
export type OrderItemStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentMethod = 'credit_card' | 'mobile_money' | 'bank_transfer' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type NotificationType = 'order_confirmed' | 'order_shipped' | 'order_delivered' | 'payment_received' | 'product_low_stock' | 'vendor_approved' | 'review_received' | 'promotion';
export type CouponType = 'percentage' | 'fixed_amount' | 'free_shipping';

// User-related interfaces
export interface User {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  status: UserStatus;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  addresses?: Address[];
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  type: AddressType;
  isDefault: boolean;
  streetAddress: string;
  apartment?: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  country: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vendor-related interfaces
export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  businessType?: BusinessType;
  businessRegistrationNumber?: string;
  taxNumber?: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  status: VendorStatus;
  approvedAt?: Date;
  approvedBy?: string;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

// Vendor-related interfaces
export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  status: VendorStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  products?: Product[];
}

// Product-related interfaces
export interface Category {
  id: string;
  parentId?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  isFeatured: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
  products?: Product[];
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface Product {
  id: string;
  vendorId: string;
  categoryId?: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: ProductDimensions;
  status: ProductStatus;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  vendor?: Vendor;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
  reviews?: Review[];
  
  // Computed fields
  averageRating?: number;
  reviewCount?: number;
  isInStock?: boolean;
  primaryImage?: ProductImage;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price?: number;
  stockQuantity: number;
  attributes: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// Wishlist-related interfaces
export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
  
  // Relations
  product: Product;
}

// Cart-related interfaces
export interface Cart {
  id: string;
  userId?: string;
  sessionId?: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  
  // Computed fields
  itemCount: number;
  subtotal: number;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  product: Product;
  variant?: ProductVariant;
  
  // Computed fields
  totalPrice: number;
}

// Order-related interfaces
export interface Order {
  id: string;
  userId?: string;
  orderNumber: string;
  status: OrderStatus;
  
  // Pricing
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // Addresses
  billingAddress: Address;
  shippingAddress: Address;
  
  // Customer info
  customerEmail?: string;
  customerPhone?: string;
  
  // Timestamps
  placedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  items: OrderItem[];
  payments: Payment[];
  user?: User;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  vendorId: string;
  
  // Product snapshot
  productName: string;
  productSku: string;
  variantName?: string;
  
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  status: OrderItemStatus;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  product?: Product;
  variant?: ProductVariant;
  vendor: Vendor;
}

// Payment-related interfaces
export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: PaymentMethod;
  provider?: string;
  providerTransactionId?: string;
  
  amount: number;
  currency: string;
  status: PaymentStatus;
  
  gatewayResponse?: any;
  failureReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Review-related interfaces
export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderItemId?: string;
  
  rating: number;
  title?: string;
  content?: string;
  
  isVerified: boolean;
  status: ReviewStatus;
  
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user: User;
  product: Product;
}

// Notification-related interfaces
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  
  isRead: boolean;
  readAt?: Date;
  
  createdAt: Date;
}

// Coupon-related interfaces
export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  
  startsAt: Date;
  expiresAt: Date;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface AddressFormData {
  type: AddressType;
  streetAddress: string;
  apartment?: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface ProductFormData {
  name: string;
  categoryId?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  trackInventory: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: ProductDimensions;
  seoTitle?: string;
  seoDescription?: string;
}

// Search and Filter types
export interface ProductFilter {
  categoryId?: string;
  vendorId?: string;
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFacet {
  name: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}

export interface SearchResult<T> {
  results: T[];
  facets: SearchFacet[];
  total: number;
  page: number;
  limit: number;
  query: string;
  searchTime: number;
}