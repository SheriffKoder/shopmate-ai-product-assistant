/**
 * Revalidate Shadow Pages Action
 *
 * Purpose: Revalidates shadow catalog cache tags and public ISR paths.
 * Used in: shadow/views/dev/ui/dev-page.tsx and seed action.
 * Used for: Refreshes server-first pages after shadow catalog mutations.
 */

'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { SHADOW_CACHE_TAGS } from '@/shadow/shared/config/cache';
import { redirectShadowDevActionResult } from '@/shadow/views/dev/lib/redirect-dev-action-result';

/**
 * Marks shadow catalog tags and public pages stale.
 */
export async function revalidateShadowPages() {
  revalidateTag(SHADOW_CACHE_TAGS.categories);
  revalidateTag(SHADOW_CACHE_TAGS.products);
  revalidateTag(SHADOW_CACHE_TAGS.featuredProducts);
  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/products', 'page');
  revalidatePath('/[locale]/categories/[slug]', 'page');
  revalidatePath('/[locale]/products/[slug]', 'page');
  revalidatePath('/dev');
}

/**
 * Revalidates shadow pages and redirects with an action outcome.
 */
export async function revalidateShadowPagesAction() {
  revalidateShadowPages();

  redirectShadowDevActionResult({
    message: 'Shadow catalog tags and ISR paths were revalidated.',
    status: 'success',
  });
}
