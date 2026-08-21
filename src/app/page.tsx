import { Suspense } from 'react';
import { Metadata } from 'next';
import { HeroSection } from '@/components/blocks/hero-section';
import { FeaturedCategories } from '@/components/blocks/featured-categories';
import { FeaturedProducts } from '@/components/blocks/featured-products';
import { NewsletterSection } from '@/components/blocks/newsletter-section';
import { TestimonialSection } from '@/components/blocks/testimonial-section';
import { ProductCardSkeleton, CategoryCardSkeleton } from '@/components/ui/skeletons';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { heroSlidesAPI } from '@/services/api/hero-slides-api';

export const metadata: Metadata = {
  title: 'TechArena Uganda - Premier Technology Marketplace',
  description: 'Discover the best technology products in Uganda. From laptops and smartphones to electronics and accessories, find everything you need at competitive prices.',
  keywords: 'technology, electronics, laptops, smartphones, Uganda, online shopping, computers, TechArena',
};

interface HomePageProps {
  searchParams: Promise<{ categoriesPage?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const categoriesPage = resolvedSearchParams.categoriesPage ? Number(resolvedSearchParams.categoriesPage) : 1;
  const slides = await heroSlidesAPI.getActiveSlides().catch(() => []);

  return (
    <>
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection slides={slides} />

        {/* Featured Categories */}
        <section className="py-3 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-2">
              <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                Shop by Category
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
                Explore our wide range of technology categories to find exactly what you need
              </p>
            </div>

            <Suspense fallback={<CategoriesSkeleton />}>
              <FeaturedCategories page={categoriesPage} />
            </Suspense>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-3">
          <div className="container mx-auto px-4">
            <div className="text-center mb-2">
              <h2 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                Featured Products
              </h2>
              <p className="text-xs text-muted-foreground max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
                Discover our handpicked selection of the latest and most popular tech products
              </p>
            </div>

            <Suspense fallback={<ProductGridSkeleton />}>
              <FeaturedProducts />
            </Suspense>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                  What Our Customers Say
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
                  Read what our satisfied customers have to say about their shopping experience
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <TestimonialSection />
            </ScrollReveal>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-blue-600 dark:bg-blue-800 text-white">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <NewsletterSection />
            </ScrollReveal>
          </div>
        </section>
      </main>
    </>
  );
}

// Skeleton components for loading states
function CategoriesSkeleton() {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <CategoryCardSkeleton key={i} className="h-9 w-28 rounded-full" />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

