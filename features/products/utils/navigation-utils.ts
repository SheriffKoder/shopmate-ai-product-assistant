/**
 * Navigation Utilities
 * 
 * Purpose: Utility functions for product page navigation
 * Used in: Header components, product cards
 * Why: Centralizes navigation logic for product-related routes
 */

/**
 * Navigate to products page with search query
 * @param router - Next.js router instance
 * @param searchQuery - Search query string
 */
export function navigateToProductSearch(router: any, searchQuery: string) {
  if (searchQuery.trim()) {
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  } else {
    router.push('/products');
  }
}

/**
 * Navigate to products page with category filter
 * @param router - Next.js router instance
 * @param category - Category name
 */
export function navigateToProductCategory(router: any, category: string) {
  router.push(`/products?category=${encodeURIComponent(category)}`);
}

/**
 * Navigate to product detail page
 * @param router - Next.js router instance
 * @param productId - Product ID
 */
export function navigateToProductDetail(router: any, productId: string) {
  router.push(`/products/${productId}`);
}

