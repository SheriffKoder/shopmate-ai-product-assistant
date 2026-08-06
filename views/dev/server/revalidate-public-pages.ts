/**
 * Revalidate  Pages Action
 *
 * Purpose: Revalidates catalog cache tags and public ISR paths.
 * Used in: views/dev/ui/dev-page.tsx and seed action.
 * Used for: Refreshes server-first pages after catalog mutations.
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { CATALOG_CACHE_TAGS } from '@/shared/config/cache';
import { redirectDevActionResult } from '@/views/dev/lib/redirect-dev-action-result';

/**
 * Marks catalog tags and public pages stale.
 */
export async function revalidatePublicPages() {
  revalidateTag(CATALOG_CACHE_TAGS.categories);
  revalidateTag(CATALOG_CACHE_TAGS.products);
  revalidateTag(CATALOG_CACHE_TAGS.featuredProducts);
  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/products', 'page');
  revalidatePath('/[locale]/categories/[slug]', 'page');
  revalidatePath('/[locale]/products/[slug]', 'page');
  revalidatePath('/dev');
}

/**
 * Revalidates pages and redirects with an action outcome.
 */
export async function revalidatePublicPagesAction() {
  revalidatePublicPages();

  redirectDevActionResult({
    message: ' catalog tags and ISR paths were revalidated.',
    status: 'success',
  });
}
