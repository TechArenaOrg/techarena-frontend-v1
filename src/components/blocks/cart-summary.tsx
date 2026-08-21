'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/ui/icons';
import { useCart } from '@/hooks/use-cart';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export function CartSummary() {
  const { items } = useCart();
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shipping = subtotal > 500000 ? 0 : 25000; // Free shipping over 500k UGX
  const discount = subtotal * (appliedDiscount / 100);
  const total = subtotal + shipping - discount;

  const handleApplyPromoCode = async () => {
    setIsApplyingPromo(true);
    
    // Mock promo code validation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const validPromoCodes = {
      'SAVE10': 10,
      'TECH20': 20,
      'FIRST15': 15,
    };
    
    const discountPercent = validPromoCodes[promoCode as keyof typeof validPromoCodes];
    
    if (discountPercent) {
      setAppliedDiscount(discountPercent);
      toast({
        title: 'Promo code applied!',
        description: `${discountPercent}% discount has been applied to your order.`,
      });
    } else {
      toast({
        title: 'Invalid promo code',
        description: 'The promo code you entered is not valid or has expired.',
        variant: 'destructive',
      });
    }
    
    setIsApplyingPromo(false);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({items.length} items)</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  formatCurrency(shipping)
                )}
              </span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount ({appliedDiscount}%)</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Label htmlFor="promoCode" className="text-sm font-medium">
            Promo Code
          </Label>
          <div className="flex space-x-2 mt-2">
            <Input
              id="promoCode"
              placeholder="Enter code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              disabled={isApplyingPromo}
            />
            <Button 
              variant="outline" 
              onClick={handleApplyPromoCode}
              disabled={!promoCode || isApplyingPromo}
            >
              {isApplyingPromo ? (
                <Icons.spinner className="h-4 w-4 animate-spin" />
              ) : (
                'Apply'
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Try: SAVE10, TECH20, or FIRST15
          </p>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" asChild>
        <Link href="/checkout">
          <Icons.lock className="mr-2 h-4 w-4" />
          Proceed to Checkout
        </Link>
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By proceeding to checkout, you agree to our{' '}
          <Link href="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}