/**
 * Empty State Component
 * 
 * Purpose: Displays the empty state when there are no messages
 * Used in: calendar-chat.tsx
 * Why: Separates empty state UI from main component
 */

'use client';

import { ConversationEmptyState } from '@/features/ai-assistant/components/generic/ai-elements/conversation';
import { IntroSuggestions } from './intro-suggestions';
import type { SuggestionSet } from '../../config/intro-suggestions';
import type { ReactNode } from 'react';
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

interface EmptyStateProps {
  onSuggestionClick: (prompt: string, card: any) => void;
  content?: ReactNode;
  suggestions?: SuggestionSet[];
}

export const EmptyState = ({ onSuggestionClick, content, suggestions }: EmptyStateProps) => {
  const styles = useAssistantStyleConfig();
  return (
    <ConversationEmptyState>
      <div className="w-full space-y-4">
        {content ?? (
          <div className="text-center">
            <p className={`text-sm font-semibold mb-2 ${styles.emptyState?.className ?? ''}`}>{styles.emptyState?.title ?? 'AI Assistant'}</p>
            <p className="text-xl text-black/70">{styles.emptyState?.description ?? 'Ask about products, orders, or your cart.'}</p>
          </div>
        )}
        <IntroSuggestions onSuggestionClick={onSuggestionClick} suggestions={suggestions} />
      </div>
    </ConversationEmptyState>
  );
};
