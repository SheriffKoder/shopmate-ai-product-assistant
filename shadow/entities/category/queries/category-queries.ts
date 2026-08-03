/**
 * Shadow Category Queries
 *
 * Purpose: Provides read use cases for shadow category data.
 * Used in: Future shadow views and static param generators.
 * Used for: Keeps views independent from Supabase repositories.
 */

import 'server-only';

import { unstable_cache } from 'next/cache';
import type { ShadowCategory, ShadowCategorySlugParam } from '@/shadow/entities/category/model/category';
import {
  getShadowCategoryBySlug,
  listShadowCategories,
  listShadowCategorySlugs,
} from '@/shadow/entities/category/repository/category-repository';
import { SHADOW_CACHE_TAGS, SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shadow/shared/config/cache';

const getCachedShadowCategories = unstable_cache(listShadowCategories, ['shadow-categories'], {
  revalidate: SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [SHADOW_CACHE_TAGS.categories],
});

const getCachedShadowCategoryBySlug = unstable_cache(getShadowCategoryBySlug, ['shadow-category-by-slug'], {
  revalidate: SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [SHADOW_CACHE_TAGS.categories],
});

const getCachedShadowCategorySlugs = unstable_cache(listShadowCategorySlugs, ['shadow-category-slugs'], {
  revalidate: SHADOW_PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [SHADOW_CACHE_TAGS.categories],
});

/**
 * Gets categories for public shadow pages.
 *
 * @returns Active categories ready for rendering.
 */
export async function getShadowCategories(): Promise<ShadowCategory[]> {
  return getCachedShadowCategories();
}

/**
 * Gets one category for a public shadow page.
 *
 * @param params - Category slug lookup params.
 * @returns The matching category, or null when missing.
 */
export async function getShadowCategory(params: ShadowCategorySlugParam): Promise<ShadowCategory | null> {
  return getCachedShadowCategoryBySlug(params);
}

/**
 * Gets category params for static generation.
 *
 * @returns Active category slug params.
 */
export async function getShadowCategoryStaticParams(): Promise<ShadowCategorySlugParam[]> {
  return getCachedShadowCategorySlugs();
}
