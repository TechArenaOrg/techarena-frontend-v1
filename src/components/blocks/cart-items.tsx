'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils';

export function CartItems() {
  const { items, updateItem, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(itemId);
    try {
      await updateItem(itemId, newQuantity);
      toast({
        title: 'Cart updated',
        description: 'Item quantity has been updated.',
      });
    } catch {
      toast({
        title: 'Update failed',
        description: 'Could not update item quantity. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string, productName: string) => {
    try {
      await removeItem(itemId);
      toast({
        title: 'Item removed',
        description: `${productName} has been removed from your cart.`,
      });
    } catch {
      toast({
        title: 'Remove failed',
        description: 'Could not remove item from cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      });
    } catch {
      toast({
        title: 'Clear failed',
        description: 'Could not clear cart. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Icons.shoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-center mb-4">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild>
            <Link href="/products">
              Start Shopping
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Cart Items ({items.length})
          </h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleClearCart}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            Clear All
          </Button>
        </div>

        <div className="space-y-6">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center space-x-4 py-4 border-b last:border-b-0"
            >
              <div className="relative h-16 w-16 rounded-md overflow-hidden">
                <Image
                  src={item.product?.images?.[0]?.url || '/placeholder.svg'}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <Link 
                  href={`/product/${item.product.slug}`}
                  className="text-sm font-medium hover:text-primary line-clamp-2"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {item.product.vendor?.businessName}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium">
                    {formatCurrency(item.product.price)}
                  </span>
                  {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(item.product.comparePrice)}
                    </span>
                  )}
                  {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                    <Badge variant="destructive" className="text-xs">
                      Sale
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || isUpdating === item.id}
                >
                  <Icons.minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="99"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = parseInt(e.target.value);
                    if (!isNaN(newQuantity) && newQuantity > 0) {
                      handleQuantityChange(item.id, newQuantity);
                    }
                  }}
                  className="h-8 w-16 text-center"
                  disabled={isUpdating === item.id}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  disabled={isUpdating === item.id}
                >
                  <Icons.plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="text-right min-w-0">
                <p className="text-sm font-medium">
                  {formatCurrency(item.product.price * item.quantity)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id, item.product.name)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                >
                  <Icons.trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}