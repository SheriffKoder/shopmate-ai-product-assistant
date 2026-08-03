/**
 * Shadow Home Page Data Query
 *
 * Purpose: Aggregates catalog data required by the shadow home page.
 * Used in: shadow/views/home/index.tsx
 * Used for: Keeps home composition independent from entity query details.
 */

import 'server-only';

import type { ShadowCategory } from '@/shadow/entities/category/model/category';
import { getShadowCategories } from '@/shadow/entities/category/queries/category-queries';
import type { ShadowProduct } from '@/shadow/entities/product/model/product';
import { getShadowFeaturedProducts, getShadowProducts } from '@/shadow/entities/product/queries/product-queries';

export type ShadowHomePageData = {
  categories: ShadowCategory[];
  featuredProducts: ShadowProduct[];
  latestProducts: ShadowProduct[];
};

const SHADOW_HOME_LATEST_PRODUCT_LIMIT = 6;

/**
 * Gets server data for the shadow home page.
 *
 * @returns Categories, featured products, and latest non-featured products.
 */
export async function getShadowHomePageData(): Promise<ShadowHomePageData> {
  const [categories, featuredProducts, products] = await Promise.all([
    getShadowCategories(),
    getShadowFeaturedProducts(),
    getShadowProducts(),
  ]);

  const featuredProductIds = new Set(
    featuredProducts.map(function mapFeaturedProductId(product) {
      return product.id;
    }),
  );

  const latestProducts = products
    .filter(function filterNonFeaturedProduct(product) {
      return !featuredProductIds.has(product.id);
    })
    .slice(0, SHADOW_HOME_LATEST_PRODUCT_LIMIT);

  return {
    categories,
    featuredProducts,
    latestProducts,
  };
}
