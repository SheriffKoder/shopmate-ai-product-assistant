/**
 * Dictionary Model
 *
 * Purpose: Defines the typed copy contract for localized pages.
 * Used in: i18n dictionaries, server views, and widgets.
 * Used for: Keeps page and header copy out of JSX while preserving type safety.
 */

import type { AppLocale } from '@/shared/i18n/config';

type NavigationDictionary = {
  label: string;
  home: string;
  products: string;
};

type CommonDictionary = {
  brandName: string;
  home: string;
  products: string;
  language: string;
  localeNames: Record<AppLocale, string>;
};

type PageDictionary = {
  title: string;
  eyebrow: string;
  description: string;
};

export type AppDictionary = {
  common: CommonDictionary;
  header: {
    navigation: NavigationDictionary;
  };
  home: PageDictionary & {
    heroAction: string;
    categoriesTitle: string;
    featuredTitle: string;
    featuredAction: string;
    latestTitle: string;
    emptyState: string;
  };
  products: PageDictionary & {
    categoryNavLabel: string;
    emptyState: string;
    gridTitle: string;
    resultCount: string;
  };
  productDetail: PageDictionary & {
    backToProducts: string;
    colorsTitle: string;
    descriptionTitle: string;
    featuresTitle: string;
    noImage: string;
    notFound: string;
    ratingLabel: string;
    relatedEmptyState: string;
    relatedTitle: string;
    viewLabel: string;
  };
  category: PageDictionary & {
    emptyState: string;
    gridTitle: string;
    resultCount: string;
  };
  checkout: PageDictionary & {
    actionLabel: string;
    continueShopping: string;
    emptyDescription: string;
    emptyTitle: string;
    estimatedTotal: string;
    loading: string;
    orderSummary: string;
    quantityLabel: string;
    subtotal: string;
  };
  checkoutSuccess: PageDictionary & {
    continueShopping: string;
    customer: string;
    deliveryEstimate: string;
    emptyDescription: string;
    emptyTitle: string;
    items: string;
    loading: string;
    orderNumber: string;
    paymentMethod: string;
    quantityLabel: string;
    receipt: string;
    totalPaid: string;
  };
  dev: PageDictionary & {
    actionsLabel: string;
    authAction: string;
    authDescription: string;
    authTitle: string;
    seedAction: string;
    seedDescription: string;
    seedTitle: string;
    revalidateAction: string;
    revalidateDescription: string;
    revalidateTitle: string;
  };
};
