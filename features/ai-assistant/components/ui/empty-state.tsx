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
import type { SuggestionSet } from '../../config/intro-suggestions';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  onSuggestionClick: (prompt: string, card: any) => void;
  content?: ReactNode;
  suggestions?: SuggestionSet[];
}

export const EmptyState = ({ onSuggestionClick, content, suggestions }: EmptyStateProps) => {
  return (
    <ConversationEmptyState>
      <div className="w-full space-y-4">
        {content ?? (
          <div className="text-center">
            <p className="text-lg font-semibold mb-2 text-black">AI Assistant</p>
            <p className="text-sm text-black/70">How can I help?</p>
          </div>
        )}
        <IntroSuggestions onSuggestionClick={onSuggestionClick} suggestions={suggestions} />
      </div>
    </ConversationEmptyState>
  );
};
