// Real category calls against the live TechArena backend.
import { apiClient } from './client';
import { normalizeCategory } from './normalize';
import { productsAPI } from './products-api';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export const categoriesAPI = {
  async getCategories(params?: { isFeatured?: boolean; page?: number; limit?: number }) {
    const page = params?.page || 1;
    const limit = params?.limit || 100;

    const [raw, { products: allProducts }] = await Promise.all([
      apiClient.get<RawPage<any>>('/categories', { params: { page, limit, isFeatured: params?.isFeatured } }),
      productsAPI.getProducts({ limit: 100 }),
    ]);
    const categories = raw.items.map(normalizeCategory).map((category) => ({
      ...category,
      products: allProducts.filter((p) => p.categoryId === category.id),
    }));

    return {
      categories,
      totalCount: raw.pagination.total,
      currentPage: raw.pagination.page,
      totalPages: raw.pagination.totalPages,
      hasNextPage: raw.pagination.hasNextPage,
      hasPreviousPage: raw.pagination.hasPrevPage,
    };
  },

  async getCategory(slug: string) {
    const raw = await apiClient.get<any>(`/categories/slug/${slug}`);
    const category = normalizeCategory(raw);
    const { products } = await productsAPI.getProducts({ categoryId: category.id, limit: 100 });
    return { ...category, products };
  },

  async getFeaturedCategories() {
    // /categories/featured doesn't return a product count, so fetch the (small) full
    // product list once and attach each category's matching products client-side.
    const [raw, { products: allProducts }] = await Promise.all([
      apiClient.get<any[]>('/categories/featured'),
      productsAPI.getProducts({ limit: 100 }),
    ]);
    return raw.map(normalizeCategory).map((category) => ({
      ...category,
      products: allProducts.filter((p) => p.categoryId === category.id),
    }));
  },
};

export default categoriesAPI;
