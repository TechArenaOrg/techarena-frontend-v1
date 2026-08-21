'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Truck, HeadphonesIcon, Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeroSlide } from '@/services/api/hero-slides-api';

const SLIDE_INTERVAL_MS = 4000;

const FEATURES = [
  { icon: Shield, label: 'Secure Shopping', color: 'text-green-400' },
  { icon: Truck, label: 'Fast Delivery', color: 'text-blue-400' },
  { icon: HeadphonesIcon, label: '24/7 Support', color: 'text-purple-400' },
  { icon: Star, label: 'Best Prices', color: 'text-yellow-400' },
];

export function HeroSection({ slides = [] }: { slides?: HeroSlide[] }) {
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

      <div className="relative container mx-auto px-4 py-2 space-y-2">
        <div className="max-w-3xl space-y-1">
          <AnimatePresence mode="wait">
            <motion.h1
              key={activeSlide?.id ?? 'default-title'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-lg lg:text-2xl font-bold leading-tight truncate"
            >
              {activeSlide ? activeSlide.title : "Uganda's Premier Technology Marketplace"}
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={activeSlide ? `${activeSlide.id}-subtitle` : 'default-subtitle'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="text-xs lg:text-sm text-blue-100 truncate"
            >
              {activeSlide
                ? activeSlide.subtitle
                : 'Discover cutting-edge laptops, smartphones, gaming gear, and electronics at unbeatable prices.'}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center gap-2 pt-0.5">
            <Button
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 group"
              asChild
            >
              <Link href={activeSlide?.ctaLink ?? '/products'}>
                {activeSlide?.ctaText ?? 'Shop Now'}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
              asChild
            >
              <Link href="/categories">Browse Categories</Link>
            </Button>

            {slides.length > 1 && (
              <div className="flex items-center gap-2 pl-2">
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
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 max-w-3xl">
          {FEATURES.map(({ icon: Icon, label, color }) => (
            <motion.div
              key={label}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20"
            >
              <Icon className={`w-4 h-4 shrink-0 ${color}`} />
              <h3 className="font-semibold text-xs">{label}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
