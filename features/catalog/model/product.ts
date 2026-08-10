/**
 * Product Type Definitions
 * 
 * Purpose: Defines the structure for electronic products
 * Used in: Product display, recommendations, comparisons
 * Why: Centralizes product data structure
 */

export interface Product {
  id: string;
  /** Canonical public route slug; legacy interactive data may use id as its slug. */
  slug?: string;
  name: string;
  category: string; // Product category (e.g., "smartphone", "laptop", "tablet", "smartwatch", "headphones", "earbuds")
  rating: number; // e.g., 4.8, 2.2, etc. (0-5 scale)
  shortDescription: string;
  description: string;
  price: number;
  reviewsCount: number;
  features: string[]; // Array of feature text descriptions
  image_url: string | null; // Product image URL
  image_url_variations: string[] | null; // Array of additional product image URLs
  featured: boolean; // Whether the product should be featured in the product grid
  keywords: string[]; // Array of search keywords for better matching
  colors: string[]; // Array of available color options (e.g., ["white", "black", "blue"])
}
