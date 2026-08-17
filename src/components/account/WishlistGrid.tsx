'use client';

import Link from 'next/link';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { ApiError } from '@/services/api/client';

export function WishlistGrid() {
  const { toast } = useToast();
  const { items: wishlistItems, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();

  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
    toast({
      title: "Removed from wishlist",
      description: "Product has been removed from your wishlist.",
    });
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    try {
      await addToCart({ productId, quantity: 1 });
      toast({
        title: "Added to cart! 🛒",
        description: `${productName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof ApiError ? error.message : "Failed to add product to cart.",
        variant: "destructive"
      });
    }
  };

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
      {wishlistItems.map((product) => (
        <Card key={product.id} className="group overflow-hidden">
          <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Link href={`/product/${product.slug}`}>
              <img
                src={product.images?.[0]?.url || '/placeholder.jpg'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>

            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 w-8 h-8 rounded-full p-0 bg-white/90 hover:bg-white shadow-md text-gray-700 hover:text-gray-900"
              onClick={() => handleRemoveFromWishlist(product.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <CardContent className="p-4">
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {product.name}
              </h3>
            </Link>

            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  UGX {product.price.toLocaleString()}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    UGX {product.comparePrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {product.averageRating && (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.averageRating!)
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
                  ({product.reviewCount || 0})
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={product.stockQuantity === 0}
                onClick={() => handleAddToCart(product.id, product.name)}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
