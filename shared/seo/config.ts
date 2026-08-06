/**
 * @file shared/seo/config.ts
 * Central SEO configuration for public ShopMate pages.
 */

import type { AppLocale } from '@/shared/i18n/config';

export const SEO_SITE_NAME = 'ShopMate';
export const SEO_SITE_DESCRIPTION = 'Discover thoughtfully selected electronics and get helpful product guidance with ShopMate.';
export const SEO_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const SEO_SOCIAL_IMAGE_PATH = '/images/icon.png';

/** Build one canonical localized URL. */
export function getLocalizedUrl(locale: AppLocale, pathname = '') {
  return new URL(`/${locale}${pathname}`, SEO_SITE_URL).toString();
}
