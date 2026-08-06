/**
 * @file shared/seo/metadata.ts
 * Builds consistent localized Next.js metadata for public catalog routes.
 */

import type { Metadata } from 'next';
import type { AppLocale } from '@/shared/i18n/config';
import { APP_LOCALES } from '@/shared/i18n/config';
import { getLocalizedUrl, SEO_SITE_DESCRIPTION, SEO_SITE_NAME, SEO_SOCIAL_IMAGE_PATH, SEO_SITE_URL } from './config';

type MetadataInput = {
  locale: AppLocale;
  pathname?: string;
  title: string;
  description: string;
  imagePath?: string | null;
};

/** Build canonical, Open Graph, Twitter, and locale alternate metadata. */
export function createPageMetadata(input: MetadataInput): Metadata {
  const canonical = getLocalizedUrl(input.locale, input.pathname);
  const title = `${input.title} | ${SEO_SITE_NAME}`;
  const imageUrl = new URL(input.imagePath || SEO_SOCIAL_IMAGE_PATH, SEO_SITE_URL).toString();

  return {
    title,
    description: input.description || SEO_SITE_DESCRIPTION,
    metadataBase: new URL(SEO_SITE_URL),
    alternates: {
      canonical,
      languages: Object.fromEntries(APP_LOCALES.map(function mapLocale(locale) {
        return [locale, getLocalizedUrl(locale, input.pathname)];
      })),
    },
    openGraph: {
      title,
      description: input.description || SEO_SITE_DESCRIPTION,
      url: canonical,
      siteName: SEO_SITE_NAME,
      locale: input.locale,
      type: 'website',
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: input.description || SEO_SITE_DESCRIPTION,
      images: [imageUrl],
    },
  };
}
