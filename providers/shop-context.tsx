/**
 * Shop Context Provider
 * 
 * Purpose: Centralizes products and cart state management using Context API
 * Used in: app/page.tsx (wraps entire app)
 * Called in: the header component and the chat container for the cart state and operations
 * Why: Eliminates prop drilling, allows any component to access/modify products and cart
 * 
 * Provides:
 * - Products state and dispatch function
 * - Cart state and dispatch function
 * - Single source of truth for shop data
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useProducts } from '@/features/ai-assistant/hooks/use-products';
import { useCart } from '@/features/ai-assistant/hooks/use-cart';
import { Product } from '@/features/ai-assistant/types/product';
import { CartState, CartAction } from '@/features/ai-assistant/types/cart';

interface ShopContextValue {
  // Products
  products: Product[];
  confirmedProduct: Product | null;
  confirmedProductIds: Set<string>;
  dispatchProductsAction: (action: any) => void;
  
  // Cart
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
 */
export function ShopProvider({ children, userType = 'user' }: ShopProviderProps) {
  // Initialize products hook
  // Operations not used yet, we only receive the products to pass to the API in the chat container
  const products = useProducts({ userType });
  
  // Initialize cart hook (no setPageData needed - context handles it)
  const { cart, dispatchCartAction } = useCart();

  const value: ShopContextValue = {
    // Products
    products: products.products,
    confirmedProduct: products.confirmedProduct,
    confirmedProductIds: products.confirmedProductIds,
    dispatchProductsAction: products.dispatchProductsAction,
    
    // Cart
    cart,
    dispatchCartAction,
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

