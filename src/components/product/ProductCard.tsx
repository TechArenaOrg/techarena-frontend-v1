'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, Heart, Eye, ShoppingCart, Zap } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { ApiError } from '@/services/api/client';
import { setPendingCartAction } from '@/lib/pending-cart-action';

interface ProductCardProps {
  product: Product;
  className?: string;
  layout?: 'grid' | 'list';
}

export function ProductCard({ product, className, layout = 'grid' }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  // CSS :hover (including group-hover) makes WebKit/Chrome treat the first tap on a
  // touchscreen as "settling" the hover state, requiring a second tap to actually
  // follow the link - regardless of whether the underlying :hover rule is itself
  // gated behind an @media(hover:hover) query. Driving the same visual effects off
  // real React state (only ever set by mouse events, never touch) sidesteps that
  // browser heuristic entirely.
  const [isHovered, setIsHovered] = useState(false);
  const cycleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const { addItem: addToCart, isAuthenticated } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const images = product.images ?? [];

  useEffect(() => {
    return () => {
      if (cycleIntervalRef.current) clearInterval(cycleIntervalRef.current);
    };
  }, []);

  // Touch interactions fire a synthetic mouseenter/mouseleave for compatibility with
  // mouse-only sites, which would otherwise trigger these hover effects from a tap.
  // Pointer events expose the real input source, so checking pointerType filters those
  // synthetic firings out - isHovered (and this image-cycle effect) stays mouse-only.
  const handleImageHoverStart = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (images.length < 2 || cycleIntervalRef.current) return;
    // Switch to the next image right away instead of waiting out setInterval's first
    // tick - otherwise hovering feels unresponsive for the first ~second.
    setImageIndex((prev) => (prev + 1) % images.length);
    cycleIntervalRef.current = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, 800);
  };

  const handleImageHoverEnd = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    if (cycleIntervalRef.current) {
      clearInterval(cycleIntervalRef.current);
      cycleIntervalRef.current = null;
    }
    setImageIndex(0);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stockQuantity === 0) return;

    if (!isAuthenticated) {
      setPendingCartAction(product.id, 1);
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    setIsLoading(true);
    try {
      await addToCart({ productId: product.id, quantity: 1 });
      toast({
        title: "Added to cart! 🛒",
        description: `${product.name} added to your cart.`,
      });
      router.push('/cart');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to add product to cart.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist ❤️",
      description: isWishlisted ?
        `${product.name} removed from your wishlist.` :
        `${product.name} added to your wishlist.`,
    });
  };

  if (layout === 'list') {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${
          isHovered ? 'shadow-lg border-blue-200 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'
        } ${className ?? ''}`}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setIsHovered(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setIsHovered(false)}
      >
        <Link href={`/product/${product.slug}`} className="flex flex-col sm:flex-row">
          <div
            className="relative w-full sm:w-48 aspect-square sm:aspect-auto shrink-0 overflow-hidden bg-gray-50 dark:bg-gray-700"
            onPointerEnter={handleImageHoverStart}
            onPointerLeave={handleImageHoverEnd}
          >
            <Image
              src={images[imageIndex]?.url || '/placeholder.svg'}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}
              sizes="(min-width: 640px) 192px, 100vw"
            />
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
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${i === imageIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
                {product.vendor?.businessName || 'TechArena'}
              </p>
              <h3
                className={`font-semibold mb-1 line-clamp-1 transition-colors ${
                  isHovered ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                }`}
              >
                {product.name}
              </h3>
              {product.shortDescription && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {product.shortDescription}
                </p>
              )}
              {product.averageRating && (
                <div className="flex items-center gap-1 mb-2">
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
                  <span className="text-sm text-gray-600 dark:text-gray-400">({product.reviewCount || 0})</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  UGX {product.price.toLocaleString()}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    UGX {product.comparePrice.toLocaleString()}
                  </span>
                )}
                {product.stockQuantity === 0 ? (
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Out of Stock</span>
                ) : product.stockQuantity <= product.lowStockThreshold ? (
                  <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">{product.stockQuantity} left</span>
                ) : (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">In Stock</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className={isWishlisted ? '!text-red-500 !border-red-500' : ''}
                  onClick={handleWishlist}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={product.stockQuantity === 0 || isLoading}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isLoading ? 'Adding...' : product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                {product.stockQuantity > 0 && (
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isLoading}
                    onClick={handleAddToCart}
                  >
                    Buy Now
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="h-full"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setIsHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="block h-full">
        <div
          className={`flex h-full flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden transition-all duration-300 ${
            isHovered ? 'shadow-xl border-blue-200 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          {/* Product Image */}
          <div
            className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700"
            onPointerEnter={handleImageHoverStart}
            onPointerLeave={handleImageHoverEnd}
          >
            <Image
              src={images[imageIndex]?.url || '/placeholder.svg'}
              alt={product.name}
              fill
              className={`object-cover transition-transform duration-300 ${isHovered ? 'scale-105' : ''}`}
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
            />
            {/* Badges - a horizontal, wrapping row takes far less of the image's height
                than stacking them, since there can be up to 3 of these at once. On
                phone the wishlist heart shares this same row (smaller, right-aligned)
                instead of its own top-right slot - there's no hover to reveal it there
                the way desktop does. */}
            <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1">
              <div className="flex flex-wrap gap-1">
                {product.isFeatured && (
                  <Badge className="bg-orange-500 text-white border-0 px-1.5 py-0 text-[10px]">
                    <Zap className="w-2.5 h-2.5 mr-0.5" />
                    Featured
                  </Badge>
                )}
                {product.comparePrice && product.comparePrice > product.price && (
                  <Badge className="bg-red-500 text-white border-0 px-1.5 py-0.5 text-xs font-bold">
                    -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                  </Badge>
                )}
                {product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0 && (
                  <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                    Low Stock
                  </Badge>
                )}
                {product.stockQuantity === 0 && (
                  <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                    Out of Stock
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="secondary"
                className={`lg:hidden shrink-0 w-6 h-6 rounded-full p-0 bg-white/90 hover:bg-white shadow-md text-gray-700 ${
                  isWishlisted ? '!text-red-500' : ''
                }`}
                onClick={handleWishlist}
              >
                <Heart className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Quick Action Buttons - always visible on phone/tablet (no hover to reveal
                them with); hidden until hovered on desktop, where there's room to spare. */}
            <div
              className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 opacity-100 ${
                isHovered ? 'lg:opacity-100' : 'lg:opacity-0'
              }`}
            >
              <Button
                size="sm"
                variant="secondary"
                className={`hidden lg:flex w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-md text-gray-700 hover:text-gray-900 ${
                  isWishlisted ? '!text-red-500' : ''
                }`}
                onClick={handleWishlist}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
              {/* Doesn't do anything a card tap doesn't already do (no click handler,
                  no quick-view preview behind it) - kept for desktop only, where it at
                  least visually implies "look closer" before hovering elsewhere. */}
              <Button
                size="sm"
                variant="secondary"
                className="hidden lg:flex w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-md text-gray-700 hover:text-gray-900"
                asChild
              >
                <div>
                  <Eye className="w-4 h-4" />
                </div>
              </Button>
            </div>

            {/* Buy Now - same phone-always-visible, desktop-hover-only split. There was
                previously a separate "Add to Cart" cart-icon button here too, but it
                called the exact same handler as Buy Now - a redundant second button
                doing the same thing, and one less element covering the image. */}
            <div
              className={`absolute bottom-0 left-2 right-2 lg:bottom-2 transform transition-all duration-300 opacity-100 translate-y-0 ${
                isHovered ? 'lg:opacity-100 lg:translate-y-0' : 'lg:opacity-0 lg:translate-y-2'
              }`}
            >
              <Button
                size="sm"
                className="w-full h-6 text-xs lg:h-8 bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-60"
                disabled={product.stockQuantity === 0 || isLoading}
                onClick={handleAddToCart}
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : product.stockQuantity === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                    Buy Now
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 flex flex-1 flex-col">
            {/* Brand */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              {product.vendor?.businessName || 'TechArena'}
            </p>
            
            {/* Product Name */}
            <h3
              className={`font-semibold mb-2 line-clamp-2 transition-colors ${
                isHovered ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
              }`}
            >
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
            <div className="flex flex-col items-start gap-1 lg:flex-row lg:items-center lg:justify-between mt-auto pt-2">
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
              <div className="text-left lg:text-right">
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