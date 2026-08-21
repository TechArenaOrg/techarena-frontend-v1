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
      className="flex flex-wrap justify-center gap-2"
    >
      {categories.map((category) => (
        <motion.div
          key={category.id}
          variants={item}
          whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 300 } }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/category/${category.slug}`}
            className="group flex items-center gap-1.5 bg-white dark:bg-gray-800 rounded-full pl-1.5 pr-3 py-1 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200"
          >
            <span className="w-7 h-7 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-sm">
              {category.icon}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {category.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {category.products?.length || 0}
            </span>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
