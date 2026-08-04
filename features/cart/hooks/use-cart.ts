/** Stable cart facade for app consumers. */
'use client';

import { useEffect } from 'react';
import { useCartStore } from '../store/cart-store';

/** Preserves the existing cart return shape while hiding Zustand from consumers. */
export function useCart() {
  const hydrate = useCartStore((state) => state.hydrate);
  useEffect(() => hydrate(), [hydrate]);

  const cart = useCartStore((state) => state.cart);
  const dispatchCartAction = useCartStore((state) => state.dispatchCartAction);
  return {
    cart,
    dispatchCartAction,
    addItem: useCartStore((state) => state.addItem),
    removeItem: useCartStore((state) => state.removeItem),
    increaseQuantity: useCartStore((state) => state.increaseQuantity),
    decreaseQuantity: useCartStore((state) => state.decreaseQuantity),
    updateQuantity: useCartStore((state) => state.updateQuantity),
    clearCart: useCartStore((state) => state.clearCart),
    isHydrated: useCartStore((state) => state.isHydrated),
    isSyncing: useCartStore((state) => state.isSyncing),
    error: useCartStore((state) => state.error),
  };
}
