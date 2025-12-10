/**
 * use-products Hook
 * 
 * Purpose: Centralize all product-related state and CRUD operations using useReducer
 * Used in: app/page.tsx, components/chat/chat-container.tsx
 * Why: Separates product logic from UI components, makes code more maintainable
 */

'use client';

import { useEffect, useReducer } from 'react';
import { Product } from '../types/product';
import { getInitialProducts } from '../config/initial-data';

interface UseProductsOptions {
  userType?: string;
  initialData?: Product[];
  setPageData?: (state: any) => void;
}

// State interface
interface ProductsState {
  products: Product[];
  confirmedProduct: Product | null;
  confirmedProductIds: Set<string>;
}

// Action types
type ProductsAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'REMOVE_PRODUCT'; payload: string }
  | { type: 'SET_CONFIRMED_PRODUCT'; payload: Product | null }
  | { type: 'ADD_CONFIRMED_ID'; payload: string }
  | { type: 'REMOVE_CONFIRMED_ID'; payload: string }
  | { type: 'RESET_CONFIRMED_PRODUCT' };

// Initial state
const initialState: ProductsState = {
  products: [],
  confirmedProduct: null,
  confirmedProductIds: new Set(),
};

// Reducer function
function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload,
      };

    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload],
        confirmedProduct: action.payload,
      };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id
            ? { ...product, ...action.payload.updates }
            : product
        ),
        confirmedProduct:
          state.confirmedProduct?.id === action.payload.id
            ? { ...state.confirmedProduct, ...action.payload.updates }
            : state.confirmedProduct,
      };

    case 'REMOVE_PRODUCT':
      const newConfirmedIds = new Set(state.confirmedProductIds);
      newConfirmedIds.delete(action.payload);
      return {
        ...state,
        products: state.products.filter((product) => product.id !== action.payload),
        confirmedProductIds: newConfirmedIds,
        confirmedProduct:
          state.confirmedProduct?.id === action.payload ? null : state.confirmedProduct,
      };

    case 'SET_CONFIRMED_PRODUCT':
      return {
        ...state,
        confirmedProduct: action.payload,
      };

    case 'ADD_CONFIRMED_ID':
      return {
        ...state,
        confirmedProductIds: new Set(state.confirmedProductIds).add(action.payload),
      };

    case 'REMOVE_CONFIRMED_ID':
      const updatedIds = new Set(state.confirmedProductIds);
      updatedIds.delete(action.payload);
      return {
        ...state,
        confirmedProductIds: updatedIds,
      };

    case 'RESET_CONFIRMED_PRODUCT':
      return {
        ...state,
        confirmedProduct: null,
      };

    default:
      return state;
  }
}

/**
 * Hook for managing product state and operations using useReducer
 * @param options - Configuration options
 * @returns Product state and operations
 */
export function useProducts(options: UseProductsOptions = {}) {
  const { userType = 'user', initialData, setPageData } = options;

  // Initialize reducer with initial data
  const [state, dispatch] = useReducer(productsReducer, {
    ...initialState,
    products: initialData || getInitialProducts(),
  });

  // Sync local state with page state when it changes
  useEffect(() => {
    if (setPageData && JSON.stringify(state.products) !== JSON.stringify(initialData)) {
      setPageData(state.products);
      console.log('SYNCED WITH PAGE STATE', state.products);
    }
  }, [state.products, setPageData, initialData]);

  /**
   * Dispatch Products Action: Single function to handle all product actions
   * @param action - The action to dispatch
   */
  const dispatchProductsAction = (action: ProductsAction) => {
    dispatch(action);
  };

  return {
    // State
    products: state.products,
    confirmedProduct: state.confirmedProduct,
    confirmedProductIds: state.confirmedProductIds,

    // Single dispatch function
    dispatchProductsAction,
  };
}

