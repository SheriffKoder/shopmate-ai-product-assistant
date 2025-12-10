/**
 * Shop Context Provider
 * 
 * Purpose: Centralizes products and cart state management using SWR
 * Used in: app/layout.tsx (via LayoutWrapper)
 * Called in: the header component and the chat container for the cart state and operations
 * Why: Eliminates prop drilling, allows any component to access/modify products and cart
 * 
 * Provides:
 * - Products state (from SWR)
 * - Cart state (from SWR)
 * - Single source of truth for shop data
 * 
 * Storage: Uses sessionStorage (development) - easy to swap for database
 */

'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { SWRConfig } from 'swr';
import { useProductsAPI } from '@/features/ai-assistant/hooks/use-products-api-swr';
import { useCartAPI } from '@/features/ai-assistant/hooks/use-cart-api-swr';
import { Product } from '@/features/ai-assistant/types/product';
import { CartState, CartAction } from '@/features/ai-assistant/types/cart';

interface ShopContextValue {
  // Products (from SWR)
  products: Product[];
  confirmedProduct: Product | null;
  confirmedProductIds: Set<string>;
  dispatchProductsAction: (action: any) => void;
  
  // Cart (from SWR)
  cart: CartState;
  dispatchCartAction: (action: CartAction) => void;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

interface ShopProviderProps {
  children: ReactNode;
  userType?: string;
}

/**
 * Shop Provider Component
 * Wraps the app and provides products and cart state to all children
 * 
 * Uses SWR for data fetching with sessionStorage (development)
 * Easy to swap for database by changing hooks
 */
export function ShopProvider({ children, userType = 'user' }: ShopProviderProps) {
  // SWR hooks for products and cart
  const { products, updateProducts } = useProductsAPI();
  const { cart, dispatchCartAction: dispatchCartActionAPI } = useCartAPI();

  // Local state for confirmed product (UI-only, not persisted)
  const [confirmedProduct, setConfirmedProduct] = useState<Product | null>(null);
  const [confirmedProductIds, setConfirmedProductIds] = useState<Set<string>>(new Set());

  /**
   * Dispatch products action (maintains backward compatibility)
   */
  const dispatchProductsAction = useCallback((action: any) => {
    switch (action.type) {
      case 'SET_PRODUCTS':
        updateProducts(action.payload);
        break;
      case 'ADD_PRODUCT':
        updateProducts([...products, action.payload]);
        break;
      case 'UPDATE_PRODUCT': {
        const updated = products.map(p =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        );
        updateProducts(updated);
        break;
      }
      case 'REMOVE_PRODUCT':
        updateProducts(products.filter(p => p.id !== action.payload));
        break;
      case 'SET_CONFIRMED_PRODUCT':
        setConfirmedProduct(action.payload);
        break;
      case 'ADD_CONFIRMED_ID':
        setConfirmedProductIds(prev => new Set([...prev, action.payload]));
        break;
      case 'REMOVE_CONFIRMED_ID':
        setConfirmedProductIds(prev => {
          const next = new Set(prev);
          next.delete(action.payload);
          return next;
        });
        break;
      case 'RESET_CONFIRMED_PRODUCT':
        setConfirmedProduct(null);
        setConfirmedProductIds(new Set());
        break;
      default:
        console.warn('[ShopProvider] Unknown products action:', action);
    }
  }, [products, updateProducts]);

  const value: ShopContextValue = {
    // Products
    products,
    confirmedProduct,
    confirmedProductIds,
    dispatchProductsAction,
    
    // Cart
    cart,
    dispatchCartAction: dispatchCartActionAPI,
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

/**
 * Hook to access shop context
 * Must be used within ShopProvider
 */
export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}

