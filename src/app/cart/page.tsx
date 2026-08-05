import { Metadata } from 'next';
import { Suspense } from 'react';
import { CartItems } from '@/components/blocks/cart-items';
import { CartSummary } from '@/components/blocks/cart-summary';
import { PageHeaderSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your selected items and proceed to checkout.',
};

export default function CartPage() {
  return (
    <main className="flex-1">
        <div className="container py-6">
          <Suspense fallback={<PageHeaderSkeleton />}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Shopping Cart</h1>
              <p className="text-muted-foreground">
                Review your items and proceed to checkout when you're ready
              </p>
            </div>
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center space-x-4 py-4 animate-pulse">
                            <div className="h-16 w-16 bg-gray-200 rounded" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded" />
                              <div className="h-3 bg-gray-200 rounded w-3/4" />
                            </div>
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <CartItems />
              </Suspense>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icons.truck className="mr-2 h-5 w-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Free shipping on orders over UGX 500,000</span>
                        <Icons.check className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Icons.clock className="mr-2 h-4 w-4" />
                        Estimated delivery: 2-3 business days in Kampala
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Suspense
                fallback={
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded" />
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                          </div>
                          <div className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                          </div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded" />
                      </div>
                    </CardContent>
                  </Card>
                }
              >
                <CartSummary />
              </Suspense>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Icons.shield className="mr-2 h-5 w-5" />
                      Secure Shopping
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <Icons.lock className="mr-2 h-4 w-4 text-green-600" />
                        <span>SSL encrypted checkout</span>
                      </div>
                      <div className="flex items-center">
                        <Icons.creditCard className="mr-2 h-4 w-4 text-green-600" />
                        <span>Secure payment processing</span>
                      </div>
                      <div className="flex items-center">
                        <Icons.rotateCounterClockwise className="mr-2 h-4 w-4 text-green-600" />
                        <span>30-day return policy</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/products">
                <Icons.arrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
    </main>
  );
}