/**
 * Root Locale Fallback
 *
 * Purpose: Redirects bare root visits to the default localized storefront.
 * Used in: Next.js routing at /
 * Used for: Keeps direct route rendering aligned with the proxy locale redirect.
 */

import { redirect } from 'next/navigation';

/**
 * Redirects to the default English storefront when proxy is not involved.
 */
export default function RootPage() {
  redirect('/en');
}
