/**
 * Chat Submission Hook
 * 
 * Purpose: Handles message submission logic and suggestion clicks
 * Used in: chat-container.tsx
 * Why: Separates submission logic from UI rendering
 */

import { useState } from 'react';
import { useUserSession } from '../providers/user-session-context';

type ChatRequestBody = Record<string, unknown>;

interface UseChatSubmissionProps {
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
  buildRequestBody?: () => ChatRequestBody;
  selectedModelId?: string;
}

interface UseChatSubmissionReturn {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: () => void;
  handleSuggestionClick: (prompt: string, card: any) => void;
  clickedSuggestionCard: any;
}

/**
 * Hook for managing chat input and message submission
 */
export function useChatSubmission({
  sendMessage,
  buildRequestBody,
  selectedModelId,
}: UseChatSubmissionProps): UseChatSubmissionReturn {
  const [input, setInput] = useState('');
  const [clickedSuggestionCard, setClickedSuggestionCard] = useState<any>(null);
  const { user } = useUserSession();

  /**
   * Prepare message body with adapter-provided business context
   */
  const prepareMessageBody = () => {
    // 1. Ask the adapter for business context that should travel with the request.
    const businessBody = buildRequestBody ? buildRequestBody() : {};

    // 2. Add reusable assistant model selection without coupling callers to ShopMate.
    return {
      ...businessBody,
      ...(selectedModelId && { modelId: selectedModelId }),
      persistenceMode: user ? 'database' : 'local',
    };
  };

  /**
   * Handle form submission
   */
  const handleSubmit = () => {
    // Trim the input text and check if it is empty
    const text = input.trim();
    if (!text) return;

    // Send the message to the API
    sendMessage(
      { 
        text: text,
      },
      {
        body: prepareMessageBody(),
      }
    );
    setInput('');
  };

  /**
   * Handle suggestion card click
   */
  const handleSuggestionClick = (prompt: string, card: any) => {
    // Store the clicked card to render as a message
    setClickedSuggestionCard(card);
    
    // Send the message to the API with the prompt text
    sendMessage(
      { 
        text: prompt,
      },
      {
        body: prepareMessageBody(),
      }
    );
    setInput('');
  };

  return {
    input,
    setInput,
    handleSubmit,
    handleSuggestionClick,
    clickedSuggestionCard,
  };
}
