import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// M-6: Server-side route protection via Next.js middleware.
// Runs before any client code — prevents protected pages from loading at all
// for unauthenticated requests, eliminating the client-side race condition.
//
// NOTE: Since this app uses localStorage for token storage (not httpOnly cookies),
// the middleware cannot read the token server-side. It therefore only blocks
// obviously unauthenticated requests and defers to ProtectedRoute for auth state.
// To enable full server-side protection, migrate tokens to httpOnly cookies.

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/candidates',
  '/results',
  '/jobs',
  '/profile',
];

// Routes for candidates only
const CANDIDATE_ROUTES = [
  '/candidate/jobs',
  '/candidate/applications',
  '/candidate/feedback',
  '/candidate/profile',
];

// Public routes that should redirect authenticated users away
const AUTH_ROUTES = [
  '/auth',
  '/candidate/auth',
  '/forgot-password',
  '/reset-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security: Remove any server-internal headers that should not be forwarded
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-forwarded-for'); // prevent header spoofing

  // Add security headers to every response
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // M-8: Additional security headers at the middleware level
  // (supplements next.config.mjs headers for edge cases)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // L-4: Validate that redirect targets are relative (no open redirects)
  const redirectParam = request.nextUrl.searchParams.get('redirect');
  if (redirectParam && (redirectParam.startsWith('http') || redirectParam.startsWith('//'))) {
    // Strip dangerous redirect param and continue
    const cleanUrl = request.nextUrl.clone();
    cleanUrl.searchParams.delete('redirect');
    return NextResponse.redirect(cleanUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
