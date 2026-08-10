/**
 * Suggestion Card Component
 * 
 * Purpose: Reusable card component for suggestion cards that can be used in intro state and as user messages
 * Used in: features/ai-assistant/components/ui/intro-suggestions.tsx and message-list.tsx
 * Why: Allows suggestion cards to be displayed as user message cards when clicked
 */

'use client';

import { SuggestionCard } from '../../config/intro-suggestions';
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

interface ItemTypeCardProps {
  card: SuggestionCard;
  onClick?: () => void;
  isMessage?: boolean; // If true, render as a message card instead of a button
}

export const ItemTypeCard = ({ card, onClick, isMessage = false }: ItemTypeCardProps) => {
  const styles = useAssistantStyleConfig();

  const cardContent = (
    <div
      className={`flex h-full gap-3 rounded p-4 transition-all duration-200 ${
        isMessage ? 'flex-row items-center' : 'flex-col items-start'
      } ${
        `${styles.suggestions?.cardClassName ?? ''} ${styles.suggestions?.cardHoverClassName ?? ''}`
      }`}
      style={{
        backgroundColor: card.backgroundColor,
        color: card.textColor,
      }}
    >
      <card.icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={styles.suggestions?.titleClassName}>{card.header}</h4>
        {card.description ? <p className={styles.suggestions?.descriptionClassName}>{card.description}</p> : null}
      </div>
    </div>
  );

  if (isMessage) {
    // Render as a message card (no button, just display)
    return cardContent;
  }

  // Render as a clickable button
  return (
    <button
      onClick={onClick}
      className="h-full w-full text-left"
    >
      {cardContent}
    </button>
  );
};
