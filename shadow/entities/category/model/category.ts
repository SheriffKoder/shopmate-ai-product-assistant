/**
 * Shadow Category Model
 *
 * Purpose: Defines pure domain types for shadow catalog categories.
 * Used in: shadow category transforms, repositories, queries, and future views.
 * Used for: Keeps page-facing category data independent from Supabase row details.
 */

import type { ShadowLocaleText } from '@/shadow/shared/model/localization';

export type ShadowCategory = {
  id: string;
  slug: string;
  name: ShadowLocaleText;
  description: ShadowLocaleText | null;
  sortOrder: number;
};

export type ShadowCategorySlugParam = {
  slug: string;
};

export type ShadowCategoryRow = {
  id: string;
  slug: string;
  name: unknown;
  description: unknown;
  sort_order: number;
};
