'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {categories.map((category) => (
        <motion.div
          key={category.id}
          variants={item}
          whileHover={{
            scale: 1.05,
            transition: { type: 'spring', stiffness: 300 },
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href={`/category/${category.slug}`}
            className="group block"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-200">
              {/* Category Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-800/40 dark:group-hover:to-indigo-800/40 transition-colors">
                <span className="text-2xl">{category.icon}</span>
              </div>

              {/* Category Name */}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {category.name}
              </h3>

              {/* Product Count */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {category.products?.length || 0} products
              </p>

              {/* Arrow Icon */}
              <div className="flex justify-center">
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
