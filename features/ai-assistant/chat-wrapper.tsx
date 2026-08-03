/**
 * Chat Wrapper Component
 * 
 * Purpose: Wraps the reusable chat container with header, history, and layout controls
 * Used in: ShopMate assistant integration and future assistant host integrations
 * Why: Keeps assistant presentation separate from app layout and provider ownership
 */

'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, FileClock, FileXCorner } from 'lucide-react';
import ChatContainer from '@/features/ai-assistant/chat-container';
import { SidebarHistory } from '@/features/ai-assistant/history-sidebar/components';
import { useSidebarRefresh } from '@/features/ai-assistant/history-sidebar/hooks/use-sidebar-refresh';
import { useCurrentChatId } from '@/features/ai-assistant/history-sidebar/utils/chat-navigation';
import type { AssistantToolRendererRegistry } from '@/features/ai-assistant/model/tool-renderer-registry';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';

interface ChatWrapperProps {
  chatId: string; // Fallback chatId if no searchParam
  isChatCollapsed: boolean;
  setIsChatCollapsed: (collapsed: boolean) => void;
  isFullScreen?: boolean;
  toolRenderers?: AssistantToolRendererRegistry;
}

export const ChatWrapper = ({
  chatId: fallbackChatId,
  isChatCollapsed,
  setIsChatCollapsed,
  isFullScreen = false,
  toolRenderers,
}: ChatWrapperProps) => {
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
      <div
        onClick={() => {
          if (!isFullScreenState) {
            setIsChatCollapsed(!isChatCollapsed);
          }
        }}
        className={`p-4 font-semibold flex flex-row items-center justify-between gap-2 transition-colors
          ${isFullScreenState ? 'cursor-default' : 'cursor-pointer'}
          ${isChatCollapsed ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-black to-black'}`}
        role="button"
        tabIndex={0}
        aria-label={isChatCollapsed ? 'Expand chat' : 'Collapse chat'}
        onKeyDown={(e) => {
          if (!isFullScreenState && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setIsChatCollapsed(!isChatCollapsed);
          }
        }}
      >
        <div className="flex flex-row items-center gap-2">
          <Image src="/images/icon.png" alt="Liora AI Assistant" width={24} height={24} />
          <span className="text-white">AI Assistant</span>
        </div>
        
        {/* Header Controls: User-facing history, fullscreen, and collapse controls */}
        <div className="flex flex-row items-center gap-2">
          {/* Burger Menu: Toggle Sidebar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen((prev) => !prev);
            }}
            className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {isSidebarOpen ? (
              <FileXCorner className="w-5 h-5 text-white" />
            ) : (
              <FileClock className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullScreenState((prev) => !prev);
            }}
            className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={isFullScreenState ? 'Exit compact mode' : 'Enter full screen'}
            title={isFullScreenState ? 'Exit compact mode' : 'Enter full screen'}
          >
            {isFullScreenState ? (
              <Minimize2 className="w-5 h-5 text-white" />
            ) : (
              <Maximize2 className="w-5 h-5 text-white" />
            )}
          </button>
          
          {/* Chevron: Collapse/Expand - Hidden in fullscreen */}
          {!isFullScreenState && (
            <div className="p-1">
              {isChatCollapsed ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </div>
          )}
        </div>
      </div>
      {/* Content Area: Sidebar and ChatContainer */}
      <div 
        className={`flex-1 w-full min-h-0 overflow-hidden transition-opacity duration-300 bg-[#FFFFFF] relative ${
          isChatCollapsed && !isFullScreenState ? 'hidden' : 'flex'
        }`}
      >
        {/* Sidebar: Absolute positioned on left, toggleable */}
        <div 
          className={`
            absolute left-0 top-0 h-full w-64
            border-r border-gray-200 dark:border-gray-800 
            bg-gray-50 dark:bg-gray-900 
            overflow-y-auto z-20
            transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            
          `}
        >
          <SidebarHistory refreshTrigger={refreshTrigger} triggerRefresh={triggerRefresh} />
        </div>
        
        {/* ChatContainer: Flexible, with padding when sidebar is open in fullscreen */}
        <div 
          className={`
            flex-1 min-w-0 overflow-hidden bg-[#FFFFFF] flex flex-col
            transition-all duration-300 ease-in-out
            ${isSidebarOpen && isFullScreenState ? 'pl-64' : ''}
          `}
        >
          <ChatContainer 
            chatId={currentChatId} 
            urlChatId={urlChatId}
            onChatFinish={triggerRefresh} 
            toolRenderers={toolRenderers}
          />
        </div>
      </div>
    </div>
  );
};
