/**
 * Category Queries
 *
 * Purpose: Provides read use cases for category data.
 * Used in: Future views and static param generators.
 * Used for: Keeps views independent from Supabase repositories.
 */

import 'server-only';

import { unstable_cache } from 'next/cache';
import type { Category, CategorySlugParam } from '@/entities/category/model/category';
import {
  getCategoryBySlug,
  listCategories,
  listCategorySlugs,
} from '@/entities/category/repository/category-repository';
import { CATALOG_CACHE_TAGS, PUBLIC_PAGE_REVALIDATE_SECONDS } from '@/shared/config/cache';

const getCachedCategories = unstable_cache(listCategories, ['catalog-categories'], {
  revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [CATALOG_CACHE_TAGS.categories],
});

const getCachedCategoryBySlug = unstable_cache(getCategoryBySlug, ['catalog-category-by-slug'], {
  revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [CATALOG_CACHE_TAGS.categories],
});

const getCachedCategorySlugs = unstable_cache(listCategorySlugs, ['catalog-category-slugs'], {
  revalidate: PUBLIC_PAGE_REVALIDATE_SECONDS,
  tags: [CATALOG_CACHE_TAGS.categories],
});

/**
 * Gets categories for public pages.
 *
 * @returns Active categories ready for rendering.
 */
export async function getCategories(): Promise<Category[]> {
  return getCachedCategories();
}

/**
 * Gets one category for a public page.
 *
 * @param params - Category slug lookup params.
 * @returns The matching category, or null when missing.
 */
export async function getCategory(params: CategorySlugParam): Promise<Category | null> {
  return getCachedCategoryBySlug(params);
}

/**
 * Gets category params for static generation.
 *
 * @returns Active category slug params.
 */
export async function getCategoryStaticParams(): Promise<CategorySlugParam[]> {
  return getCachedCategorySlugs();
}
