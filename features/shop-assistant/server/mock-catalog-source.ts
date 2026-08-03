/**
 * @file features/shop-assistant/server/mock-catalog-source.ts
 * Mock catalog source: implements assistant catalog reads over current in-memory products.
 * Used in: features/shop-assistant/server/shop-assistant-runtime.ts.
 * Used for: Preserving current mock/session behavior while giving future DB search a stable contract.
 */

import type { Product } from '@/features/shop/model/product';
import { getInitialProducts } from '@/features/shop/model/initial-data';
import type { CatalogSearchInput, CatalogSource } from '@/features/shop-assistant/model/catalog-source';
import { analyzeItemsWithAI } from '@/features/shop-assistant/lib/ai-search-agent';
import { searchInProduct } from '@/features/shop-assistant/lib/search-utils';

/**
 * Creates a catalog source backed by request products with initial-data fallback.
 */
export function createMockCatalogSource(products: Product[] = []): CatalogSource {
  const catalog = products.length > 0 ? products : getInitialProducts();

  return {
    async searchProducts(input) {
      const filteredProducts = filterProducts(catalog, input);
      const rankedProducts = await rankProducts(input, filteredProducts);

      return sortProducts(rankedProducts, input.sortBy).slice(0, input.limit ?? 10);
    },
    async getProductContext(input) {
      return filterProducts(catalog, {
        query: input.query,
        limit: input.limit ?? 8,
      }).slice(0, input.limit ?? 8);
    },
    async getProductById(id) {
      return catalog.find((product) => product.id === id) ?? null;
    },
  };
}

/**
 * Applies deterministic filters before any AI ranking.
 */
function filterProducts(products: Product[], input: CatalogSearchInput): Product[] {
  const keywords = input.keywords?.filter(Boolean) ?? [];

  return products.filter((product) => {
    // 1. Category filter maps directly to future DB equality or IN clauses.
    if (input.category && product.category.toLowerCase() !== input.category.toLowerCase()) {
      return false;
    }

    // 2. Price filters map directly to future DB range predicates.
    if (input.minPrice !== undefined && product.price < input.minPrice) {
      return false;
    }

    if (input.maxPrice !== undefined && product.price > input.maxPrice) {
      return false;
    }

    // 3. Rating filter maps directly to a future DB numeric predicate.
    if (input.minRating !== undefined && product.rating < input.minRating) {
      return false;
    }

    // 4. Color filter maps to future DB array/JSON containment.
    if (input.color && !product.colors.some((color) => color.toLowerCase().includes(input.color!.toLowerCase()))) {
      return false;
    }

    // 5. Keywords use the existing in-memory matcher until DB full-text search is added.
    if (keywords.length > 0 && !keywords.every((keyword) => searchInProduct(keyword, product))) {
      return false;
    }

    // 6. Empty keyword/category filters should still return browsable catalog candidates.
    return input.query.trim().length === 0 || searchInProduct(input.query, product) || hasStructuredFilters(input);
  });
}

/**
 * Uses AI only to rank the already-filtered candidate set.
 */
async function rankProducts(input: CatalogSearchInput, products: Product[]): Promise<Product[]> {
  if (products.length === 0 || input.sortBy !== 'relevance') {
    return products;
  }

  try {
    return await analyzeItemsWithAI(input.query, products, 'products');
  } catch {
    return products;
  }
}

/**
 * Applies deterministic sort modes after filtering/ranking.
 */
function sortProducts(products: Product[], sortBy: CatalogSearchInput['sortBy'] = 'relevance'): Product[] {
  const sortableProducts = [...products];

  switch (sortBy) {
    case 'rating':
      return sortableProducts.sort((a, b) => b.rating - a.rating);
    case 'price-low':
      return sortableProducts.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sortableProducts.sort((a, b) => b.price - a.price);
    case 'reviews':
      return sortableProducts.sort((a, b) => b.reviewsCount - a.reviewsCount);
    case 'name':
      return sortableProducts.sort((a, b) => a.name.localeCompare(b.name));
    case 'relevance':
    default:
      return sortableProducts;
  }
}

/**
 * Detects whether structured filters can justify results even when raw query terms are broad.
 */
function hasStructuredFilters(input: CatalogSearchInput): boolean {
  return Boolean(input.category || input.minPrice !== undefined || input.maxPrice !== undefined || input.color || input.minRating !== undefined || input.keywords?.length);
}
