/**
 * @file features/ai-assistant/chat-container.tsx
 * Chat container: owns assistant conversation state, request submission, messages,
 * prompt input, and artifact panel composition.
 * Used in: features/ai-assistant/chat-wrapper.tsx.
 * Used for: Keeping the reusable chat body separate from app shell and header chrome.
 *
 * Steps:
 * 1. Wire useChat + data stream + model selection.
 * 2. On finish — refresh sidebar/URL; guests save via prepareGuestChatSave.
 * 3. Load history via useChatMessages; clear live thinking steps on chat change.
 * 4. Compose conversation UI, prompt, and artifact panel.
 */

'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/features/ai-assistant/components/generic/ai-elements/conversation';
import { useEffect, useRef, type ReactNode } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Loader } from '@/features/ai-assistant/components/generic/ai-elements/loader';
import { useChatSubmission } from './hooks/use-chat-submission';
import { useChatMessages } from './components/history-sidebar/hooks/use-chat-messages';
import { EmptyState } from './components/ui/empty-state';
import { MessageList } from './components/message-list';
import { PromptInput } from './components/prompt-input';
import { useDataStream } from './data-stream/data-stream-provider';
import type { DataUIPart } from 'ai';
import type { AssistantUIDataTypes } from './types/stream';
import type { SuggestionSet } from './config/intro-suggestions';
import { ArtifactPanel } from './components/artifacts/components/artifact-panel';
import { useUpdateChatIdInUrl } from './components/history-sidebar/utils/chat-navigation';
import { useAssistantModelSelection } from './hooks/use-assistant-model-selection';
import type { AssistantStreamPartRendererRegistry } from './model/stream-part-renderer-registry';
import type { AssistantToolRendererRegistry } from './model/tool-renderer-registry';
import { assistantApiEndpoints } from './model/api-endpoints';
import { getDictationConfig } from './dictation/model/dictation-config';
import { useArtifact } from './components/artifacts/hooks/use-artifact';
import { useUserSession } from './providers/user-session-context';
import { MessageSavingOrchestrator } from './message-persistence/saving-orchestrator';
import { prepareGuestChatSave } from './message-persistence/lib/prepare-guest-chat-save';

interface ChatContainerProps {
  chatId: string; // Combined chatId (URL or fallback)
  urlChatId: string | null; // URL chatId (null when cleared for new chat)
  onChatFinish?: () => void;
  toolRenderers?: AssistantToolRendererRegistry;
  streamPartRenderers?: AssistantStreamPartRendererRegistry;
  endpoint?: string;
  onError?: (error: unknown) => void;
  buildRequestBody?: () => Record<string, unknown>;
  toolRendererContext?: unknown;
  emptyState?: ReactNode;
  suggestions?: SuggestionSet[];
}

const ChatContainer = ({ chatId, urlChatId, onChatFinish, toolRenderers, streamPartRenderers, endpoint = assistantApiEndpoints.assistant, onError, buildRequestBody, toolRendererContext, emptyState, suggestions }: ChatContainerProps) => {
  
  //////////////////////////////////
  // Data Stream Access: For accumulating streaming data parts
  // Why: Need to store data parts from AI stream for processing by DataStreamHandler
  // How: setDataStream adds each data part to the stream array
  //////////////////////////////////
  const { setDataStream, assistantSteps, setAssistantSteps } = useDataStream();
  const { setArtifact } = useArtifact();
  // Keep a ref so guest localStorage save always sees the latest steps (useChat may
  // hold a stale onFinish closure over the render that started the request).
  const assistantStepsRef = useRef(assistantSteps);
  assistantStepsRef.current = assistantSteps;

  //////////////////////////////////
  // Assistant Model Selection: Reusable model picker state included in every request
  // Why: Keeps hard-coded model ids out of the assistant runtime while allowing user switching
  //////////////////////////////////
  const { selectedModelId, modelOptions, setSelectedModelId } = useAssistantModelSelection();
  const { user } = useUserSession();
  const savingOrchestrator = new MessageSavingOrchestrator(user ? 'database' : 'local');

  // Dictation integration: injects client-safe provider settings without coupling the assistant shell to a provider.
  const dictationConfig = getDictationConfig();
  
  //////////////////////////////////
  // Chat Hook: To send messages to the API and receive responses
  // Why: To handle the chat functionality and display the messages
  // chatId: Unique identifier for this chat session (used for persistence, debugging, and future features)
  //////////////////////////////////
  const { messages, setMessages, sendMessage, status, regenerate } = useChat({
    id: chatId,
    transport: new DefaultChatTransport({
      api: endpoint,
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
      // The host may narrow these generic parts in its injected stream handler.
      const typedDataPart = dataPart as DataUIPart<AssistantUIDataTypes>;
      setDataStream((ds) => (ds ? [...ds, typedDataPart] : [typedDataPart]));
    },
    onError: (error) => {
      // Handle errors gracefully with user-friendly messages
      onError?.(error);
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
    onFinish: ({ messages: finishedMessages }) => {
      // Update URL if this is a new chat (no chatId in URL yet i.e user interacting with a new chat)
      // This happens when user sends first message in a new chat
      if (!urlChatId && chatId) {
        updateChatIdInUrl(chatId);
      }
      
      // Trigger sidebar refresh to show new chat
      if (onChatFinish) {
        onChatFinish();
      }

      // Guest: persist the finished turn (title + thinking-steps snapshot) to localStorage.
      // Signed-in chats are saved on the server in handle-assistant-request onFinish.
      if (!user) {
        const prepared = prepareGuestChatSave({
          messages: finishedMessages,
          thinkingSteps: assistantStepsRef.current,
        });
        savingOrchestrator.saveLocalChat({
          chatId,
          title: prepared.title,
          messages: prepared.messages,
        });
      }
    },
  });

  useEffect(function synchronizeProgressLifecycle() {
    if (status === 'submitted') {
      // Every submission owns a fresh progress sequence.
      setAssistantSteps([]);
      return;
    }

    if (status === 'error') {
      // Preserve completed work while making an interrupted active step honest.
      setAssistantSteps((steps) => steps.map((step) => (
        step.status === 'loading' ? { ...step, status: 'error' } : step
      )));
    }
  }, [setAssistantSteps, status]);

  useEffect(function clearProgressWhenChatChanges() {
    // Switching history sessions must not display the previous request's progress.
    setAssistantSteps([]);
  }, [chatId, setAssistantSteps]);

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
    setArtifact,
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
  // Tool renderer context is intentionally owned by the host adapter.
  //////////////////////////////////
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
    selectedModelId,
    buildRequestBody,
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
              <EmptyState onSuggestionClick={handleSuggestionClick} content={emptyState} suggestions={suggestions} />
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
                toolRenderers={toolRenderers}
                streamPartRenderers={streamPartRenderers}
                toolRendererContext={toolRendererContext}
                assistantSteps={assistantSteps}
              />
            )}

            {/* Loader: if the status is submitted and no messages are being streamed, show the loader */}
            {(status === 'submitted' || status === 'streaming') && <Loader />}

            {/* Conversation spacing: creates real scrollable room after the final message above the prompt input. */}
            <div aria-hidden="true" className="h-8 shrink-0" />

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
          selectedModelId={selectedModelId}
          modelOptions={modelOptions}
          onModelChange={setSelectedModelId}
          dictationConfig={dictationConfig}
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
        toolRenderers={toolRenderers}
        streamPartRenderers={streamPartRenderers}
        toolRendererContext={toolRendererContext}
      />
    </>
  );
};

export default ChatContainer;
