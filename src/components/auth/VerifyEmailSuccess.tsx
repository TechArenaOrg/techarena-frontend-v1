'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, getSession } from 'next-auth/react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { authAPI } from '@/services/api/auth-api';

type Status = 'exchanging' | 'no-code' | 'failed';

// The verify-email link's redirect carries a single-use, 60-second-lived exchange
// code in the URL fragment (after #, never sent to any server) rather than raw tokens
// or a cookie - a cookie set by the API's own domain never reached techarenaug.com,
// and a bare token pair in the URL would be reusable if it ever leaked. Read the code
// once on mount, trade it for a real token pair, adopt that into a session the same
// way a normal login would, then strip the fragment off the URL immediately.
export function VerifyEmailSuccess() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('exchanging');
  // The backend 400s a second exchange of the same code ("Invalid or expired code"),
  // so this must fire exactly once - a ref survives React Strict Mode's intentional
  // double-invoke of effects in dev, which a plain variable would not.
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const code = params.get('code');

    if (hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    if (!code) {
      setStatus('no-code');
      return;
    }

    authAPI
      .exchangeCode(code)
      .then(({ accessToken, refreshToken }) => signIn('credentials', { accessToken, refreshToken, redirect: false }))
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

  if (status === 'exchanging') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-4">
          <Icons.spinner className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="text-muted-foreground">Signing you in...</p>
        </CardContent>
      </Card>
    );
  }

  if (status === 'failed') {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="py-12 text-center space-y-4">
          <Icons.alertTriangle className="w-10 h-10 mx-auto text-destructive" />
          <div>
            <h2 className="text-lg font-semibold">Link expired</h2>
            <p className="text-muted-foreground mt-1">
              This link has expired or was already used. Please request a new verification email.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/auth/verify-email-error">Request a new link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 'no-code': landed here directly with no exchange code (e.g. a bookmarked or
  // revisited link) - nothing to sign in with, just confirm verification succeeded.
  return (
    <Card className="w-full max-w-md">
      <CardContent className="py-12 text-center space-y-4">
        <CheckCircle2 className="w-10 h-10 mx-auto text-green-600" />
        <div>
          <h2 className="text-lg font-semibold">Email verified</h2>
          <p className="text-muted-foreground mt-1">Your email address has been verified. You can now sign in to your account.</p>
        </div>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
