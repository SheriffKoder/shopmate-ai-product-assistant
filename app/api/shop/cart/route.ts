/**
 * Cart API Route
 * 
 * Purpose: Handle cart data operations via API
 * Used in: SWR hooks for fetching cart
 * Why: Enables SWR usage and database-ready architecture
 * 
 * Storage: Uses session storage (development) - easy to swap for database
 */

import { NextRequest, NextResponse } from 'next/server';
import { storage, STORAGE_KEYS, initStorage } from '@/lib/storage/session-storage';
import type { CartState } from '@/features/cart/model/cart';

/**
 * Initial empty cart state
 */
const initialCartState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

/**
 * GET /api/cart
 * 
 * Returns current cart from storage
 * Initializes with empty cart if storage is empty
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize cart if not exists
    const cart = initStorage<CartState>(
      STORAGE_KEYS.CART,
      initialCartState
    );

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    console.error('[API] Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart
 * 
 * Updates entire cart in storage
 * Body: CartState
 */
export async function POST(request: NextRequest) {
  try {
    const cart: CartState = await request.json();

    if (!cart || typeof cart !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request: cart must be a valid CartState object' },
        { status: 400 }
      );
    }

    // Validate cart structure
    if (!Array.isArray(cart.items)) {
      return NextResponse.json(
        { error: 'Invalid request: cart.items must be an array' },
        { status: 400 }
      );
    }

    // Update storage
    storage.set(STORAGE_KEYS.CART, cart);

    return NextResponse.json({ success: true, cart }, { status: 200 });
  } catch (error) {
    console.error('[API] Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cart
 * 
 * Partial cart update (for incremental updates)
 * Body: Partial<CartState>
 */
export async function PATCH(request: NextRequest) {
  try {
    const updates: Partial<CartState> = await request.json();

    // Get current cart
    const currentCart = storage.get<CartState>(STORAGE_KEYS.CART) || initialCartState;

    // Merge updates
    const updatedCart: CartState = {
      ...currentCart,
      ...updates,
      // Ensure items array is preserved if not provided
      items: updates.items ?? currentCart.items,
    };

    // Update storage
    storage.set(STORAGE_KEYS.CART, updatedCart);

    return NextResponse.json({ success: true, cart: updatedCart }, { status: 200 });
  } catch (error) {
    console.error('[API] Error patching cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart
 * 
 * Clears the cart
 */
export async function DELETE(request: NextRequest) {
  try {
    // Reset to initial state
    storage.set(STORAGE_KEYS.CART, initialCartState);

    return NextResponse.json({ success: true, cart: initialCartState }, { status: 200 });
  } catch (error) {
    console.error('[API] Error clearing cart:', error);
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}
