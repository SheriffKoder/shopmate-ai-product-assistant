/**
 * Intro Suggestions Configuration
 * 
 * Purpose: Defines suggestion cards displayed in the empty chat state
 * Used in: features/ai-assistant/components/intro-suggestions.tsx
 * Why: Centralized configuration for suggestion cards with icons, colors, and prompts
 */

import { Bot, FileSpreadsheet, Laptop, Search, ShoppingCart } from 'lucide-react';

export interface SuggestionCard {
  icon: typeof Bot; // Lucide icon component
  backgroundColor: string; // Background color for the card
  textColor: string; // Text color for the card
  header: string; // Header text (used as prompt when clicked)
  description: string; // Description text
}

export interface SuggestionSet {
  header: string; // Section header
  cards: SuggestionCard[]; // Array of cards in this set
}

export const introSuggestions: SuggestionSet[] = [
  {
    header: 'Try tools',
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
        header: 'All products table',
        description: '',
      },
      {
        icon: Laptop,
        backgroundColor: 'var(--color-foreground)',
        textColor: 'var(--color-foreground)',
        header: 'Windows vs Mac laptops',
        description: '',
      },
    ],
  },
];
