/**
 * @file features/shop-assistant/config/shop-assistant-suggestions.ts
 * Intro suggestion chips for the empty Shop Assistant chat.
 * Used in: ui/integration/shop-assistant-config.tsx.
 * Used for: Prompting catalog cards, cart, sheet, and technical document paths.
 *
 * Function Index:
 * introSuggestions: Suggestion sets shown before the first message.
 */

import { FileSpreadsheet, Laptop, Search, ShoppingCart } from 'lucide-react';

export interface SuggestionCard {
  icon: typeof Search;
  backgroundColor: string;
  textColor: string;
  header: string;
  description: string;
}

export interface SuggestionSet {
  header: string;
  cards: SuggestionCard[];
}

export const introSuggestions: SuggestionSet[] = [
  {
    header: 'Try shopping',
    cards: [
      {
        icon: Search,
        backgroundColor: 'var(--color-foreground)',
        textColor: 'var(--color-foreground)',
        header: 'Show me smart phones',
        description: '',
      },
      {
        icon: ShoppingCart,
        backgroundColor: 'var(--color-foreground)',
        textColor: 'var(--color-foreground)',
        header: 'Edit my cart',
        description: '',
      },
    ],
  },
  {
    header: 'Artifacts',
    cards: [
      {
        icon: FileSpreadsheet,
        backgroundColor: 'var(--color-foreground)',
        textColor: 'var(--color-foreground)',
        header: 'All available products in ShopMate in a table',
        description: '',
      },
      {
        icon: Laptop,
        backgroundColor: 'var(--color-foreground)',
        textColor: 'var(--color-foreground)',
        header: 'A document about Windows vs Mac laptops',
        description: '',
      },
    ],
  },
];
