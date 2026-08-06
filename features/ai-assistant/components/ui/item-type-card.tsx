/**
 * Suggestion Card Component
 * 
 * Purpose: Reusable card component for suggestion cards that can be used in intro state and as user messages
 * Used in: features/ai-assistant/components/ui/intro-suggestions.tsx and message-list.tsx
 * Why: Allows suggestion cards to be displayed as user message cards when clicked
 */

'use client';

import { SuggestionCard } from '../../config/intro-suggestions';

interface ItemTypeCardProps {
  card: SuggestionCard;
  onClick?: () => void;
  isMessage?: boolean; // If true, render as a message card instead of a button
}

export const ItemTypeCard = ({ card, onClick, isMessage = false }: ItemTypeCardProps) => {

  const cardContent = (
    <div
      className={`flex h-full gap-3 rounded p-4 transition-all duration-200 ${
        isMessage ? 'flex-row items-center' : 'flex-col items-start'
      } ${
        isMessage 
          ? 'bg-gradient-to-r from-primary to-primary hover:bg-[#e0e0e0] text-foreground cursor-pointer text-left' 
          : 'bg-gradient-to-r from-primary to-primary hover:bg-[#e0e0e0] text-foreground cursor-pointer text-left'
      }`}
      style={{
        backgroundColor: card.backgroundColor,
        color: card.textColor,
      }}
    >
      <card.icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="mb-1 text-sm font-medium opacity-70">{card.header}</h4>
        {card.description ? <p className="text-xs opacity-90">{card.description}</p> : null}
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
