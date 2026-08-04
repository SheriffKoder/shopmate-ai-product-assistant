/**
 * @file features/cart/store/cart-store.ts
 * Zustand cart store with local persistence and future API synchronization.
 */

import { create } from 'zustand';
import type { CartAction, CartState } from '@/features/cart/model/cart';
import { emptyCart } from '@/features/cart/model/cart-selectors';
import { reduceCart } from './cart-reducer';
import { readPersistedCart, writePersistedCart } from './cart-persistence';
import { replaceCart } from '../client/cart-api-client';
import type { Product } from '@/features/catalog/model/product';
import { addItem, clearCart, decreaseQuantity, increaseQuantity, removeItem, updateQuantity } from '../model/cart-actions';

function loadInitialCart(): CartState {
  return typeof window === 'undefined' ? emptyCart : readPersistedCart();
}

export interface CartStore {
  cart: CartState;
  isHydrated: boolean;
  isSyncing: boolean;
  error: string | null;
  hydrate: () => void;
  clearError: () => void;
  dispatchCartAction: (action: CartAction) => void;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  increaseQuantity: (productId: string) => Promise<void>;
  decreaseQuantity: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  mutateCart: (nextCart: CartState) => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: loadInitialCart(),
  isHydrated: false,
  isSyncing: false,
  error: null,
  hydrate() {
    set({ cart: readPersistedCart(), isHydrated: true });
  },
  clearError() {
    set({ error: null });
  },
  dispatchCartAction(action) {
    set((current) => {
      const cart = reduceCart(current.cart, action);
      writePersistedCart(cart);
      return { cart };
    });
  },
  async addItem(product, quantity) {
    await get().mutateCart(addItem(get().cart, product, quantity));
  },
  async removeItem(productId) {
    await get().mutateCart(removeItem(get().cart, productId));
  },
  async increaseQuantity(productId) {
    await get().mutateCart(increaseQuantity(get().cart, productId));
  },
  async decreaseQuantity(productId) {
    await get().mutateCart(decreaseQuantity(get().cart, productId));
  },
  async updateQuantity(productId, quantity) {
    await get().mutateCart(updateQuantity(get().cart, productId, quantity));
  },
  async clearCart() {
    await get().mutateCart(clearCart());
  },
  async mutateCart(nextCart: CartState) {
    const previousCart = get().cart;
    set({ cart: nextCart, isSyncing: true, error: null });
    writePersistedCart(nextCart);

    try {
      const serverCart = await replaceCart(nextCart);
      set({ cart: serverCart, isSyncing: false });
      writePersistedCart(serverCart);
    } catch (error) {
      set({ cart: previousCart, isSyncing: false, error: error instanceof Error ? error.message : 'Cart sync failed' });
      writePersistedCart(previousCart);
    }
  },
}));
