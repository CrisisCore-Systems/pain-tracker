import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js Middleware — SPA fallback for the /app PWA route.
 *
 * Any request under /app/* that is NOT a static asset (JS, CSS, images, etc.)
 * gets rewritten to /app/index.html so the Vite SPA router can handle it.
 *
 * Static assets pass through unchanged so the browser fetches them directly
 * from packages/blog/public/app/.
 */

// File extensions that should be served as-is (static assets)
const ASSET_EXT =
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map|webp|avif|webmanifest|json|txt|xml)$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /app routes
  if (!pathname.startsWith('/app')) {
    return NextResponse.next();
  }

  // Let static assets pass through to public/app/
  if (ASSET_EXT.test(pathname)) {
    return NextResponse.next();
  }

  // Everything else → rewrite to the SPA shell
  const url = request.nextUrl.clone();
  url.pathname = '/app/index.html';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/app/:path*',
};
