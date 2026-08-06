/**
 * @file app/sitemap.ts
 * Generates the localized public catalog sitemap.
 */

import type { MetadataRoute } from 'next';
import { getCategoryStaticParams } from '@/entities/category/queries/category-queries';
import { getProductStaticParams } from '@/entities/product/queries/product-queries';
import { APP_LOCALES } from '@/shared/i18n/config';
import { getLocalizedUrl } from '@/shared/seo/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProductStaticParams(), getCategoryStaticParams()]);
  const entries = APP_LOCALES.flatMap(function mapLocale(locale) {
    return [
      { url: getLocalizedUrl(locale), changeFrequency: 'weekly' as const, priority: 1 },
      { url: getLocalizedUrl(locale, '/products'), changeFrequency: 'weekly' as const, priority: 0.8 },
      { url: getLocalizedUrl(locale, '/categories'), changeFrequency: 'weekly' as const, priority: 0.8 },
      ...products.map(function mapProduct(product) {
        return { url: getLocalizedUrl(locale, `/products/${product.slug}`), changeFrequency: 'weekly' as const, priority: 0.7 };
      }),
      ...categories.map(function mapCategory(category) {
        return { url: getLocalizedUrl(locale, `/categories/${category.slug}`), changeFrequency: 'weekly' as const, priority: 0.7 };
      }),
    ];
  });

  return entries;
}
