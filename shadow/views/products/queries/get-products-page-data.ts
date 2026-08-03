/**
 * Shadow Products Page Data
 *
 * Purpose: Loads and filters data for the server-first products listing route.
 * Used in: shadow/views/products/index.tsx
 * Used for: Keeps URL-driven catalog filtering on the server.
 */

import 'server-only';

import type { ShadowCategory } from '@/shadow/entities/category/model/category';
import { getShadowCategories } from '@/shadow/entities/category/queries/category-queries';
import { searchShadowProduct } from '@/shadow/entities/product/lib/search-products';
import type { ShadowProduct } from '@/shadow/entities/product/model/product';
import { getShadowProducts } from '@/shadow/entities/product/queries/product-queries';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';

export type ShadowProductsPageFilters = {
  category: string | null;
  search: string | null;
};

export type ShadowProductsPageData = {
  categories: ShadowCategory[];
  filters: ShadowProductsPageFilters;
  products: ShadowProduct[];
  totalProducts: number;
};

/**
 * Normalizes optional URL filter values.
 *
 * @param value - Raw URL value.
 * @returns A trimmed filter value or null.
 */
function normalizeShadowProductsFilter(value: string | string[] | undefined): string | null {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const normalizedValue = rawValue?.trim();

  return normalizedValue ? normalizedValue : null;
}

/**
 * Loads server-filtered products listing data.
 *
 * @param locale - Active locale for localized search matching.
 * @param searchParams - Products route search params.
 * @returns Categories, filters, and filtered products ready for rendering.
 */
export async function getShadowProductsPageData(
  locale: ShadowLocale,
  searchParams: Record<string, string | string[] | undefined>
): Promise<ShadowProductsPageData> {
  const filters = {
    category: normalizeShadowProductsFilter(searchParams.category),
    search: normalizeShadowProductsFilter(searchParams.search),
  };

  const [categories, products] = await Promise.all([getShadowCategories(), getShadowProducts()]);
  const filteredProducts = products.filter(function filterProduct(product) {
    const categoryMatches = filters.category
      ? product.categorySlug.toLowerCase() === filters.category.toLowerCase()
      : true;
    const searchMatches = filters.search ? searchShadowProduct(filters.search, product, locale) : true;

    return categoryMatches && searchMatches;
  });

  return {
    categories,
    filters,
    products: filteredProducts,
    totalProducts: products.length,
  };
}
