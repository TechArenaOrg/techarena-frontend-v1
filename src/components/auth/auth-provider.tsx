'use client';

import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { setAuthToken } from '@/services/api/client';
import { useToast } from '@/hooks/use-toast';

interface AuthProviderProps {
  children: React.ReactNode;
}

function TokenSync() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setAuthToken((session as any)?.accessToken ?? null);
  }, [session]);

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