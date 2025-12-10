/**
 * use-cart-api Hook (SWR-based)
 * 
 * Purpose: Fetch cart from API using SWR
 * Used in: ShopProvider (replaces useCart)
 * Why: Enables SWR usage and database-ready architecture
 * 
 * Development: Uses sessionStorage directly (client-side)
 * Production: Will use API routes with database
 */

'use client';

import useSWR from 'swr';
import { storage, STORAGE_KEYS, initStorage } from '@/lib/storage/session-storage';
import type { CartState } from '@/features/ai-assistant/types/cart';

/**
 * Initial empty cart state
 */
const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

/**
 * Fetcher function for SWR
 * 
 * Development: Reads from sessionStorage directly
 * Production: Will fetch from API route
 */
const fetcher = async (key: string): Promise<CartState> => {
  // For development: use sessionStorage directly
  if (typeof window !== 'undefined') {
    const cart = initStorage<CartState>(
      STORAGE_KEYS.CART,
      initialCartState
    );
    return cart;
  }

  // For server-side or production: fetch from API
  const response = await fetch('/api/cart');
  if (!response.ok) {
    throw new Error('Failed to fetch cart');
  }
  return response.json();
};

/**
 * Update cart function
 */
const updateCartData = async (newCart: CartState): Promise<CartState> => {
  // For development: update sessionStorage directly
  if (typeof window !== 'undefined') {
    storage.set(STORAGE_KEYS.CART, newCart);
    return newCart;
  }

  // For production: update via API
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newCart),
  });

  if (!response.ok) {
    throw new Error('Failed to update cart');
  }

  const result = await response.json();
  return result.cart;
};

/**
 * Hook for fetching cart with SWR
 * 
 * @returns Cart data, loading state, error, and update function
 */
export function useCartAPI() {
  const { data, error, isLoading, mutate } = useSWR<CartState>(
    'cart', // Cache key
    fetcher,
    {
      fallbackData: initialCartState, // Initial data
      revalidateOnFocus: false, // Don't refetch on window focus
      revalidateOnReconnect: false, // Don't refetch on reconnect
    }
  );

  /**
   * Update cart
   */
  const updateCart = async (newCart: CartState) => {
    // Optimistic update
    await mutate(updateCartData(newCart), {
      optimisticData: newCart,
      rollbackOnError: true,
    });
  };

  /**
   * Dispatch cart action (compatible with existing CartAction interface)
   */
  const dispatchCartAction = async (action: {
    type: string;
    payload?: any;
  }) => {
    const currentCart = data || initialCartState;
    let newCart: CartState;

    switch (action.type) {
      case 'ADD_TO_CART': {
        const product = action.payload;
        const existingItem = currentCart.items.find(
          item => item.productId === product.id
        );

        if (existingItem) {
          newCart = {
            ...currentCart,
            items: currentCart.items.map(item =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          };
        } else {
          newCart = {
            ...currentCart,
            items: [
              ...currentCart.items,
              { productId: product.id, product, quantity: 1 },
            ],
          };
        }
        break;
      }

      case 'REMOVE_FROM_CART': {
        newCart = {
          ...currentCart,
          items: currentCart.items.filter(
            item => item.productId !== action.payload
          ),
        };
        break;
      }

      case 'INCREASE_QUANTITY': {
        newCart = {
          ...currentCart,
          items: currentCart.items.map(item =>
            item.productId === action.payload
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
        break;
      }

      case 'DECREASE_QUANTITY': {
        newCart = {
          ...currentCart,
          items: currentCart.items
            .map(item =>
              item.productId === action.payload
                ? { ...item, quantity: item.quantity - 1 }
                : item
            )
            .filter(item => item.quantity > 0),
        };
        break;
      }

      case 'SET_CART': {
        newCart = action.payload;
        break;
      }

      default:
        return; // Unknown action
    }

    // Calculate totals
    const totalItems = newCart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    const totalPrice = newCart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    newCart.totalItems = totalItems;
    newCart.totalPrice = totalPrice;

    // Update cart
    await updateCart(newCart);
  };

  return {
    cart: data || initialCartState,
    isLoading,
    error,
    updateCart,
    dispatchCartAction,
    mutate, // Expose mutate for manual revalidation
  };
}

