'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye, Zap } from 'lucide-react';
import { Product } from '@/types';
import { mockAPI } from '@/services/api/mock-endpoints';
import { ProductCardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await mockAPI.products.getFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={item}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="group"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-300">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
              <img
                src={product.images?.[0]?.url || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-2">
                {product.isFeatured && (
                  <Badge className="bg-orange-500 text-white border-0">
                    <Zap className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {product.comparePrice && product.comparePrice > product.price && (
                  <Badge className="bg-red-500 text-white border-0">
                    -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                  </Badge>
                )}
                {product.stockQuantity <= product.lowStockThreshold && (
                  <Badge variant="destructive">
                    Low Stock
                  </Badge>
                )}
              </div>

              {/* Quick Action Buttons */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-md"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-md"
                  asChild
                >
                  <Link href={`/product/${product.slug}`}>
                    <Eye className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              {/* Quick Add to Cart */}
              <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={product.stockQuantity === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              {/* Vendor */}
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {product.vendor?.businessName || 'TechArena'}
              </p>
              
              {/* Product Name */}
              <Link 
                href={`/product/${product.slug}`}
                className="block group/link"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                  {product.name}
                </h3>
              </Link>
              
              {/* Rating */}
              {product.averageRating && (
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.averageRating!)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({product.reviewCount || 0})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    UGX {product.price.toLocaleString()}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      UGX {product.comparePrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                {/* Stock Status */}
                <div className="text-right">
                  {product.stockQuantity > product.lowStockThreshold ? (
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      In Stock
                    </span>
                  ) : product.stockQuantity > 0 ? (
                    <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}