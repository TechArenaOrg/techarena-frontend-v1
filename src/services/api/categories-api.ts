// Real category calls against the live TechArena backend.
import { apiClient } from './client';
import { normalizeCategory } from './normalize';
import { productsAPI } from './products-api';

interface RawPage<T> {
  items: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean };
}

export const categoriesAPI = {
  async getCategories() {
    const [raw, { products: allProducts }] = await Promise.all([
      apiClient.get<RawPage<any>>('/categories', { params: { page: 1, limit: 100 } }),
      productsAPI.getProducts({ limit: 100 }),
    ]);
    return raw.items.map(normalizeCategory).map((category) => ({
      ...category,
      products: allProducts.filter((p) => p.categoryId === category.id),
    }));
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
