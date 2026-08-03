/**
 * Shadow Cache Config
 *
 * Purpose: Defines cache constants for server-first shadow catalog pages.
 * Used in: shadow entity queries and future revalidation actions.
 * Used for: Keeps cache tags and ISR timing consistent across public pages.
 */

export const SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS = 864000;

export const SHADOW_CACHE_TAGS = {
  categories: 'shadow-categories',
  products: 'shadow-products',
  featuredProducts: 'shadow-featured-products',
} as const;
