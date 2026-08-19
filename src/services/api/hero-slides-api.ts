// Real hero carousel slides from the backend's hero-slides CRUD. Already camelCase,
// no per-field normalization needed - see backend_integration notes.
import { apiClient } from './client';

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  sortOrder: number;
}

export const heroSlidesAPI = {
  async getActiveSlides(): Promise<HeroSlide[]> {
    const raw = await apiClient.get<HeroSlide[]>('/hero-slides');
    return raw.filter((slide) => slide.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
  },
};

export default heroSlidesAPI;
