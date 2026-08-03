/**
 * Shadow English Dictionary
 *
 * Purpose: Provides English copy for shadow public and development pages.
 * Used in: shadow dictionary lookup.
 * Used for: Keeps EN page, header, and dev labels centralized.
 */

import type { ShadowDictionary } from '@/shadow/shared/i18n/model/dictionary';

export const shadowEnDictionary = {
  common: {
    brandName: 'ShopMate',
    home: 'Home',
    products: 'Products',
    language: 'Language',
    localeNames: {
      en: 'English',
      ar: 'Arabic',
    },
  },
  header: {
    navigation: {
      label: 'Shadow navigation',
      home: 'Home',
      products: 'Products',
    },
  },
  home: {
    title: 'Shadow home',
    eyebrow: 'Server-first catalog',
    description: 'A localized catalog page that will read products and categories from Supabase.',
    heroAction: 'Browse products',
    categoriesTitle: 'Shop by category',
    featuredTitle: 'Featured products',
    latestTitle: 'Latest arrivals',
    emptyState: 'No catalog products are available yet.',
  },
  products: {
    title: 'Shadow products',
    eyebrow: 'Catalog listing',
    description: 'A server-rendered product listing for the shadow migration.',
    allCategories: 'All categories',
    categoryFilterLabel: 'Product categories',
    emptyState: 'No products are available yet.',
    filteredByCategory: 'Products in {category}',
    filteredByCategoryAndSearch: 'Products in {category} matching "{search}"',
    filteredBySearch: 'Search results for "{search}"',
    gridTitle: 'Products',
    resultCount: '{count} products found',
  },
  productDetail: {
    title: 'Shadow product',
    eyebrow: 'Product detail',
    description: 'A server-rendered product detail page for the shadow migration.',
    notFound: 'Product not found.',
  },
  category: {
    title: 'Shadow category',
    eyebrow: 'Category listing',
    description: 'A server-rendered category page for the shadow migration.',
    emptyState: 'No products are available in this category yet.',
    gridTitle: 'Category products',
    resultCount: '{count} products found',
  },
  dev: {
    title: 'Shadow dev tools',
    eyebrow: 'Development only',
    description: 'Seed, auth, and revalidation controls will live here.',
    seedAction: 'Seed catalog',
    revalidateAction: 'Revalidate pages',
  },
} satisfies ShadowDictionary;
