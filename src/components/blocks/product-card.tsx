'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

import { Product } from '@/types';
import { formatCurrency, calculateDiscountPercentage, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  className?: string;
  showVendor?: boolean;
  showQuickActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'grid' | 'list';
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ 
    product, 
    className, 
    showVendor = false, 
    showQuickActions = true,
    size = 'md',
    layout = 'grid',
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    
    const { addItem, isLoading: isAddingToCart } = useCart();
    const { items: wishlistItems, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();
    const { toast } = useToast();
    
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    const discountPercentage = product.comparePrice ? 
      calculateDiscountPercentage(product.comparePrice, product.price) : 0;
    
    const handleAddToCart = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!product.isInStock) {
        toast({
          title: 'Out of Stock',
          description: 'This product is currently out of stock.',
          variant: 'destructive',
        });
        return;
      }
      
      try {
        await addItem({
          productId: product.id,
          quantity: 1,
        });
        
        toast({
          title: 'Added to Cart',
          description: `${product.name} has been added to your cart.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to add item to cart. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    const handleWishlistToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isInWishlist) {
        removeFromWishlist(product.id);
        toast({
          title: 'Removed from Wishlist',
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        addToWishlist(product);
        toast({
          title: 'Added to Wishlist',
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    };
    
    const sizeClasses = {
      sm: 'w-full max-w-xs',
      md: 'w-full max-w-sm',
      lg: 'w-full max-w-md',
    };
    
    const imageHeight = {
      sm: 'h-48',
      md: 'h-56',
      lg: 'h-64',
    };
    
    if (layout === 'list') {
      return (
        <Card 
          ref={ref}
          className={cn(
            'group overflow-hidden transition-all duration-300 hover:shadow-lg',
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          {...props}
        >
          <div className="flex">
            <div className="relative w-48 flex-shrink-0">
              <Link href={`/product/${product.slug}`}>
                <div className={cn('relative overflow-hidden bg-gray-100', imageHeight[size])}>
                  <Image
                    src={product.primaryImage?.url || '/placeholder-product.jpg'}
                    alt={product.primaryImage?.altText || product.name}
                    fill
                    sizes="(max-width: 768px) 192px, 192px"
                    className={cn(
                      'object-cover transition-all duration-500 group-hover:scale-105',
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => setImageLoaded(true)}
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                  )}
                </div>
              </Link>
              
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {discountPercentage > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    -{discountPercentage}%
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge variant="secondary" className="text-xs">
                    Featured
                  </Badge>
                )}
                {!product.isInStock && (
                  <Badge variant="outline" className="text-xs bg-white/90">
                    Out of Stock
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex flex-1 flex-col justify-between p-4">
              <div>
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                {product.shortDescription && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}
                
                {showVendor && product.vendor && (
                  <p className="text-xs text-muted-foreground mb-2">
                    by {product.vendor.businessName}
                  </p>
                )}
                
                {/* Rating */}
                {product.averageRating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-4 w-4',
                            i < Math.floor(product.averageRating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.reviewCount})
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl">
                    {formatCurrency(product.price)}
                  </span>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(product.comparePrice)}
                    </span>
                  )}
                </div>
                
                {showQuickActions && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={handleWishlistToggle}
                      className={cn(
                        'transition-colors',
                        isInWishlist && 'text-red-500 border-red-500'
                      )}
                    >
                      <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
                    </Button>
                    
                    <Button
                      onClick={handleAddToCart}
                      disabled={!product.isInStock}
                      loading={isAddingToCart}
                      size="sm"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {product.isInStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      );
    }
    
    return (
      <motion.div
        ref={ref}
        className={cn('group', sizeClasses[size], className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
          {/* Image Section */}
          <div className="relative">
            <Link href={`/product/${product.slug}`}>
              <div className={cn('relative overflow-hidden bg-gray-100', imageHeight[size])}>
                <Image
                  src={product.primaryImage?.url || '/placeholder-product.jpg'}
                  alt={product.primaryImage?.altText || product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    'object-cover transition-all duration-500 group-hover:scale-105',
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
              </div>
            </Link>
            
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {discountPercentage > 0 && (
                <Badge variant="destructive" className="text-xs">
                  -{discountPercentage}%
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="secondary" className="text-xs">
                  Featured
                </Badge>
              )}
              {!product.isInStock && (
                <Badge variant="outline" className="text-xs bg-white/90">
                  Out of Stock
                </Badge>
              )}
            </div>
            
            {/* Quick Actions */}
            {showQuickActions && (
              <motion.div 
                className="absolute top-2 right-2 flex flex-col gap-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="secondary"
                  size="icon-sm"
                  onClick={handleWishlistToggle}
                  className={cn(
                    'bg-white/90 backdrop-blur-sm transition-colors',
                    isInWishlist && 'text-red-500 border-red-500'
                  )}
                >
                  <Heart className={cn('h-4 w-4', isInWishlist && 'fill-current')} />
                </Button>
                
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="bg-white/90 backdrop-blur-sm"
                  asChild
                >
                  <Link href={`/product/${product.slug}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </div>
          
          {/* Content Section */}
          <CardContent className="p-4 flex-1 flex flex-col">
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-medium text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
            
            {showVendor && product.vendor && (
              <p className="text-xs text-muted-foreground mb-2">
                by {product.vendor.businessName}
              </p>
            )}
            
            {/* Rating */}
            {product.averageRating && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < Math.floor(product.averageRating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount})
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">
                  {formatCurrency(product.price)}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(product.comparePrice)}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
          
          {/* Footer Section */}
          <CardFooter className="p-4 pt-0">
            <Button
              onClick={handleAddToCart}
              disabled={!product.isInStock}
              loading={isAddingToCart}
              className="w-full"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }
);

ProductCard.displayName = 'ProductCard';

export { ProductCard };