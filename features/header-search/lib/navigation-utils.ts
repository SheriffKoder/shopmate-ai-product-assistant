/**
 * Header Navigation Utilities
 *
 * Purpose: Provides product navigation helpers used by the app shell header.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps shell search navigation independent from page views.
 */

import type { AppLocale } from '@/shared/i18n/config';

type HeaderRouter = {
  push: (href: string) => void;
};

/**
 * Navigate to the localized products page.
 *
 * @param router - Next.js app router instance.
 * @param searchQuery - Search query string from the header input.
 * @param locale - Active storefront locale.
 */
export function navigateToProductSearch(
  router: HeaderRouter,
  searchQuery: string,
  locale: AppLocale,
) {
  const query = searchQuery.trim();

  if (query) {
    router.push(`/${locale}/products?search=${encodeURIComponent(query)}`);
    return;
  }

  router.push(`/${locale}/products`);
}
