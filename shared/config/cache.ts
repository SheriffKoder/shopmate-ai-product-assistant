/**
 * App Cache Config
 *
 * Purpose: Defines cache constants for server-first catalog pages.
 * Used in: entity queries and development revalidation actions.
 * Used for: Keeps cache tags and ISR timing consistent across public pages.
 */

export const PUBLIC_PAGE_REVALIDATE_SECONDS = 864000;

export const CATALOG_CACHE_TAGS = {
  categories: 'catalog-categories',
  products: 'catalog-products',
  featuredProducts: 'catalog-featured-products',
} as const;
