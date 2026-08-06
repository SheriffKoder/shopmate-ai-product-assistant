/**
 * Root Locale Proxy
 *
 * Purpose: Redirects the bare root request to the default localized storefront.
 * Used in: Next.js proxy routing before app page rendering.
 * Used for: Keeps `/` as a stable entry point while public pages live under `/[locale]`.
 */

import { NextResponse, type NextRequest } from 'next/server';

/**
 * Redirects only the bare root path to the English storefront.
 *
 * @param request - Incoming root request matched by the proxy config.
 * @returns A redirect response to `/en`.
 */
export function proxy(request: NextRequest) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = '/en';
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: '/',
};
