'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { WishlistItem } from '@/types';
import { mockAPI } from '@/services/api/mock-endpoints';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function WishlistGrid() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = await mockAPI.wishlist.getWishlist();
        setWishlistItems(data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await mockAPI.wishlist.removeFromWishlist(productId);
      setWishlistItems(items => items.filter(item => item.productId !== productId));
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove product from wishlist.",
        variant: "destructive"
      });
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await mockAPI.cart.addToCart(productId);
      toast({
        title: "Added to cart! 🛒",
        description: `${productName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Your wishlist is empty
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start adding products you love to your wishlist!
        </p>
        <Button asChild>
          <Link href="/products">
            Browse Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wishlistItems.map((item) => (
        <Card key={item.id} className="group overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Link href={`/product/${item.product.slug}`}>
              <img
                src={item.product.images?.[0]?.url || '/placeholder.jpg'}
                alt={item.product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 w-8 h-8 rounded-full p-0 bg-white/90 hover:bg-white shadow-md"
              onClick={() => handleRemoveFromWishlist(item.productId)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <CardContent className="p-4">
            <Link href={`/product/${item.product.slug}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {item.product.name}
              </h3>
            </Link>
            
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  UGX {item.product.price.toLocaleString()}
                </span>
                {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    UGX {item.product.comparePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            
            {item.product.averageRating && (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(item.product.averageRating!)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({item.product.reviewCount || 0})
                </span>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={item.product.stockQuantity === 0}
                onClick={() => handleAddToCart(item.productId, item.product.name)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {item.product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Added {new Date(item.createdAt).toLocaleDateString('en-UG')}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}