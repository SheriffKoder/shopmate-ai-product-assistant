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
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

interface IntroSuggestionsProps {
  onSuggestionClick: (prompt: string, card: any) => void; // Callback when a suggestion card is clicked (now includes card data)
  suggestions?: SuggestionSet[];
}

export const IntroSuggestions = ({ onSuggestionClick, suggestions = defaultIntroSuggestions }: IntroSuggestionsProps) => {
  const styles = useAssistantStyleConfig();
  const handleCardClick = (card: any) => {
    onSuggestionClick(card.header, card);
  };

  return (
    <div className="w-full space-y-6">
      {suggestions.map((set: SuggestionSet, setIndex: number) => (
        <div key={setIndex} className={styles.suggestions?.groupClassName}>
          {/* Set Header */}
          <h3 className={styles.suggestions?.headerClassName}>
            {set.header}
          </h3>
          
          {/* Cards Grid */}
          <div className={styles.suggestions?.gridClassName}>
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
