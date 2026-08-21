import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your order.',
};

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/checkout');
  }

  return (
    <main className="flex-1">
      <div className="container py-6 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Checkout</h1>
          <p className="text-muted-foreground">Enter your delivery details and choose how you'd like to pay.</p>
        </div>
        <CheckoutForm defaultEmail={session.user.email ?? undefined} />
      </div>
    </main>
  );
}
