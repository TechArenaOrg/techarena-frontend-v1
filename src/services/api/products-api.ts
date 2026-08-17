// Real product calls against the live TechArena backend. minPrice/maxPrice/sortBy/minRating
// are applied server-side (on the full result set, before pagination) - vendorId is accepted
// by the backend but currently a no-op there (flagged, not yet fixed).
import { apiClient } from './client';
import { normalizeProduct } from './normalize';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export interface ProductInput {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  shortDescription?: string;
  description?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  status?: 'draft' | 'active' | 'inactive' | 'out_of_stock';
  images?: { url: string; altText?: string; isPrimary: boolean; sortOrder: number }[];
  isFeatured?: boolean;
  vendorId?: string;
}

export const productsAPI = {
  async getProducts(
    params?: {
      categoryId?: string;
      vendorId?: string;
      search?: string;
      isFeatured?: boolean;
      lowStock?: boolean;
      minPrice?: number;
      maxPrice?: number;
      minRating?: number;
      // 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'rating' | 'popular' - loosely
      // typed since this is forwarded straight from URL search params; the backend 400s
      // on anything else.
      sortBy?: string;
      status?: 'draft' | 'active' | 'inactive' | 'out_of_stock';
      page?: number;
      limit?: number;
    },
    token?: string
  ) {
    const page = params?.page || 1;
    const limit = params?.limit || 12;

    const raw = await apiClient.get<RawPage<any>>('/products', {
      params: {
        page,
        limit,
        categoryId: params?.categoryId,
        vendorId: params?.vendorId,
        search: params?.search,
        isFeatured: params?.isFeatured,
        lowStock: params?.lowStock,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        minRating: params?.minRating,
        sortBy: params?.sortBy,
        status: params?.status,
      },
      token,
    });

    const products = raw.items.map(normalizeProduct);

    return {
      products,
      totalCount: raw.pagination.total,
      currentPage: raw.pagination.page,
      totalPages: raw.pagination.totalPages,
      hasNextPage: raw.pagination.hasNextPage,
      hasPreviousPage: raw.pagination.hasPrevPage,
    };
  },

  async getProduct(slug: string) {
    const raw = await apiClient.get<any>(`/products/slug/${slug}`);
    const product = normalizeProduct(raw);

    const relatedRaw = await apiClient.get<any[]>(`/products/${product.id}/related`);
    const relatedProducts = relatedRaw.map(normalizeProduct);

    return { ...product, relatedProducts, reviews: product.reviews ?? [] };
  },

  async getProductById(id: string, token?: string) {
    const raw = await apiClient.get<any>(`/products/${id}`, { token });
    return normalizeProduct(raw);
  },

  async getFeaturedProducts(limit = 8) {
    const raw = await apiClient.get<any[]>('/products/featured', { params: { limit } });
    return raw.map(normalizeProduct);
  },

  async searchProducts(query: string) {
    const raw = await apiClient.get<RawPage<any>>('/products', { params: { search: query, limit: 50 } });
    const products = raw.items.map(normalizeProduct);
    return { products, totalCount: raw.pagination.total, suggestions: [] as string[] };
  },

  async createProduct(input: ProductInput, token?: string) {
    const raw = await apiClient.post<any>('/products', input, { token });
    return normalizeProduct(raw);
  },

  async updateProduct(id: string, input: Partial<ProductInput>, token?: string) {
    const raw = await apiClient.put<any>(`/products/${id}`, input, { token });
    return normalizeProduct(raw);
  },

  async deleteProduct(id: string, token?: string) {
    await apiClient.delete<void>(`/products/${id}`, { token });
  },
};

export default productsAPI;
