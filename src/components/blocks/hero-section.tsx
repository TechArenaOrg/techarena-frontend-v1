'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight, Star, Shield, Truck, HeadphonesIcon } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeroSlide } from '@/services/api/hero-slides-api';

const SLIDE_INTERVAL_MS = 4000;

export function HeroSection({ slides = [] }: { slides?: HeroSlide[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const hasSlides = slides.length > 0;
  const activeSlide = hasSlides ? slides[activeIndex] : undefined;

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-950 text-white overflow-hidden">
      {/* Slide background */}
      {hasSlides && (
        <div className="absolute inset-0">
          <AnimatePresence mode="sync">
            <motion.div
              key={activeSlide!.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
            >
              <Image src={activeSlide!.imageUrl} alt={activeSlide!.title} fill priority className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/75 via-blue-700/70 to-indigo-800/75" />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {!hasSlides && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-white rounded-full mix-blend-overlay filter blur-xl animate-pulse delay-1000"></div>
        </div>
      )}

      <div className="relative container mx-auto px-4 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
              >
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium">Trusted by 10,000+ customers</span>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.h1
                  key={activeSlide?.id ?? 'default-title'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl lg:text-6xl font-bold leading-tight min-h-[2.5em] lg:min-h-[2.2em] line-clamp-2"
                >
                  {activeSlide ? (
                    activeSlide.title
                  ) : (
                    <>
                      Uganda's Premier{' '}
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Technology
                      </span>{' '}
                      Marketplace
                    </>
                  )}
                </motion.h1>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p
                  key={activeSlide ? `${activeSlide.id}-subtitle` : 'default-subtitle'}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, delay: 0.05 }}
                  className="text-xl lg:text-2xl text-blue-100 max-w-xl min-h-[3em] line-clamp-2"
                >
                  {activeSlide
                    ? activeSlide.subtitle
                    : 'Discover cutting-edge laptops, smartphones, gaming gear, and electronics at unbeatable prices. Fast delivery across Uganda.'}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Search Bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative max-w-md"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm border-0 rounded-xl text-gray-900 placeholder-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 rounded-lg px-6"
              >
                Search
              </Button>
            </motion.form>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 group"
                asChild
              >
                <Link href={activeSlide?.ctaLink ?? '/products'}>
                  {activeSlide?.ctaText ?? 'Shop Now'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link href="/categories">
                  Browse Categories
                </Link>
              </Button>
            </motion.div>

            {/* Slide Indicators */}
            {slides.length > 1 && (
              <div className="flex items-center gap-2 pt-2">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Show slide ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex ? 'w-8 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Content - Hero Image/Features */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            {/* Feature Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <Shield className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="font-semibold mb-2">Secure Shopping</h3>
                <p className="text-sm text-blue-100">Protected payments & buyer guarantee</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <Truck className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="font-semibold mb-2">Fast Delivery</h3>
                <p className="text-sm text-blue-100">Same-day delivery in Kampala</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <HeadphonesIcon className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="font-semibold mb-2">24/7 Support</h3>
                <p className="text-sm text-blue-100">Expert customer service</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
              >
                <Star className="w-8 h-8 text-yellow-400 mb-3" />
                <h3 className="font-semibold mb-2">Best Prices</h3>
                <p className="text-sm text-blue-100">Price match guarantee</p>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/20"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">10,000+</div>
            <div className="text-blue-100">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">500+</div>
            <div className="text-blue-100">Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">50+</div>
            <div className="text-blue-100">Top Brands</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400">24/7</div>
            <div className="text-blue-100">Support</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
