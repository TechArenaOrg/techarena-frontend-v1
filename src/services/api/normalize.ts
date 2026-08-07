// The backend now returns products/categories/vendors in the same camelCase shape as
// the frontend types, so this is just date-string -> Date conversion and null -> undefined
// cleanup, not field renaming.
import type { Category, Product, ProductImage, Vendor } from '@/types';

function toDate(value: unknown): Date | undefined {
  return typeof value === 'string' ? new Date(value) : undefined;
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function normalizeVendor(raw: any): Vendor {
  return {
    ...raw,
    // Nested vendor objects (e.g. inside a product) can have a null slug - fall back to
    // deriving one from the business name so vendor links still work.
    slug: raw.slug ?? slugify(raw.businessName ?? raw.id),
    approvedAt: toDate(raw.approvedAt),
    createdAt: toDate(raw.createdAt) ?? new Date(),
    updatedAt: toDate(raw.updatedAt) ?? new Date(),
  };
}

export function normalizeCategory(raw: any): Category {
  return {
    ...raw,
    icon: raw.icon ?? undefined,
    imageUrl: raw.imageUrl ?? undefined,
    createdAt: toDate(raw.createdAt) ?? new Date(),
    updatedAt: toDate(raw.updatedAt) ?? new Date(),
    children: Array.isArray(raw.children) ? raw.children.map(normalizeCategory) : undefined,
  };
}

function normalizeImage(raw: any): ProductImage {
  return {
    ...raw,
    createdAt: toDate(raw.createdAt) ?? new Date(),
  };
}

export function normalizeProduct(raw: any): Product {
  const images = Array.isArray(raw.images) ? raw.images.map(normalizeImage) : [];
  return {
    ...raw,
    dimensions:
      raw.dimensions && (raw.dimensions.length || raw.dimensions.width || raw.dimensions.height)
        ? raw.dimensions
        : undefined,
    publishedAt: toDate(raw.publishedAt),
    createdAt: toDate(raw.createdAt) ?? new Date(),
    updatedAt: toDate(raw.updatedAt) ?? new Date(),
    vendor: raw.vendor ? normalizeVendor(raw.vendor) : undefined,
    category: raw.category ? normalizeCategory(raw.category) : undefined,
    images,
    isInStock: (raw.stockQuantity ?? 0) > 0,
    primaryImage: images.find((img: ProductImage) => img.isPrimary) ?? images[0],
  };
}
