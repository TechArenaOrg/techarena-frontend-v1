import { z } from 'zod';

// Base schemas
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^(\+256|0)?[7-9][0-9]{8}$/, 'Please enter a valid Uganda phone number')
  .optional();

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must not exceed 50 characters')
  .regex(/^[a-zA-Z\s'.-]+$/, 'Name can only contain letters, spaces, apostrophes, periods, and hyphens');

// Authentication Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    firstName: nameSchema,
    lastName: nameSchema,
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Profile Schemas
export const profileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema,
  dateOfBirth: z.date().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Address Schemas
export const addressSchema = z.object({
  type: z.enum(['billing', 'shipping']),
  streetAddress: z.string().min(1, 'Street address is required').max(200, 'Street address is too long'),
  apartment: z.string().max(50, 'Apartment/unit is too long').optional(),
  city: z.string().min(1, 'City is required').max(100, 'City name is too long'),
  stateProvince: z.string().max(100, 'State/Province is too long').optional(),
  postalCode: z.string().max(20, 'Postal code is too long').optional(),
  country: z.string().length(2, 'Country code must be 2 characters'),
  isDefault: z.boolean().optional(),
});

// Product Schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255, 'Product name is too long'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  shortDescription: z.string().max(500, 'Short description is too long').optional(),
  description: z.string().max(5000, 'Description is too long').optional(),
  price: z.number().positive('Price must be greater than 0'),
  comparePrice: z.number().positive().optional(),
  trackInventory: z.boolean(),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  lowStockThreshold: z.number().int().min(1, 'Low stock threshold must be at least 1'),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  }).optional(),
  seoTitle: z.string().max(255, 'SEO title is too long').optional(),
  seoDescription: z.string().max(500, 'SEO description is too long').optional(),
});

export const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required').max(255, 'Variant name is too long'),
  price: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  attributes: z.record(z.string()).refine(
    obj => Object.keys(obj).length > 0,
    'At least one attribute is required'
  ),
});

// Cart Schemas
export const addToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Maximum quantity is 99'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(99, 'Maximum quantity is 99'),
});

// Order Schemas
export const createOrderSchema = z.object({
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  customerEmail: emailSchema.optional(),
  customerPhone: phoneSchema,
  notes: z.string().max(1000, 'Notes are too long').optional(),
  couponCode: z.string().max(50, 'Coupon code is too long').optional(),
});

// Review Schemas
export const reviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  orderItemId: z.string().uuid('Invalid order item ID').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: z.string().max(255, 'Review title is too long').optional(),
  content: z.string().max(2000, 'Review content is too long').optional(),
});

// Vendor Application Schema
export const vendorApplicationSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(255, 'Business name is too long'),
  businessType: z.enum(['sole_proprietorship', 'partnership', 'corporation', 'llc']).optional(),
  businessRegistrationNumber: z.string().max(100, 'Registration number is too long').optional(),
  taxNumber: z.string().max(100, 'Tax number is too long').optional(),
  description: z.string().max(2000, 'Description is too long').optional(),
  websiteUrl: z.string().url('Invalid website URL').optional(),
});

// Search Schemas
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(255, 'Search query is too long'),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  priceMin: z.number().min(0, 'Minimum price cannot be negative').optional(),
  priceMax: z.number().min(0, 'Maximum price cannot be negative').optional(),
  sortBy: z.enum(['relevance', 'price_asc', 'price_desc', 'name', 'created_at', 'rating']).optional(),
  page: z.number().int().min(1, 'Page must be at least 1').optional(),
  limit: z.number().int().min(1, 'Limit must be at least 1').max(50, 'Maximum limit is 50').optional(),
});

// Contact Form Schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  subject: z.string().min(1, 'Subject is required').max(255, 'Subject is too long'),
  message: z.string().min(1, 'Message is required').max(2000, 'Message is too long'),
});

// Newsletter Schema
export const newsletterSchema = z.object({
  email: emailSchema,
});

// Upload Schema
export const uploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'Please select a file'
  ).refine(
    (file) => file.size <= 5 * 1024 * 1024, // 5MB
    'File size must be less than 5MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type),
    'File must be an image (JPEG, PNG, WebP, or AVIF)'
  ),
});

// Coupon Schema
export const couponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(50, 'Coupon code is too long'),
});

// Filter Schemas
export const productFilterSchema = z.object({
  categoryId: z.string().uuid().optional(),
  vendorId: z.string().uuid().optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  inStock: z.boolean().optional(),
  featured: z.boolean().optional(),
  search: z.string().max(255).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(50).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductVariantFormData = z.infer<typeof productVariantSchema>;
export type AddToCartFormData = z.infer<typeof addToCartSchema>;
export type UpdateCartItemFormData = z.infer<typeof updateCartItemSchema>;
export type CreateOrderFormData = z.infer<typeof createOrderSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type VendorApplicationFormData = z.infer<typeof vendorApplicationSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type NewsletterFormData = z.infer<typeof newsletterSchema>;
export type UploadFormData = z.infer<typeof uploadSchema>;
export type CouponFormData = z.infer<typeof couponSchema>;
export type ProductFilterFormData = z.infer<typeof productFilterSchema>;