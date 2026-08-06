/**
 * @file features/ai-assistant/config/intro-suggestions.ts
 * Generic assistant suggestion contracts and neutral defaults.
 * Used in: generic assistant empty-state components.
 * Used for: Keeping business-specific suggestions in the host adapter.
 */

import type { LucideIcon } from 'lucide-react';

export interface SuggestionCard {
  icon: LucideIcon | string;
  backgroundColor: string;
  textColor: string;
  header: string;
  description: string;
}

export interface SuggestionSet {
  header: string;
  cards: SuggestionCard[];
}

/** Generic mode intentionally has no product-specific suggestions. */
export const introSuggestions: SuggestionSet[] = [];
