/**
 * Chat Wrapper Component
 * 
 * Purpose: Wraps the reusable chat container with header, history, and layout controls
 * Used in: ShopMate assistant integration and future assistant host integrations
 * Why: Keeps assistant presentation separate from app layout and provider ownership
 */

'use client';

import { useState, useEffect } from 'react';
import ChatContainer from '@/features/ai-assistant/chat-container';
import { SidebarHistory } from '@/features/ai-assistant/components/history-sidebar/components';
import { useSidebarRefresh } from '@/features/ai-assistant/components/history-sidebar/hooks/use-sidebar-refresh';
import { useCurrentChatId } from '@/features/ai-assistant/components/history-sidebar/utils/chat-navigation';
import type { AssistantToolRendererRegistry } from '@/features/ai-assistant/model/tool-renderer-registry';
import type { SuggestionSet } from './config/intro-suggestions';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';
import { AssistantShellHeader } from './components/shell/assistant-shell-header';
import { AssistantShellContent } from './components/shell/assistant-shell-content';
import { useAssistantShell } from './providers/assistant-shell-context';

interface ChatWrapperProps {
  chatId: string; // Fallback chatId if no searchParam
  isFullScreen?: boolean;
  toolRenderers?: AssistantToolRendererRegistry;
  endpoint?: string;
  suggestions?: SuggestionSet[];
  toolRendererContext?: unknown;
}

export const ChatWrapper = ({
  chatId: fallbackChatId,
  isFullScreen = false,
  toolRenderers,
  endpoint,
  suggestions,
  toolRendererContext,
}: ChatWrapperProps) => {
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const { isOpen } = useAssistantShell();
  //////////////////////////////////
  // Sidebar Refresh: Hook to manage sidebar refresh trigger
  // Why: Automatically refresh sidebar when chat finishes
  // How: Provides refreshTrigger state and triggerRefresh callback
  //////////////////////////////////
  const { refreshTrigger, triggerRefresh } = useSidebarRefresh();

  //////////////////////////////////
  // Fullscreen State: From context
  // Why: Allow toggling fullscreen via header icon, shared with artifact panel
  //////////////////////////////////
  const { isFullScreen: isFullScreenState, setIsFullScreen: setIsFullScreenState } = useFullscreen();

  // Initialize fullscreen state from prop if provided (only on mount)
  useEffect(function initializeFullscreenFromProp() {
    if (isFullScreen !== undefined) {
      setIsFullScreenState(isFullScreen);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount to initialize from prop

  //////////////////////////////////
  // Sidebar Open State: Control sidebar visibility
  // Why: Allow toggling sidebar via burger menu icon
  // Initialize as open if fullscreen is active
  //////////////////////////////////
  const [isSidebarOpen, setIsSidebarOpen] = useState(isFullScreenState);

  //////////////////////////////////
  // Effect: Auto-open sidebar when entering fullscreen, close when exiting
  // Why: Sidebar should be visible by default in fullscreen mode, hidden when not
  //////////////////////////////////
  useEffect(function syncSidebarWithFullscreen() {
    if (isFullScreenState) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isFullScreenState]);

  useEffect(function syncAssistantOpenState() {
    setIsChatCollapsed(!isOpen);
  }, [isOpen]);

  //////////////////////////////////
  // Current Chat ID: Get from URL search params or use fallback
  // Why: Chat ID should come from URL to support navigation
  // How: useCurrentChatId gets from searchParams, fallback to prop if not found
  //////////////////////////////////
  const urlChatId = useCurrentChatId();
  const currentChatId = urlChatId || fallbackChatId;

  return (
    <div
      className={`${isFullScreenState 
        ? 'w-full bottom-0 right-0' 
        : 'md:w-[400px] w-[calc(100%-24px)] bottom-2 md:bottom-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6'
      } rounded-lg overflow-hidden
      flex flex-col fixed transition-all duration-300 ease-in-out z-[100]
      ${isFullScreenState ? 'h-screen' : isChatCollapsed ? 'h-[60px]' : 'h-[calc(75vh)]'}`}
      style={{
        boxShadow: '0 0 10px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      <AssistantShellHeader
        isCollapsed={isChatCollapsed}
        isSidebarOpen={isSidebarOpen}
        isFullScreen={isFullScreenState}
        onToggleCollapsed={function toggleCollapsed() { setIsChatCollapsed((current) => !current); }}
        onToggleSidebar={function toggleSidebar() { setIsSidebarOpen((current) => !current); }}
        onToggleFullscreen={function toggleFullscreen() { setIsFullScreenState((current) => !current); }}
      />
      <AssistantShellContent
        isVisible={!isChatCollapsed || isFullScreenState}
        isSidebarOpen={isSidebarOpen}
        isFullScreen={isFullScreenState}
        sidebar={<SidebarHistory refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />}
      >
        <ChatContainer
            chatId={currentChatId} 
            urlChatId={urlChatId}
            onChatFinish={triggerRefresh} 
            toolRenderers={toolRenderers}
            endpoint={endpoint}
            suggestions={suggestions}
            toolRendererContext={toolRendererContext}
          />
      </AssistantShellContent>
    </div>
  );
};
