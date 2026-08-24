'use client';

import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setAuthToken, ApiError } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { takePendingCartAction } from '@/lib/pending-cart-action';

interface AuthProviderProps {
  children: React.ReactNode;
}

function TokenSync() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem: addToCart } = useCart();

  useEffect(() => {
    setAuthToken((session as any)?.accessToken ?? null);
  }, [session]);

  useEffect(() => {
    if (status !== 'authenticated' || !(session as any)?.accessToken) return;

    // Someone clicked Add to Cart / Buy Now while logged out, got sent to sign in,
    // and is now back with a session - finish what they started instead of making
    // them find and re-add the product themselves.
    const pending = takePendingCartAction();
    if (!pending) return;

    addToCart({ productId: pending.productId, quantity: pending.quantity })
      .then(() => {
        toast({ title: 'Added to cart! 🛒', description: 'Picked up where you left off before signing in.' });
        router.push('/cart');
      })
      .catch((error) => {
        toast({
          title: 'Could not add item to cart',
          description: error instanceof ApiError ? error.message : 'Please add it again from the product page.',
          variant: 'destructive',
        });
      });
  }, [status, session, addToCart, router, toast]);

  useEffect(() => {
    const error = (session as any)?.error;
    if (!error) return;

    // Both the access and refresh tokens have expired (>7 days since login) - nothing
    // left to silently renew. Sign out cleanly instead of letting every backend call
    // crash with an unhandled 401.
    if (error === 'RefreshTokenExpired') {
      toast({
        title: 'Session expired',
        description: 'Please sign in again to continue.',
        variant: 'warning',
      });
      signOut({ redirect: false }).then(() => router.push('/auth/login'));
      return;
    }

    // Google confirmed the user's identity, but exchanging it for this backend's own
    // token failed - the session exists but has no usable accessToken, so every API
    // call would otherwise fail silently. Sign out and send them back with a reason.
    if (error === 'GoogleSignInFailed') {
      toast({
        title: 'Google sign-in failed',
        description: 'Could not complete sign-in with Google. Please try again.',
        variant: 'destructive',
      });
      signOut({ redirect: false }).then(() => router.push('/auth/login'));
    }
  }, [session, router, toast]);

  return null;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <TokenSync />
      {children}
    </SessionProvider>
  );
}