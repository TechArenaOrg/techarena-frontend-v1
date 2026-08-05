'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { setAuthToken } from '@/services/api/client';

interface AuthProviderProps {
  children: React.ReactNode;
}

function TokenSync() {
  const { data: session } = useSession();

  useEffect(() => {
    setAuthToken((session as any)?.accessToken ?? null);
  }, [session]);

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