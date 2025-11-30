/**
 * Suggestion Card Component
 * 
 * Purpose: Reusable card component for suggestion cards that can be used in intro state and as user messages
 * Used in: features/ai-assistant/components/ui/intro-suggestions.tsx and message-list.tsx
 * Why: Allows suggestion cards to be displayed as user message cards when clicked
 */

'use client';

import Image from 'next/image';
import { SuggestionCard } from '../../config/intro-suggestions';

interface ItemTypeCardProps {
  card: SuggestionCard;
  onClick?: () => void;
  isMessage?: boolean; // If true, render as a message card instead of a button
}

export const ItemTypeCard = ({ card, onClick, isMessage = false }: ItemTypeCardProps) => {
  const cardContent = (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg transition-all duration-200 ${
        isMessage 
          ? 'bg-gradient-to-r from-primary to-secondary hover:bg-[#e0e0e0] cursor-pointer text-left' 
          : 'bg-gradient-to-r from-primary to-secondary hover:bg-[#e0e0e0] cursor-pointer text-left'
      }`}
      style={{
        color: card.textColor,
      }}
    >
      {/* Icon */}
      {/* <div className="flex-shrink-0 flex items-center justify-center">
        {card.icon ? (
          <div 
            className="w-12 h-12 flex items-center justify-center p-2 rounded-lg"
            style={{ backgroundColor: card.backgroundColor }}
          >
            <Image
              src={card.icon}
              alt={card.header}
              className="h-full w-full object-contain"
              width={40}
              height={40}
            />
          </div>
        ) : null}
        <div className={`icon-placeholder w-8 h-8 rounded-full bg-white/20 ${card.icon ? 'hidden' : ''}`} />
      </div> */}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm mb-1 text-white">{card.header}</h4>
        <p className="text-xs opacity-90 text-white/70">{card.description}</p>
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
      className="w-full text-left"
    >
      {cardContent}
    </button>
  );
};

