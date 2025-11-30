/**
 * Empty State Component
 * 
 * Purpose: Displays the empty state when there are no messages
 * Used in: calendar-chat.tsx
 * Why: Separates empty state UI from main component
 */

'use client';

import { ConversationEmptyState } from '@/components/ai-elements/conversation';
import { IntroSuggestions } from './intro-suggestions';

interface EmptyStateProps {
  onSuggestionClick: (prompt: string, card: any) => void;
}

export const EmptyState = ({ onSuggestionClick }: EmptyStateProps) => {
  return (
    <ConversationEmptyState>
      <div className="w-full space-y-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2 text-black">Product Assistant</p>
          <p className="text-sm text-black/70">
            Hi! I'm your AI assistant. I can help you find the best products for your needs
          </p>
        </div>
        <IntroSuggestions onSuggestionClick={onSuggestionClick} />
      </div>
    </ConversationEmptyState>
  );
};

