/**
 * Shadow Product Model
 *
 * Purpose: Defines pure domain types for shadow catalog products.
 * Used in: shadow product transforms, repositories, queries, and future views.
 * Used for: Keeps page-facing product data independent from Supabase row details.
 */

import type { ShadowLocalizedList, ShadowLocaleText } from '@/shadow/shared/model/localization';

export type ShadowProduct = {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  name: ShadowLocaleText;
  shortDescription: ShadowLocaleText;
  description: ShadowLocaleText;
  price: number;
  rating: number;
  reviewsCount: number;
  features: ShadowLocalizedList;
  imageUrl: string | null;
  imageUrlVariations: string[];
  isFeatured: boolean;
  keywords: string[];
  colors: string[];
};

export type ShadowProductSlugParam = {
  slug: string;
};

export type ShadowProductRow = {
  id: string;
  slug: string;
  category_id: string;
  name: unknown;
  short_description: unknown;
  description: unknown;
  price: number | string;
  rating: number | string;
  reviews_count: number;
  features: unknown;
  image_url: string | null;
  image_url_variations: string[] | null;
  is_featured: boolean;
  keywords: string[] | null;
  colors: string[] | null;
  category: {
    slug: string;
  } | null;
};
