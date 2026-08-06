/**
 * Category Nav Widget
 *
 * Purpose: Composes the home page category collection.
 * Used in: views/home/ui/home-page.tsx
 */

import {
  Camera,
  Gamepad2,
  Headphones,
  Laptop,
  Monitor,
  Package,
  Smartphone,
  TabletIcon,
  Tv,
  Watch,
  type LucideIcon,
} from 'lucide-react';
import type { Category } from '@/entities/category/model/category';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import { CategoryCard } from '@/widgets/category-nav/ui/category-card';
import { CategoryGrid } from '@/widgets/category-nav/ui/category-grid';
import { CategoryHeader } from '@/widgets/category-nav/ui/category-header';

type CategoryNavProps = {
  categories: Category[];
  locale: AppLocale;
  title: string;
};

const categoryIcons: Record<string, LucideIcon> = {
  camera: Camera,
  gaming: Gamepad2,
  headphones: Headphones,
  laptop: Laptop,
  monitor: Monitor,
  smartphone: Smartphone,
  tv: Tv,
  watch: Watch,
  smartwatch: Watch,
  tablet: TabletIcon,
};

export function CategoryNav(props: CategoryNavProps) {
  const { categories, locale, title } = props;

  if (categories.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="home-categories" className="flex flex-col gap-2">
      <CategoryHeader id="home-categories" title={title} />
      <CategoryGrid>
        {categories.map(function renderCategory(category) {
          const name = getLocalizedText(category.name, locale);
          const Icon = categoryIcons[category.slug.toLowerCase()] ?? Package;

          return (
            <CategoryCard
              href={`/${locale}/categories/${category.slug}`}
              icon={Icon}
              key={category.id}
              label={name}
            />
          );
        })}
      </CategoryGrid>
    </section>
  );
}
