import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple middleware without NextAuth to avoid openid-client issues
export function middleware(request: NextRequest) {
  // For now, just allow all requests to pass through
  // Authentication will be handled at the page level
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};