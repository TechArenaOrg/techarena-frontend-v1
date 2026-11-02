'use client';

import { signOut } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

// Shown instead of crashing when a role-gated page's data fetch 403s because the
// session's cached role is stale (e.g. a vendor application was approved, or a role
// was changed by an admin, after this browser session was already signed in). A full
// sign-in pulls the current role fresh, which is the only way to clear this - there's
// no client-side fix, just a clear path forward instead of the generic error boundary.
export function SessionRefreshNotice() {
  return (
    <main className="flex-1 p-6">
      <div className="container max-w-lg">
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Icons.alertTriangle className="w-8 h-8 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold">Your account access has changed</h2>
              <p className="text-muted-foreground mt-1">
                Please sign out and sign back in to refresh your session and continue.
              </p>
            </div>
            <Button onClick={() => signOut({ callbackUrl: '/auth/login' })}>Sign Out</Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
