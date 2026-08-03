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
import { useChatMessages } from './history-sidebar/hooks/use-chat-messages';
import { EmptyState } from './components/ui/empty-state';
import { MessageList } from './components/message-list';
import { PromptInput } from './components/prompt-input';
import { useShop } from '@/features/shop/providers/shop-context';
import { useToast } from '@/features/toast-success/use-toast';
import { getErrorConfig, getErrorLogMessage } from '@/features/toast-success/error-config';
import { useDataStream } from './data-stream/data-stream-provider';
import type { DataUIPart } from 'ai';
import type { ShopMateUIDataTypes } from './types/stream';
import { ArtifactPanel } from './artifacts/components/artifact-panel';
import { useUpdateChatIdInUrl } from './history-sidebar/utils/chat-navigation';

interface ChatContainerProps {
  chatId: string; // Combined chatId (URL or fallback)
  urlChatId: string | null; // URL chatId (null when cleared for new chat)
  userType: string;
  onChatFinish?: () => void;
}

const ChatContainer = ({ chatId, urlChatId, userType, onChatFinish }: ChatContainerProps) => {
  //////////////////////////////////
  // Shop Context: Provides products and cart state/operations
  // Why: Centralized state management, eliminates prop drilling
  //////////////////////////////////
  const { products, cart, dispatchCartAction } = useShop();
  
  //////////////////////////////////
  // Toast Hook: For user-friendly error notifications
  // Why: Provides consistent error messaging to users
  //////////////////////////////////
  const { showError, showWarning, showInfo } = useToast();
  
  //////////////////////////////////
  // Data Stream Access: For accumulating streaming data parts
  // Why: Need to store data parts from AI stream for processing by DataStreamHandler
  // How: setDataStream adds each data part to the stream array
  //////////////////////////////////
  const { setDataStream } = useDataStream();
  
  //////////////////////////////////
  // Chat Hook: To send messages to the API and receive responses
  // Why: To handle the chat functionality and display the messages
  // chatId: Unique identifier for this chat session (used for persistence, debugging, and future features)
  //////////////////////////////////
  const { messages, setMessages, sendMessage, status, regenerate } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: '/api/ai-assistant',
    }),
    //////////////////////////////////
    // onData Callback: Accumulate streaming data parts
    // Why: Each data part from AI stream needs to be stored for processing
    // How: Adds each part to the dataStream array
    // When: Called for each data part received from the AI stream
    // Note: Type assertion needed because onData receives generic data parts
    // If stream exists: append new data part
    // If stream is empty/null: initialize with first data part
    // Each data part is accumulated for processing by DataStreamHandler
    //////////////////////////////////
    onData: (dataPart) => {
      // Type assertion: onData receives generic data parts, but we know they're ShopMate types
      const typedDataPart = dataPart as DataUIPart<ShopMateUIDataTypes>;
      setDataStream((ds) => (ds ? [...ds, typedDataPart] : [typedDataPart]));
    },
    onError: (error) => {
      // Handle errors gracefully with user-friendly messages
      console.error('[ChatContainer] Chat error:', getErrorLogMessage(error));
      
      // Get error configuration from centralized config
      const errorConfig = getErrorConfig(error);
      
      // Show error toast to user
      showError(errorConfig.message, errorConfig.title, errorConfig.duration);
    },
    //////////////////////////////////
    // onFinish Callback: Trigger sidebar refresh and update URL
    // Why: 
    // 1. Update sidebar to show new chat in history
    // 2. Update URL with chatId if new chat was created (no chatId in URL yet)
    // How: 
    // 1. Call onChatFinish callback from parent to refresh sidebar
    // 2. Update URL params if urlChatId is null but chatId exists (new chat created)
    // Note: updateChatIdInUrl only updates if different, preventing rerenders
    //////////////////////////////////
    onFinish: () => {
      // Update URL if this is a new chat (no chatId in URL yet i.e user interacting with a new chat)
      // This happens when user sends first message in a new chat
      if (!urlChatId && chatId) {
        updateChatIdInUrl(chatId);
      }
      
      // Trigger sidebar refresh to show new chat
      if (onChatFinish) {
        onChatFinish();
      }
    },
  });

  //////////////////////////////////
  // Load Messages from Database: When chatId changes
  // Why: When user selects a chat from sidebar, load its messages
  // How: useChatMessages hook handles fetching and loading
  // Note: Pass urlChatId (not combined chatId) to detect when URL is cleared
  // Also pass currentChatId and hasMessages to prevent refetch when URL is updated after chat creation
  //////////////////////////////////
  const { isLoadingMessages } = useChatMessages({
    chatId: urlChatId, // Use URL chatId to detect when cleared for new chat
    setMessages,
    currentChatId: chatId, // Current chatId from useChat (to detect if we're already on this chat)
    hasMessages: messages.length > 0, // Whether messages already exist (to skip fetch if already loaded)
  });

  //////////////////////////////////
  // Update ChatId in URL: When new chat is created
  // Why: Keep URL in sync with current chat without causing rerender
  // How: Silently update URL params when chat finishes and URL doesn't have chatId
  //////////////////////////////////
  const updateChatIdInUrl = useUpdateChatIdInUrl();

  // Determine if we should show empty state or loading
  // Empty state: No messages AND no chatId in URL (new chat)
  // Loading: No messages BUT chatId exists in URL (loading existing chat)
  const shouldShowEmptyState = messages.length === 0 && !urlChatId;
  const shouldShowLoading = messages.length === 0 && urlChatId && isLoadingMessages;
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
    buildRequestBody: () => ({
      products,
      cart,
    }),
  });

  return (
    <>
      {/* Main Chat UI */}
      <div className="flex flex-col h-full">
        {/* Conversation: The conversation component that displays the messages */}
        <Conversation className="overflow-hidden bg-[#FFFFFF]">
          <ConversationContent className="flex-1 min-h-0 w-full h-full">
            
            {/* Empty State: Show when no messages and no chatId (new chat) */}
            {shouldShowEmptyState && (
              <EmptyState onSuggestionClick={handleSuggestionClick} />
            )}

            {/* Loading State: Show when chatId exists but messages are loading */}
            {shouldShowLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2 text-foreground/60">
                  {/* <Loader /> */}
                  <p className="text-sm">Loading chat...</p>
                </div>
              </div>
            )}

            {/* Message List: Show when messages exist or chat is loaded */}
            {messages.length > 0 && (
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

      {/* Artifact Panel: Split-screen view when artifact is visible */}
      <ArtifactPanel
        chatId={chatId}
        messages={messages}
        status={status}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        regenerate={regenerate}
        cart={cart}
        dispatchCartAction={dispatchCartAction}
      />
    </>
  );
};

export default ChatContainer;
