/**
 * Checkout Confirmation Page
 * 
 * Purpose: Displays order confirmation after checkout
 * Used in: Next.js routing (/checkout)
 * Why: Provides a dedicated confirmation page for completed orders
 */

import { Suspense } from 'react';
import { CheckoutPageContent } from '@/views/checkout/checkout-page-content';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen p-4">Loading...</div>}>
      <CheckoutPageContent />
    </Suspense>
  );
}

