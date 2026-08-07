'use client';

import { useWishlist } from '@/hooks/use-wishlist';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';

// Wishlist has no backend support (nothing in the SSCD or the live API) - it's
// localStorage-only, so this has to be a client component reading the real per-browser
// count rather than a server-fetched number.
export function WishlistStatCard() {
  const { itemCount } = useWishlist();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Wishlist Items</CardTitle>
        <Icons.heart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{itemCount}</div>
        <p className="text-xs text-muted-foreground">Saved on this device</p>
      </CardContent>
    </Card>
  );
}
