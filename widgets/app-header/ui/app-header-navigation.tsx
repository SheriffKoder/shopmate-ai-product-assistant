/**
 * App Header Navigation
 *
 * Purpose: Provides the primary text links for the app shell header.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Giving users direct access to products, categories, and checkout.
 */

'use client';

import { usePathname } from 'next/navigation';

import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';

/**
 * Renders the locale-aware primary page navigation.
 *
 * @returns Header navigation links.
 */
export function AppHeaderNavigation() {
  const locale = getLocaleFromPathname(usePathname());

  return (
    <nav aria-label="Primary navigation" className="w-fit fixed top-6 left-1/2 -translate-x-1/2 flex items-center gap-6 font-button text-sm text-foreground">
      <AssistantAwareLink className="transition-opacity hover:opacity-60" href={`/${locale}/products`}>
        Products
      </AssistantAwareLink>
      <AssistantAwareLink className="transition-opacity hover:opacity-60" href={`/${locale}/categories`}>
        Categories
      </AssistantAwareLink>
      <AssistantAwareLink className="transition-opacity hover:opacity-60" href={`/${locale}/checkout`}>
        Cart
      </AssistantAwareLink>
    </nav>
  );
}
