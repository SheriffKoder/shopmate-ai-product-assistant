/**
 * Home Page Data Query
 *
 * Purpose: Aggregates catalog data required by the home page.
 * Used in: views/home/index.tsx
 * Used for: Keeps home composition independent from entity query details.
 */

import 'server-only';

import type { Category } from '@/entities/category/model/category';
import { getCategories } from '@/entities/category/queries/category-queries';
import type { Product } from '@/entities/product/model/product';
import { getFeaturedProducts, getProducts } from '@/entities/product/queries/product-queries';

export type HomePageData = {
  categories: Category[];
  featuredProducts: Product[];
  latestProducts: Product[];
  products: Product[];
};

const HOME_LATEST_PRODUCT_LIMIT = 6;

/**
 * Gets server data for the home page.
 *
 * @returns Categories, featured products, and latest non-featured products.
 */
export async function getHomePageData(): Promise<HomePageData> {
  const [categories, featuredProducts, products] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getProducts(),
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
    .slice(0, HOME_LATEST_PRODUCT_LIMIT);

  return {
    categories,
    featuredProducts,
    latestProducts,
    products,
  };
}
