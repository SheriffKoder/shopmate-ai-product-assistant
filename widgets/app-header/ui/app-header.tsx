/**
 * App Header Component
 *
 * Purpose: Orchestrates the app shell header from feature-owned client islands.
 * Used in: components/layout-wrapper.tsx
 * Used for: Keeps the header layout server-rendered while interactive controls hydrate independently.
 */

import { AssistantToggleButton } from '@/features/ai-assistant/ui/assistant-toggle-button';
import { CartHeaderButton } from '@/features/cart/ui/cart-header-button';
import { HeaderSearch } from '@/features/header-search/ui/header-search';
import { HeaderLocaleSwitcher } from '@/features/locale-switcher/ui/header-locale-switcher';
import { UserHeaderButton } from '@/features/auth/ui/user-header-button';
import { AppHeaderHomeLink } from '@/widgets/app-header/ui/app-header-home-link';

export const AppHeader = () => {
  return (
    <div className='fixed top-0 left-0 w-full h-[70px] bg-white flex flex-row items-center justify-between px-4 z-50'>

      <AppHeaderHomeLink />

      <div className='flex flex-1 items-center justify-center'>
        <HeaderSearch />
      </div>
      

      <div className='flex flex-row items-center gap-4'>
        <HeaderLocaleSwitcher />
        <UserHeaderButton />
        <AssistantToggleButton />
        <CartHeaderButton />

      </div>
    </div>
  );
};
