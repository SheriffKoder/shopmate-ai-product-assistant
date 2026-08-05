/**
 * Header Search
 *
 * Purpose: Connects the header search input to localized product navigation.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps router and pathname behavior inside the header-search feature.
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';

import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';
import { navigateToProductSearch } from '@/features/header-search/lib/navigation-utils';
import { HeaderSearchBar } from '@/features/header-search/ui/header-search-bar';

/**
 * Renders the connected header search island.
 *
 * @returns Client search control for product navigation.
 */
export function HeaderSearch() {
  const router = useRouter();
  const locale = getLocaleFromPathname(usePathname());

  function handleSearch(query: string) {
    navigateToProductSearch(router, query, locale);
  }

  return <HeaderSearchBar onSearch={handleSearch} placeholder="Search products..." />;
}
