/**
 * Cart Type Definitions
 * 
 * Purpose: Defines the structure for shopping cart
 * Used in: Cart state management, product cards
 * Why: Centralizes cart data structure
 */

import type { Product } from '@/features/catalog/model/product';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export type CartAction =
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string } // productId
  | { type: 'INCREASE_QUANTITY'; payload: string } // productId
  | { type: 'DECREASE_QUANTITY'; payload: string } // productId
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartState }; // Full cart state (for stream updates)
