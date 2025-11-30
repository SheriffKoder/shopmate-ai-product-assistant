/**
 * Prompt Input Component
 * 
 * Purpose: Displays the input area for user messages
 * Used in: calendar-chat.tsx
 * Why: Separates input UI from main component
 */

'use client';

import { Input } from '@/components/ui/input';
import { ChevronRightIcon, Loader2 } from 'lucide-react';

interface PromptInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: () => void;
  status: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
}

export const PromptInput = ({
  input,
  setInput,
  handleSubmit,
  status,
}: PromptInputProps) => {
  return (
    <div className="flex items-center gap-1 border-2 m-2 rounded-lg p-1 border-[#dbdbdb] flex-shrink-0">
      {/* Input: the input area for the user to enter their message */}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="Ask about any product..."
        disabled={status === 'streaming'}
        className="flex-1 border-none bg-white/10 focus:bg-white/15 focus-visible:ring-[0px] transition-all duration-300 text-black"
      />

      {/* Submit Button: To submit the user's message */}
      <button
        onClick={handleSubmit}
        disabled={status === 'streaming' || !input.trim()}
        className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
        bg-gradient-to-r from-primary to-secondary hover:opacity-90 cursor-pointer transition-all duration-300 text-white"
      >
        {status === 'streaming' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ChevronRightIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

