/**
 * @file features/ai-assistant/ui/shell/assistant-shell-content.tsx
 * Assistant shell content: positions history and the active chat panel.
 * Used in: ChatWrapper.
 * Used for: Keeping sidebar layout separate from shell controls and chat behavior.
 */

'use client';

import type { ReactNode } from 'react';

interface AssistantShellContentProps {
  isVisible: boolean;
  isSidebarOpen: boolean;
  isFullScreen: boolean;
  sidebar: ReactNode;
  children: ReactNode;
}

/** Renders the shell content area and applies only layout-level state. */
export function AssistantShellContent({
  isVisible,
  isSidebarOpen,
  isFullScreen,
  sidebar,
  children,
}: AssistantShellContentProps) {
  return (
    <div
      className={`flex-1 w-full min-h-0 overflow-hidden transition-opacity duration-300 bg-[#FFFFFF] relative ${
        isVisible ? 'flex' : 'hidden'
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-y-auto z-20 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </div>

      <div
        className={`flex-1 min-w-0 overflow-hidden bg-[#FFFFFF] flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen && isFullScreen ? 'pl-64' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
