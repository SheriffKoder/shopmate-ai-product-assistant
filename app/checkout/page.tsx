/**
 * Checkout Redirect Page
 *
 * Purpose: Redirects the legacy checkout route during server-first page promotion.
 * Used in: Next.js routing (/checkout)
 * Used for: Keeps stale root checkout visits out of deleted client page views.
 */

import { redirect } from 'next/navigation';

export default function CheckoutPage() {
  redirect('/en');
}
