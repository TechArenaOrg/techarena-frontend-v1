'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Icons } from '@/components/ui/icons';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, cn } from '@/lib/utils';
import { ordersAPI, toE164Uganda } from '@/services/api/orders-api';
import { ApiError } from '@/services/api/client';
import type { PaymentMethod } from '@/types';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; description: string; icon: keyof typeof Icons }[] = [
  { value: 'mobile_money', label: 'Mobile Money', description: 'MTN or Airtel prompt to your phone', icon: 'shoppingCart' },
  { value: 'cash_on_delivery', label: 'Cash on Delivery', description: 'Pay when your order arrives', icon: 'truck' },
  { value: 'credit_card', label: 'Card', description: 'Visa or Mastercard', icon: 'creditCard' },
  { value: 'bank_transfer', label: 'Bank Transfer', description: "We'll email you the account details", icon: 'fileText' },
];

interface CheckoutFormProps {
  defaultEmail?: string;
}

export function CheckoutForm({ defaultEmail }: CheckoutFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { items, isLoading: isCartLoading } = useCart();

  const [streetAddress, setStreetAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [customerEmail, setCustomerEmail] = useState(defaultEmail ?? '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 500000 ? 0 : 25000;
  const total = subtotal + shipping;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Uganda-only marketplace - country is fixed rather than asked for.
      const address = {
        streetAddress,
        apartment: apartment || undefined,
        city,
        stateProvince: stateProvince || undefined,
        postalCode: postalCode || undefined,
        country: 'UG',
      };

      const phone = customerPhone ? toE164Uganda(customerPhone) : undefined;

      const order = await ordersAPI.createOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        shippingAddress: { ...address, type: 'shipping' },
        billingAddress: { ...address, type: 'billing' },
        customerEmail: customerEmail || undefined,
        customerPhone: phone,
        paymentMethod,
        notes: notes || undefined,
      });

      await ordersAPI.processPayment(order.id, { paymentMethod, phone });

      toast({ title: 'Order placed!', description: `Order ${order.orderNumber ?? ''} has been received.` });
      router.push(`/account/orders?justPlaced=${order.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        // The out-of-stock 409 names specific products via productName/requestedQuantity/
        // availableStock (not the {path,message} shape field-validation errors use) -
        // surface those specifics rather than the generic top-level message.
        const stockIssues = err.details?.filter((d) => typeof d.productName === 'string');
        if (stockIssues?.length) {
          setError(
            stockIssues
              .map((d) => `${d.productName}: only ${d.availableStock} left (requested ${d.requestedQuantity})`)
              .join('; ')
          );
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong placing your order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCartLoading && items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <p className="text-muted-foreground mb-4">Your cart is empty - add something before checking out.</p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden bg-muted">
                <Image src={item.product?.images?.[0]?.url || '/placeholder.svg'} alt={item.product.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="pt-3 border-t space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">Free</span> : formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-semibold pt-1">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="streetAddress">Street Address</Label>
            <Input id="streetAddress" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apartment">Apartment / Unit (optional)</Label>
            <Input id="apartment" value={apartment} onChange={(e) => setApartment(e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Kampala" required disabled={isSubmitting} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stateProvince">District / Region (optional)</Label>
              <Input id="stateProvince" value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code (optional)</Label>
            <Input id="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} disabled={isSubmitting} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email</Label>
            <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required disabled={isSubmitting} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="+256 7XX XXX XXX"
              required
              disabled={isSubmitting}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => {
            const Icon = Icons[method.icon];
            const isSelected = paymentMethod === method.value;
            return (
              <button
                key={method.value}
                type="button"
                disabled={isSubmitting}
                onClick={() => setPaymentMethod(method.value)}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                  isSelected ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'
                )}
              >
                <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                <div>
                  <p className="text-sm font-medium">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.description}</p>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="notes">Delivery Notes (optional)</Label>
        <Input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. call on arrival" disabled={isSubmitting} />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || items.length === 0}>
        {isSubmitting ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            Placing order...
          </>
        ) : (
          `Place Order · ${formatCurrency(total)}`
        )}
      </Button>
    </form>
  );
}
