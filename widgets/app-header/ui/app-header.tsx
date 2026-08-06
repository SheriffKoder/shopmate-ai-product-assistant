/**
 * App Header Component
 *
 * Purpose: Orchestrates the app shell header from feature-owned client islands.
 * Used in: components/layout-wrapper.tsx
 * Used for: Keeps the header layout server-rendered while interactive controls hydrate independently.
 */

import { AssistantToggleButton } from '@/features/ai-assistant/ui/assistant-toggle-button';
import { CartHeaderButton } from '@/features/cart/ui/cart-header-button';
// import { HeaderSearch } from '@/features/header-search/ui/header-search';
import { HeaderLocaleSwitcher } from '@/features/locale-switcher/ui/header-locale-switcher';
import { UserHeaderButton } from '@/features/auth/ui/user-header-button';
import { AppHeaderHomeLink } from '@/widgets/app-header/ui/app-header-home-link';
import { AppHeaderNavigation } from '@/widgets/app-header/ui/app-header-navigation';
import { AppHeaderMobileNavigation } from '@/widgets/app-header/ui/app-header-mobile-navigation';

export const AppHeader = () => {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-[70px] w-full flex-row items-center justify-between bg-background px-4">

      <AppHeaderHomeLink />

      <AppHeaderMobileNavigation />

      <div className="hidden flex-1 items-center justify-center md:flex">
        <AppHeaderNavigation />
      </div>

      <div className="flex flex-row items-center gap-4">
        <HeaderLocaleSwitcher />
        <UserHeaderButton />
        <AssistantToggleButton />
        <CartHeaderButton />
      </div>
    </div>
  );
};
