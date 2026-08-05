/**
 * App Header Home Link
 *
 * Purpose: Links the header brand mark to the active localized home route.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps pathname-aware logo behavior out of the server header orchestrator.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getLocaleFromPathname } from '@/shared/i18n/lib/get-locale-from-pathname';

/**
 * Renders the locale-aware brand home link.
 *
 * @returns Header logo link for the active locale.
 */
export function AppHeaderHomeLink() {
  const locale = getLocaleFromPathname(usePathname());

  return (
    <Link href={`/${locale}`} className="cursor-pointer flex flex-row items-center gap-2 mb-2">
      <Image src="/images/icon.png" alt="ShopMate AI" width={30} height={30} />
      {/* <span className='text-black text-lg font-bold hidden md:block'>ShopMate AI</span> */}
    </Link>
  );
}
