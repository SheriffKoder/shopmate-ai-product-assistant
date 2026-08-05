/**
 * User Header Button
 *
 * Purpose: Owns the account action button shown in the app header.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps auth-facing header UI in the auth feature boundary.
 */

'use client';

import { User } from 'lucide-react';

import { HeaderIconButton } from '@/shared/ui/header-icon-button';

/**
 * Renders the account icon button placeholder.
 *
 * @returns Header account button.
 */
export function UserHeaderButton() {
  return (
    <HeaderIconButton
      icon={User}
      tooltip="User Account"
      onClick={() => {
        console.log('User clicked');
      }}
    />
  );
}
