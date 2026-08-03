/**
 * Shadow Dictionary Model
 *
 * Purpose: Defines the typed copy contract for shadow localized pages.
 * Used in: shadow i18n dictionaries, server views, and shadow widgets.
 * Used for: Keeps page and header copy out of JSX while preserving type safety.
 */

import type { ShadowLocale } from '@/shadow/shared/i18n/config';

type ShadowNavigationDictionary = {
  label: string;
  home: string;
  products: string;
};

type ShadowCommonDictionary = {
  brandName: string;
  home: string;
  products: string;
  language: string;
  localeNames: Record<ShadowLocale, string>;
};

type ShadowPageDictionary = {
  title: string;
  eyebrow: string;
  description: string;
};

export type ShadowDictionary = {
  common: ShadowCommonDictionary;
  header: {
    navigation: ShadowNavigationDictionary;
  };
  home: ShadowPageDictionary & {
    heroAction: string;
    categoriesTitle: string;
    featuredTitle: string;
    latestTitle: string;
    emptyState: string;
  };
  products: ShadowPageDictionary & {
    allCategories: string;
    categoryFilterLabel: string;
    emptyState: string;
    filteredByCategory: string;
    filteredByCategoryAndSearch: string;
    filteredBySearch: string;
    gridTitle: string;
    resultCount: string;
  };
  productDetail: ShadowPageDictionary & {
    notFound: string;
  };
  category: ShadowPageDictionary & {
    emptyState: string;
    gridTitle: string;
    resultCount: string;
  };
  dev: ShadowPageDictionary & {
    seedAction: string;
    revalidateAction: string;
  };
};
