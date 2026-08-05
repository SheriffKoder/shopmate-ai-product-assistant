/**
 * Product Detail Page Data Query
 *
 * Purpose: Loads server data for one product detail page.
 * Used in: views/product-detail/index.tsx
 * Used for: Keeps product detail view composition independent from entity repositories.
 */

import 'server-only';

import type { Product } from '@/entities/product/model/product';
import { getProduct, getProducts } from '@/entities/product/queries/product-queries';

export type ProductDetailPageData = {
  product: Product | null;
  relatedProducts: Product[];
};

const RELATED_PRODUCT_LIMIT = 3;

/**
 * Gets one product plus nearby products from the same category.
 *
 * @param slug - Product slug from the route.
 * @returns Detail page data for server rendering.
 */
export async function getProductDetailPageData(slug: string): Promise<ProductDetailPageData> {
  const product = await getProduct({ slug });

  if (!product) {
    return {
      product: null,
      relatedProducts: [],
    };
  }

  const products = await getProducts();
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
