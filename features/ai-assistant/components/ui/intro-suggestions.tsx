/**
 * Intro Suggestions Component
 * 
 * Purpose: Displays suggestion cards in the empty chat state
 * Used in: features/calendar-scheduling/components/calendar-chat.tsx
 * Why: Provides quick action buttons for common user intents
 */

'use client';

import { introSuggestions as defaultIntroSuggestions, SuggestionSet } from '../../config/intro-suggestions';
import { ItemTypeCard } from './item-type-card';

interface IntroSuggestionsProps {
  onSuggestionClick: (prompt: string, card: any) => void; // Callback when a suggestion card is clicked (now includes card data)
  suggestions?: SuggestionSet[];
}

export const IntroSuggestions = ({ onSuggestionClick, suggestions = defaultIntroSuggestions }: IntroSuggestionsProps) => {
  const handleCardClick = (card: any) => {
    onSuggestionClick(card.header, card);
  };

  return (
    <div className="w-full space-y-6">
      {suggestions.map((set: SuggestionSet, setIndex: number) => (
        <div key={setIndex} className="space-y-3">
          {/* Set Header */}
          <h3 className="text-left text-sm font-semibold text-black/70 uppercase tracking-wide">
            {set.header}
          </h3>
          
          {/* Cards Grid */}
          <div className="grid grid-cols-3 gap-3">
            {set.cards.map((card, cardIndex: number) => (
              <ItemTypeCard
                key={cardIndex}
                card={card}
                onClick={() => handleCardClick(card)}
                isMessage={false}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
