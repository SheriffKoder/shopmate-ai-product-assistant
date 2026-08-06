/**
 * Category Model
 *
 * Purpose: Defines pure domain types for catalog categories.
 * Used in: category transforms, repositories, queries, and future views.
 * Used for: Keeps page-facing category data independent from Supabase row details.
 */

import type { LocaleText } from '@/shared/model/localization';

export type Category = {
  id: string;
  slug: string;
  name: LocaleText;
  description: LocaleText | null;
  sortOrder: number;
};

export type CategorySlugParam = {
  slug: string;
};

export type CategoryRow = {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  sort_order: number;
};
