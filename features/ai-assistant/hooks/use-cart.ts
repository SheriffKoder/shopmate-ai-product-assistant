/**
 * use-cart Hook
 * 
 * Purpose: Centralize all cart-related state and operations using useReducer
 * Used in: Product cards, cart components
 * Why: Separates cart logic from UI components, makes code more maintainable
 */

'use client';

import { useEffect, useReducer } from 'react';
import { CartState, CartAction, CartItem } from '../types/cart';
import { Product } from '../types/product';

interface UseCartOptions {
  setPageData?: (state: any) => void;
  initialData?: CartState;
}

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Helper function to calculate totals
function calculateTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { totalItems, totalPrice };
}

// Reducer function
function cartReducer(state: CartState, action: CartAction): CartState {
  let newState: CartState;

  switch (action.type) {
    case 'ADD_TO_CART': {
      const product = action.payload as Product;
      const existingItem = state.items.find((item) => item.productId === product.id);

      if (existingItem) {
        // Increase quantity if product already exists
        newState = {
          ...state,
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      } else {
        // Add new item
        newState = {
          ...state,
          items: [...state.items, { productId: product.id, product, quantity: 1 }],
        };
      }
      break;
    }

    case 'REMOVE_FROM_CART': {
      const productId = action.payload as string;
      newState = {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
      };
      break;
    }

    case 'INCREASE_QUANTITY': {
      const productId = action.payload as string;
      newState = {
        ...state,
        items: state.items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };
      break;
    }

    case 'DECREASE_QUANTITY': {
      const productId = action.payload as string;
      newState = {
        ...state,
        items: state.items
          .map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item
          )
          .filter((item) => item.quantity > 0), // Remove if quantity becomes 0
      };
      break;
    }

    default:
      return state;
  }

  // Recalculate totals
  const { totalItems, totalPrice } = calculateTotals(newState.items);
  newState.totalItems = totalItems;
  newState.totalPrice = totalPrice;

  // Console log after every action
  console.log('Cart updated:', newState);

  return newState;
}

/**
 * Hook for managing cart state and operations using useReducer
 * @param options - Configuration options
 * @returns Cart state and dispatch function
 */
export function useCart(options: UseCartOptions = {}) {
  const { setPageData, initialData } = options;

  // Initialize reducer with initial data
  const [cart, dispatch] = useReducer(cartReducer, initialData || initialState);

  // Sync local state with page state when it changes
  useEffect(() => {
    if (setPageData) {
      setPageData(cart);
      console.log('SYNCED CART WITH PAGE STATE', cart);
    }
  }, [cart, setPageData]);

  /**
   * Dispatch Cart Action: Single function to handle all cart actions
   * @param action - The action to dispatch
   */
  const dispatchCartAction = (action: CartAction) => {
    dispatch(action);
  };

  return {
    cart,
    dispatchCartAction,
  };
}

