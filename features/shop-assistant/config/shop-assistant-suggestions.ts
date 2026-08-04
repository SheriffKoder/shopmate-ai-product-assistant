/**
 * Intro Suggestions Configuration
 * 
 * Purpose: Defines suggestion cards displayed in the empty chat state
 * Used in: features/ai-assistant/components/intro-suggestions.tsx
 * Why: Centralized configuration for suggestion cards with icons, colors, and prompts
 */

export interface SuggestionCard {
  icon: string; // Image URL
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
    header: 'Discover Products',
    cards: [
      {
        icon: '/images/intro/smartphone.png',
        backgroundColor: '#00578E',
        textColor: '#ffffff',
        header: 'Show me the best smartphones',
        description: 'Explore top-rated smartphones with latest features',
      },
      {
        icon: '/images/intro/laptop.png',
        backgroundColor: '#60263D',
        textColor: '#ffffff',
        header: 'What are your top-rated laptops?',
        description: 'Find powerful laptops for work and creativity',
      },
      {
        icon: '/images/intro/tablet.png',
        backgroundColor: '#372D80',
        textColor: '#ffffff',
        header: 'Show me tablets',
        description: 'Discover tablets for productivity and entertainment',
      },
      {
        icon: '/images/intro/headphones.png',
        backgroundColor: '#3A6F5A',
        textColor: '#ffffff',
        header: 'Best headphones and earbuds',
        description: 'Find premium audio devices for music and calls',
      },
    ],
  },
  {
    header: 'Get Recommendations',
    cards: [
      {
        icon: '/images/intro/budget.png',
        backgroundColor: '#004BAE',
        textColor: '#ffffff',
        header: 'What\'s the best product under $500?',
        description: 'Get recommendations based on your budget',
      },
      {
        icon: '/images/intro/compare.png',
        backgroundColor: '#8B4513',
        textColor: '#ffffff',
        header: 'Compare gaming laptops',
        description: 'Compare features and prices of gaming laptops',
      },
      {
        icon: '/images/intro/latest.png',
        backgroundColor: '#C71585',
        textColor: '#ffffff',
        header: 'Tell me about your latest products',
        description: 'Discover our newest and most innovative products',
      },
    ],
  },
];

