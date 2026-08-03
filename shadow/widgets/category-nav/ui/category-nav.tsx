/**
 * Shadow Category Nav Widget
 *
 * Purpose: Displays localized category links for server-first catalog pages.
 * Used in: shadow/views/home/ui/home-page.tsx
 * Used for: Lets users navigate from home to category pages without client state.
 */

import Link from 'next/link';
import type { ShadowCategory } from '@/shadow/entities/category/model/category';
import type { ShadowLocale } from '@/shadow/shared/i18n/config';
import { getShadowLocalizedText } from '@/shadow/shared/i18n/lib/get-localized-text';

type ShadowCategoryNavProps = {
  categories: ShadowCategory[];
  locale: ShadowLocale;
  title: string;
};

/**
 * Renders linked category cards.
 *
 * @param props - Categories, active locale, and localized heading.
 * @returns A server-rendered category navigation section.
 */
export function ShadowCategoryNav(props: ShadowCategoryNavProps) {
  const { categories, locale, title } = props;

  if (categories.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="shadow-home-categories" className="space-y-4">
      <h2 id="shadow-home-categories" className="text-xl font-semibold text-gray-950">
        {title}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(function renderCategory(category) {
          const categoryName = getShadowLocalizedText(category.name, locale);
          const categoryDescription = category.description
            ? getShadowLocalizedText(category.description, locale)
            : null;

          return (
            <Link
              className="rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-gray-400"
              href={`/shadow/${locale}/categories/${category.slug}`}
              key={category.id}
            >
              <span className="block text-base font-semibold text-gray-950">{categoryName}</span>
              {categoryDescription ? (
                <span className="mt-2 line-clamp-2 block text-sm leading-6 text-muted-foreground">
                  {categoryDescription}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
