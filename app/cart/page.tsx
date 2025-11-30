/**
 * Cart Page
 * 
 * Purpose: Displays the shopping cart with all items
 * Used in: Next.js routing (/cart)
 * Why: Provides a dedicated page for viewing and managing cart items
 */

import { Suspense } from 'react';
import { CartPageContent } from '@/features/cart/cart-page-content';

export default function CartPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen p-4">Loading cart...</div>}>
      <CartPageContent />
    </Suspense>
  );
}

