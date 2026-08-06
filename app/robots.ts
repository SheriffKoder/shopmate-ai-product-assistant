/**
 * @file app/robots.ts
 * Defines crawler access for public and private application routes.
 */

import type { MetadataRoute } from 'next';
import { SEO_SITE_URL } from '@/shared/seo/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/en', '/ar', '/en/', '/ar/'],
      disallow: ['/dev', '/checkout', '/en/checkout', '/ar/checkout', '/api/', '/_next/'],
    },
    sitemap: new URL('/sitemap.xml', SEO_SITE_URL).toString(),
  };
}
