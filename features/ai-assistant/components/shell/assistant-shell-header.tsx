/**
 * @file features/ai-assistant/ui/shell/assistant-shell-header.tsx
 * Assistant shell header: renders identity and shell controls only.
 * Used in: ChatWrapper.
 * Used for: Keeping collapse, sidebar, and fullscreen interactions out of the shell layout.
 */

'use client';

import Image from 'next/image';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

interface AssistantShellHeaderProps {
  isCollapsed: boolean;
  isSidebarOpen: boolean;
  isFullScreen: boolean;
  onToggleCollapsed: () => void;
  onToggleSidebar: () => void;
  onToggleFullscreen: () => void;
}

/** Renders the assistant header and delegates all state changes to ChatWrapper. */
export function AssistantShellHeader({
  isCollapsed,
  isSidebarOpen,
  isFullScreen,
  onToggleCollapsed,
  onToggleSidebar,
  onToggleFullscreen,
}: AssistantShellHeaderProps) {
  function handleHeaderKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!isFullScreen && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onToggleCollapsed();
    }
  }

  function handleSidebarClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onToggleSidebar();
  }

  function handleFullscreenClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onToggleFullscreen();
  }

  return (
    <div
      onClick={isFullScreen ? undefined : onToggleCollapsed}
      className={`p-4 font-semibold flex flex-row items-center justify-between gap-2 transition-colors
        ${isFullScreen ? 'cursor-default' : 'cursor-pointer'}
        ${isCollapsed ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gradient-to-r from-black to-black'}`}
      role="button"
      tabIndex={0}
      aria-label={isCollapsed ? 'Expand chat' : 'Collapse chat'}
      onKeyDown={handleHeaderKeyDown}
    >
      <div className="flex flex-row items-center gap-2">
        <Image src="/images/icon.png" alt="AI Assistant" width={24} height={24} />
        <span className="text-white">AI Assistant</span>
      </div>

      <div className="flex flex-row items-center gap-2">
        <button
          type="button"
          onClick={handleSidebarClick}
          className={`p-1 rounded-md hover:bg-white/10 cursor-pointer ${
            isCollapsed ? 'pointer-events-none opacity-0' : 'opacity-100 delay-200'
          }`}
          aria-hidden={isCollapsed}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          tabIndex={isCollapsed ? -1 : 0}
          title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5 text-white" /> : <PanelLeftOpen className="w-5 h-5 text-white" />}
        </button>

        <button
          type="button"
          onClick={handleFullscreenClick}
          className="p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          aria-label={isFullScreen ? 'Exit compact mode' : 'Enter full screen'}
          title={isFullScreen ? 'Exit compact mode' : 'Enter full screen'}
        >
          {isFullScreen ? <Minimize2 className="w-5 h-5 text-white" /> : <Maximize2 className="w-5 h-5 text-white" />}
        </button>

        {!isFullScreen && (
          <div className="p-1" aria-hidden="true">
            {isCollapsed ? <ChevronUp className="w-5 h-5 text-white" /> : <ChevronDown className="w-5 h-5 text-white" />}
          </div>
        )}
      </div>
    </div>
  );
}
