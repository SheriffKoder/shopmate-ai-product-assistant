/**
 * Shadow English Dictionary
 *
 * Purpose: Provides English copy for shadow public and development pages.
 * Used in: shadow dictionary lookup.
 * Used for: Keeps EN page, header, and dev labels centralized.
 */

import type { ShadowDictionary } from '@/shared/i18n/model/dictionary';

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
    categoryNavLabel: 'Product categories',
    emptyState: 'No products are available yet.',
    gridTitle: 'Products',
    resultCount: '{count} products found',
  },
  productDetail: {
    title: 'Shadow product',
    eyebrow: 'Product detail',
    description: 'A server-rendered product detail page for the shadow migration.',
    backToProducts: 'Back to products',
    colorsTitle: 'Available colors',
    descriptionTitle: 'Product details',
    featuresTitle: 'Key features',
    noImage: 'No image available',
    notFound: 'Product not found.',
    ratingLabel: '{rating} rating from {count} reviews',
    relatedEmptyState: 'No related products are available yet.',
    relatedTitle: 'Related products',
    viewLabel: 'view',
  },
  category: {
    title: 'Shadow category',
    eyebrow: 'Category listing',
    description: 'A server-rendered category page for the shadow migration.',
    emptyState: 'No products are available in this category yet.',
    gridTitle: 'Category products',
    resultCount: '{count} products found',
  },
  checkout: {
    title: 'Checkout',
    eyebrow: 'Local cart',
    description: 'Review the items saved in this browser before the database-backed cart phase.',
    actionLabel: 'Continue to payment',
    continueShopping: 'Continue shopping',
    emptyDescription: 'Add products to your cart before starting checkout.',
    emptyTitle: 'Your cart is empty',
    estimatedTotal: 'Estimated total',
    loading: 'Preparing your cart...',
    orderSummary: 'Order summary',
    quantityLabel: 'Quantity',
    subtotal: 'Subtotal',
  },
  checkoutSuccess: {
    title: 'Order confirmed',
    eyebrow: 'Success',
    description: 'This confirmation page uses mock customer data and the cart saved in this browser.',
    continueShopping: 'Continue shopping',
    customer: 'Customer',
    deliveryEstimate: 'Estimated delivery',
    emptyDescription: 'There are no local cart items to show in this mock confirmation.',
    emptyTitle: 'No receipt items found',
    items: 'Items',
    loading: 'Preparing your confirmation...',
    orderNumber: 'Order number',
    paymentMethod: 'Payment method',
    quantityLabel: 'Quantity',
    receipt: 'Receipt',
    totalPaid: 'Total paid',
  },
  dev: {
    title: 'Shadow dev tools',
    eyebrow: 'Development only',
    description: 'Seed, auth, and revalidation controls will live here.',
    actionsLabel: 'Shadow development actions',
    authAction: 'Prepare dev user',
    authDescription: 'Create or confirm the env-driven Supabase Auth user reserved for later assistant work.',
    authTitle: 'Dev user',
    seedAction: 'Seed catalog',
    seedDescription: 'Upsert the shadow initial categories and products into the configured prefixed tables.',
    seedTitle: 'Initial catalog',
    revalidateAction: 'Revalidate pages',
    revalidateDescription: 'Refresh shadow cache tags and public ISR paths after data changes.',
    revalidateTitle: 'Page cache',
  },
} satisfies ShadowDictionary;
