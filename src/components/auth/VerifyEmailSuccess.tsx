'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

type Status = 'checking' | 'signing-in' | 'no-tokens' | 'failed';

// The verify-email link redirects here with accessToken/refreshToken in the URL
// fragment (after #, never sent to any server) rather than a cookie - a cookie set by
// the API's own domain never reaches techarenaug.com, so this is the actual fix. Read
// once on mount, adopt the tokens the same way a normal login would, then strip them
// off the URL immediately so they don't linger in the address bar or browser history.
export function VerifyEmailSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    if (!accessToken || !refreshToken) {
      setStatus('no-tokens');
      return;
    }

    setStatus('signing-in');
    signIn('credentials', { accessToken, refreshToken, redirect: false })
      .then(async (result) => {
        if (!result?.ok) {
          setStatus('failed');
          return;
        }
        const session = await getSession();
        const role = (session?.user as any)?.role;
        if (role === 'vendor') router.push('/vendor/dashboard');
        else if (role === 'admin' || role === 'super_admin') router.push('/admin/dashboard');
        else router.push('/');
      })
      .catch(() => setStatus('failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'checking' || status === 'signing-in') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-4">
          <Icons.spinner className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Signing you in...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="py-12 text-center space-y-4">
        <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
        <div>
          <h2 className="text-lg font-semibold">Email verified</h2>
          <p className="text-muted-foreground mt-1">
            {status === 'failed'
              ? "Your email is verified, but we couldn't sign you in automatically. Please sign in manually."
              : 'Your email address has been verified. You can now sign in to your account.'}
          </p>
        </div>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
