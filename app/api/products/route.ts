/**
 * Products API Route
 * 
 * Purpose: Handle product data operations via API
 * Used in: SWR hooks for fetching products
 * Why: Enables SWR usage and database-ready architecture
 * 
 * Storage: Uses session storage (development) - easy to swap for database
 */

import { NextRequest, NextResponse } from 'next/server';
import { storage, STORAGE_KEYS, initStorage } from '@/lib/storage/session-storage';
import { getInitialProducts } from '@/features/shop/model/initial-data';
import type { Product } from '@/features/shop/model/product';

/**
 * GET /api/products
 * 
 * Returns all products from storage
 * Initializes with mock data if storage is empty
 */
export async function GET(request: NextRequest) {
  try {
    // Initialize products if not exists
    const products = initStorage<Product[]>(
      STORAGE_KEYS.PRODUCTS,
      getInitialProducts()
    );

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('[API] Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * 
 * Updates products in storage
 * Body: { products: Product[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { products } = body;

    if (!Array.isArray(products)) {
      return NextResponse.json(
        { error: 'Invalid request: products must be an array' },
        { status: 400 }
      );
    }

    // Update storage
    storage.set(STORAGE_KEYS.PRODUCTS, products);

    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    console.error('[API] Error updating products:', error);
    return NextResponse.json(
      { error: 'Failed to update products' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products
 * 
 * Updates a single product
 * Body: { id: string, updates: Partial<Product> }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Invalid request: id and updates are required' },
        { status: 400 }
      );
    }

    // Get current products
    const products = storage.get<Product[]>(STORAGE_KEYS.PRODUCTS) || getInitialProducts();

    // Find and update product
    const productIndex = products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    products[productIndex] = { ...products[productIndex], ...updates };

    // Save to storage
    storage.set(STORAGE_KEYS.PRODUCTS, products);

    return NextResponse.json({ success: true, product: products[productIndex] }, { status: 200 });
  } catch (error) {
    console.error('[API] Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
