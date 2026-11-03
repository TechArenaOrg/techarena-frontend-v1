'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeaturedCategoriesGrid({ categories }: { categories: Category[] }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      // Horizontal scroll on narrow screens (more categories than fit in one row),
      // wrapping and centered once there's enough width - no heading/subtitle above
      // this anymore, so the icon row itself is the whole section.
      className="flex flex-nowrap overflow-x-auto sm:flex-wrap sm:overflow-visible sm:justify-center gap-x-5 gap-y-3 px-1 pb-1 -mx-1 sm:mx-0 scrollbar-hide"
    >
      {categories.map((category) => (
        <motion.div key={category.id} variants={item} className="shrink-0">
          <Link
            href={`/category/${category.slug}`}
            className="group flex w-16 sm:w-20 flex-col items-center gap-1.5"
          >
            <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gray-100 text-2xl shadow-sm transition-all duration-200 group-hover:scale-105 group-hover:bg-blue-50 dark:bg-gray-800 dark:group-hover:bg-blue-900/20 sm:text-3xl">
              {category.icon}
            </span>
            <span className="line-clamp-1 text-center text-xs font-medium text-gray-700 transition-colors group-hover:text-blue-600 dark:text-gray-300 dark:group-hover:text-blue-400 sm:text-sm">
              {category.name}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
