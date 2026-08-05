/**
 * Header Navigation Utilities
 *
 * Purpose: Provides product navigation helpers used by the app shell header.
 * Used in: components/main-header/main-header.tsx
 * Used for: Keeps shell search navigation independent from deleted page views.
 */

type HeaderRouter = {
  push: (href: string) => void;
};

/**
 * Navigate to the localized products page.
 *
 * @param router - Next.js app router instance.
 * @param searchQuery - Search query string from the header input.
 */
export function navigateToProductSearch(router: HeaderRouter, searchQuery: string) {
  const query = searchQuery.trim();

  if (query) {
    router.push(`/en/products?search=${encodeURIComponent(query)}`);
    return;
  }

  router.push('/en/products');
}
