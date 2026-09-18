'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Next.js App Router has a confirmed bug where <Link> doesn't scroll to top on
// navigation when the destination route has a loading.tsx
// (https://github.com/vercel/next.js/issues/74485) - this app added many
// loading.tsx files, so it's not just one page. Renders nothing; just forces the
// scroll manually on every real route change instead of waiting on the framework
// to do it.
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
