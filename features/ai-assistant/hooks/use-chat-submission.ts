/**
 * Chat Submission Hook
 * 
 * Purpose: Handles message submission logic and suggestion clicks
 * Used in: chat-container.tsx
 * Why: Separates submission logic from UI rendering
 */

import { useState } from 'react';
import { CartState } from '../types/cart';

interface UseChatSubmissionProps {
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
  products: any[]; // Array of Product objects
  cart?: CartState; // Cart state
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
  products,
  cart,
}: UseChatSubmissionProps): UseChatSubmissionReturn {
  const [input, setInput] = useState('');
  const [clickedSuggestionCard, setClickedSuggestionCard] = useState<any>(null);

  /**
   * Prepare message body with product catalog and cart
   */
  const prepareMessageBody = () => {
    return {
      products, // Send product catalog to the API
      cart, // Send cart state to the API
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

