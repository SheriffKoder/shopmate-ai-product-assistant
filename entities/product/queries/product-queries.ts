/**
 * Product Queries
 *
 * Purpose: Provides read use cases for product data.
 * Used in: Future views and static param generators.
 * Used for: Keeps views independent from Supabase repositories.
 */

import 'server-only';

import { unstable_cache } from 'next/cache';
import type { Product, ProductSlugParam } from '@/entities/product/model/product';
import {
  getProductBySlug,
  listFeaturedProducts,
  listProducts,
  listProductSlugs,
} from '@/entities/product/repository/product-repository';
import { CATALOG_CACHE_TAGS, PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shared/config/cache';

const getCachedProducts = unstable_cache(listProducts, ['catalog-products'], {
  revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [CATALOG_CACHE_TAGS.products],
});

const getCachedFeaturedProducts = unstable_cache(listFeaturedProducts, ['catalog-featured-products'], {
  revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [CATALOG_CACHE_TAGS.featuredProducts, CATALOG_CACHE_TAGS.products],
});

const getCachedProductBySlug = unstable_cache(getProductBySlug, ['catalog-product-by-slug'], {
  revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [CATALOG_CACHE_TAGS.products],
});

const getCachedProductSlugs = unstable_cache(listProductSlugs, ['catalog-product-slugs'], {
  revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [CATALOG_CACHE_TAGS.products],
});

/**
 * Gets products for public pages.
 *
 * @returns Active products ready for rendering.
 */
export async function getProducts(): Promise<Product[]> {
  return getCachedProducts();
}

/**
 * Gets featured products for public pages.
 *
 * @returns Active featured products ready for rendering.
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  return getCachedFeaturedProducts();
}

/**
 * Gets one product for a public page.
 *
 * @param params - Product slug lookup params.
 * @returns The matching product, or null when missing.
 */
export async function getProduct(params: ProductSlugParam): Promise<Product | null> {
  return getCachedProductBySlug(params);
}

/**
 * Gets product params for static generation.
 *
 * @returns Active product slug params.
 */
export async function getProductStaticParams(): Promise<ProductSlugParam[]> {
  return getCachedProductSlugs();
}
