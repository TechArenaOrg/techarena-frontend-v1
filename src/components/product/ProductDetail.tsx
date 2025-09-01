'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, Share2, ShoppingCart, Truck, Shield, RefreshCw, CheckCircle, Minus, Plus, Zap } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ProductDetailProps {
  product: Product & {
    relatedProducts?: Product[];
    reviews?: any[];
  };
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Added to cart! 🛒",
        description: `${quantity} × ${product.name} added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = async () => {
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
        description: "Failed to update wishlist. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied! 🔗",
        description: "Product link has been copied to your clipboard.",
      });
    }
  };

  const updateQuantity = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(product.stockQuantity, quantity + delta));
    setQuantity(newQuantity);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        {/* Main Image */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image
                src={product.images?.[selectedImage]?.url || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
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
          </div>
        </div>
        
        {/* Thumbnail Images */}
        {(product.images?.length || 0) > 1 && (
          <div className="flex gap-2">
            {product.images?.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                  selectedImage === index
                    ? 'border-blue-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Image
                  src={image.url}
                  alt={`${product.name} ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {product.vendor?.businessName || 'TechArena'}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleWishlist}
                className={isWishlisted ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Rating */}
          {product.averageRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.averageRating!)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {product.averageRating.toFixed(1)} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            UGX {product.price.toLocaleString()}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xl text-gray-500 line-through">
              UGX {product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {product.stockQuantity > product.lowStockThreshold ? (
            <>
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium">
                In Stock ({product.stockQuantity} available)
              </span>
            </>
          ) : product.stockQuantity > 0 ? (
            <>
              <RefreshCw className="w-5 h-5 text-orange-500" />
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                Low Stock ({product.stockQuantity} left)
              </span>
            </>
          ) : (
            <span className="text-red-600 dark:text-red-400 font-medium">
              Out of Stock
            </span>
          )}
        </div>

        {/* Description */}
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-400">
            {product.description}
          </p>
        </div>


        {/* Quantity and Add to Cart */}
        {product.stockQuantity > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
              <button
                onClick={() => updateQuantity(-1)}
                disabled={quantity <= 1}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => updateQuantity(1)}
                disabled={quantity >= product.stockQuantity}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <Button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </div>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </>
              )}
            </Button>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Truck className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">Free Delivery</p>
              <p className="text-xs text-gray-500">Orders over UGX 200,000</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium">Warranty</p>
              <p className="text-xs text-gray-500">1 Year Official</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm font-medium">30 Days Return</p>
              <p className="text-xs text-gray-500">Easy returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}