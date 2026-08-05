/**
 * Shadow Product Detail Page Data Query
 *
 * Purpose: Loads server data for one shadow product detail page.
 * Used in: views/product-detail/index.tsx
 * Used for: Keeps product detail view composition independent from entity repositories.
 */

import 'server-only';

import type { ShadowProduct } from '@/entities/product/model/product';
import { getShadowProduct, getShadowProducts } from '@/entities/product/queries/product-queries';

export type ShadowProductDetailPageData = {
  product: ShadowProduct | null;
  relatedProducts: ShadowProduct[];
};

const RELATED_PRODUCT_LIMIT = 3;

/**
 * Gets one product plus nearby products from the same category.
 *
 * @param slug - Product slug from the route.
 * @returns Detail page data for server rendering.
 */
export async function getShadowProductDetailPageData(slug: string): Promise<ShadowProductDetailPageData> {
  const product = await getShadowProduct({ slug });

  if (!product) {
    return {
      product: null,
      relatedProducts: [],
    };
  }

  const products = await getShadowProducts();
  const relatedProducts = products
    .filter(function selectSameCategoryProduct(candidate) {
      return candidate.categorySlug === product.categorySlug && candidate.slug !== product.slug;
    })
    .slice(0, RELATED_PRODUCT_LIMIT);

  return {
    product,
    relatedProducts,
  };
}
