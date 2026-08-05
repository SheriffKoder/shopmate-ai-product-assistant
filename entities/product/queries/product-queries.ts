/**
 * Shadow Product Queries
 *
 * Purpose: Provides read use cases for shadow product data.
 * Used in: Future shadow views and static param generators.
 * Used for: Keeps views independent from Supabase repositories.
 */

import 'server-only';

import { unstable_cache } from 'next/cache';
import type { ShadowProduct, ShadowProductSlugParam } from '@/entities/product/model/product';
import {
  getShadowProductBySlug,
  listShadowFeaturedProducts,
  listShadowProducts,
  listShadowProductSlugs,
} from '@/entities/product/repository/product-repository';
import { SHADOW_CACHE_TAGS, SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shared/config/cache';

const getCachedShadowProducts = unstable_cache(listShadowProducts, ['shadow-products'], {
  revalidate: SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [SHADOW_CACHE_TAGS.products],
});

const getCachedShadowFeaturedProducts = unstable_cache(listShadowFeaturedProducts, ['shadow-featured-products'], {
  revalidate: SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [SHADOW_CACHE_TAGS.featuredProducts, SHADOW_CACHE_TAGS.products],
});

const getCachedShadowProductBySlug = unstable_cache(getShadowProductBySlug, ['shadow-product-by-slug'], {
  revalidate: SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [SHADOW_CACHE_TAGS.products],
});

const getCachedShadowProductSlugs = unstable_cache(listShadowProductSlugs, ['shadow-product-slugs'], {
  revalidate: SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [SHADOW_CACHE_TAGS.products],
});

/**
 * Gets products for public shadow pages.
 *
 * @returns Active products ready for rendering.
 */
export async function getShadowProducts(): Promise<ShadowProduct[]> {
  return getCachedShadowProducts();
}

/**
 * Gets featured products for public shadow pages.
 *
 * @returns Active featured products ready for rendering.
 */
export async function getShadowFeaturedProducts(): Promise<ShadowProduct[]> {
  return getCachedShadowFeaturedProducts();
}

/**
 * Gets one product for a public shadow page.
 *
 * @param params - Product slug lookup params.
 * @returns The matching product, or null when missing.
 */
export async function getShadowProduct(params: ShadowProductSlugParam): Promise<ShadowProduct | null> {
  return getCachedShadowProductBySlug(params);
}

/**
 * Gets product params for static generation.
 *
 * @returns Active product slug params.
 */
export async function getShadowProductStaticParams(): Promise<ShadowProductSlugParam[]> {
  return getCachedShadowProductSlugs();
}
