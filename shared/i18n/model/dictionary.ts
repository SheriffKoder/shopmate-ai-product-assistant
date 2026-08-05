/**
 * Shadow Dictionary Model
 *
 * Purpose: Defines the typed copy contract for shadow localized pages.
 * Used in: shadow i18n dictionaries, server views, and shadow widgets.
 * Used for: Keeps page and header copy out of JSX while preserving type safety.
 */

import type { ShadowLocale } from '@/shared/i18n/config';

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
    categoryNavLabel: string;
    emptyState: string;
    gridTitle: string;
    resultCount: string;
  };
  productDetail: ShadowPageDictionary & {
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
  category: ShadowPageDictionary & {
    emptyState: string;
    gridTitle: string;
    resultCount: string;
  };
  checkout: ShadowPageDictionary & {
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
  checkoutSuccess: ShadowPageDictionary & {
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
  dev: ShadowPageDictionary & {
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
