/**
 * App Header Mobile Navigation
 *
 * Purpose: Provides a compact menu for the app shell on small screens.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeping primary page links accessible without widening the header.
 */

'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';

/**
 * Renders the mobile menu trigger and navigation panel.
 *
 * @returns A responsive mobile navigation control.
 */
export function AppHeaderMobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = getLocaleFromPathname(usePathname());

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        className="flex size-9 items-center justify-center text-foreground"
        onClick={function toggleMenu() {
          setIsOpen(function updateMenu(current) {
            return !current;
          });
        }}
        type="button"
      >
        {isOpen ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full w-full border-t border-foreground/10 bg-background px-4 py-5">
          <nav aria-label="Mobile primary navigation" className="flex flex-col gap-5 font-button text-base text-foreground">
            <AssistantAwareLink href={`/${locale}/products`} onClick={closeMenu}>
              Products
            </AssistantAwareLink>
            <AssistantAwareLink href={`/${locale}#home-categories`} onClick={closeMenu}>
              Categories
            </AssistantAwareLink>
            <AssistantAwareLink href={`/${locale}/checkout`} onClick={closeMenu}>
              Cart
            </AssistantAwareLink>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
