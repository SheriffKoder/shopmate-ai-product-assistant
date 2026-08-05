/**
 * Search Utilities
 * 
 * Purpose: Provides search functionality for products and cart items
 * Used in: cart-info-tool.ts, product-search-tool.ts
 * Why: Centralizes search logic for consistent matching across tools
 */

/**
 * Search for query words in target string or array
 * @param query - The search query string
 * @param target - The target to search in (string or array of strings)
 * @returns true if all words in query are found in target, false otherwise
 */
export function searchInTarget(query: string, target: string | string[]): boolean {
  // Convert target to string if it's an array
  const targetString = Array.isArray(target) 
    ? target.join(' ').toLowerCase()
    : target.toLowerCase();
  
  // Convert query to lowercase and split into words
  const queryWords = query.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);
  
  // If no words in query, return false
  if (queryWords.length === 0) {
    return false;
  }
  
  // Check if all query words are found in target string
  return queryWords.every(word => targetString.includes(word));
}

/**
 * Search for query across all product fields (combined search)
 * This allows matching words across different fields (e.g., "red" in colors, "phone" in keywords)
 * @param query - The search query string
 * @param product - The product to search in
 * @returns true if all words in query are found across any product fields, false otherwise
 */
export function searchInProduct(query: string, product: {
  name?: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  keywords?: string[];
  colors?: string[];
  features?: string[];
  id?: string;
}): boolean {
  // Combine all searchable fields into one string
  const searchableFields: string[] = [];
  
  if (product.name) searchableFields.push(product.name);
  if (product.category) searchableFields.push(product.category);
  if (product.description) searchableFields.push(product.description);
  if (product.shortDescription) searchableFields.push(product.shortDescription);
  if (product.id) searchableFields.push(product.id);
  if (product.keywords) searchableFields.push(...product.keywords);
  if (product.colors) searchableFields.push(...product.colors);
  if (product.features) searchableFields.push(...product.features);
  
  // Join all fields and search
  const combinedTarget = searchableFields.join(' ').toLowerCase();
  
  return searchInTarget(query, combinedTarget);
}

