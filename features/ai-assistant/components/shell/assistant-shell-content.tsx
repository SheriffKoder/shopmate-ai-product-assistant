/**
 * @file features/ai-assistant/ui/shell/assistant-shell-content.tsx
 * Assistant shell content: positions history and the active chat panel.
 * Used in: ChatWrapper.
 * Used for: Keeping sidebar layout separate from shell controls and chat behavior.
 */

'use client';

import type { ReactNode } from 'react';
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

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
  const styles = useAssistantStyleConfig();
  return (
    <div
      className={`flex-1 w-full min-h-0 overflow-hidden transition-opacity duration-300 relative ${styles.shell?.contentClassName ?? ''} ${
        isVisible ? 'flex' : 'hidden'
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-full w-64 overflow-y-auto z-20 transition-transform duration-300 ease-in-out ${styles.shell?.sidebarClassName ?? ''} ${styles.shell?.sidebarBorderClassName ?? ''} ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </div>

      <div
        className={`flex-1 min-w-0 overflow-hidden flex flex-col transition-all duration-300 ease-in-out ${styles.shell?.mainClassName ?? ''} ${
          isSidebarOpen && isFullScreen ? 'pl-64' : ''
        }`}
      >
        {children}
      </div>
    </div>
  );
}
