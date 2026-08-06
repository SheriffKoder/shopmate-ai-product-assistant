/**
 * Product Model
 *
 * Purpose: Defines pure domain types for catalog products.
 * Used in: product transforms, repositories, queries, and future views.
 * Used for: Keeps page-facing product data independent from Supabase row details.
 */

import type { LocalizedList, LocaleText } from '@/shared/model/localization';

export type Product = {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  name: LocaleText;
  shortDescription: LocaleText;
  description: LocaleText;
  price: number;
  rating: number;
  reviewsCount: number;
  features: LocalizedList;
  imageUrl: string | null;
  imageUrlVariations: string[];
  isFeatured: boolean;
  keywords: string[];
  colors: string[];
};

export type ProductSlugParam = {
  slug: string;
};

export type ProductRow = {
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
