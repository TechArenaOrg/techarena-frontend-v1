'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Heart, Eye, ShoppingCart, Zap } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stockQuantity === 0) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      toast({
        title: "Added to cart! 🛒",
        description: `${product.name} added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsWishlisted(!isWishlisted);
      toast({
        title: isWishlisted ? "Removed from wishlist" : "Added to wishlist ❤️",
        description: isWishlisted ? 
          `${product.name} removed from your wishlist.` : 
          `${product.name} added to your wishlist.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group"
    >
      <Link href={`/product/${product.slug}`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-600 transition-all duration-300">
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
            <Image
              src={product.images?.[0]?.url || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
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
              {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
                <Badge variant="destructive">
                  Low Stock
                </Badge>
              )}
              {product.stockQuantity === 0 && (
                <Badge variant="destructive">
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                className={`w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-md ${
                  isWishlisted ? 'text-red-500' : ''
                }`}
                onClick={handleWishlist}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-md"
                asChild
              >
                <div>
                  <Eye className="w-4 h-4" />
                </div>
              </Button>
            </div>

            {/* Quick Add to Cart */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={product.stockQuantity === 0 || isLoading}
                onClick={handleAddToCart}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </div>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            {/* Brand */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {product.vendor?.businessName || 'TechArena'}
            </p>
            
            {/* Product Name */}
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
            
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
                    {product.stockQuantity} left
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
      </Link>
    </motion.div>
  );
}