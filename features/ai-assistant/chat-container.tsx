'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Loader } from '@/components/ai-elements/loader';
import { useChatSubmission } from './hooks/use-chat-submission';
import { EmptyState } from './components/ui/empty-state';
import { MessageList } from './components/message-list';
import { PromptInput } from './components/prompt-input';
import { useShop } from '@/providers/shop-context';

interface ChatContainerProps {
  userType: string;
}

const ChatContainer = ({ userType }: ChatContainerProps) => {
  //////////////////////////////////
  // Shop Context: Provides products and cart state/operations
  // Why: Centralized state management, eliminates prop drilling
  //////////////////////////////////
  const { products, cart, dispatchCartAction } = useShop();
  
  //////////////////////////////////
  // Chat Hook: To send messages to the API and receive responses
  // Why: To handle the chat functionality and display the messages
  //////////////////////////////////
  const { messages, sendMessage, status, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai-assistant',
    }),
  });

  //////////////////////////////////
  // Chat Submission Hook: Handles input state and message submission
  //////////////////////////////////
  const {
    input,
    setInput,
    handleSubmit,
    handleSuggestionClick,
    clickedSuggestionCard,
  } = useChatSubmission({
    sendMessage,
    products: products,
    cart: cart,
  });

  return (
    <div className="flex flex-col h-full">
      {/* Conversation: The conversation component that displays the messages */}
      <Conversation className="overflow-hidden bg-[#FFFFFF]">
        <ConversationContent className="flex-1 min-h-0 w-full">
          
          {/* If there are no messages, show the empty state */}
          {messages.length === 0 ? (
            <EmptyState onSuggestionClick={handleSuggestionClick} />
          ) : (
            <MessageList
              messages={messages}
              clickedSuggestionCard={clickedSuggestionCard}
              sendMessage={sendMessage}
              regenerate={regenerate}
              status={status}
              cart={cart}
              dispatchCartAction={dispatchCartAction}
            />
          )}

          {/* Loader: if the status is submitted and no messages are being streamed, show the loader */}
          {(status === 'submitted' || status === 'streaming') && <Loader />}

        </ConversationContent>

        {/* Conversation Scroll Button: To scroll to the bottom of the conversation */}
        <ConversationScrollButton />

      </Conversation>

      {/* Prompt Input: the input area for the user to enter their message */}
      <PromptInput
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
      />
    </div>
  );
};

export default ChatContainer;

