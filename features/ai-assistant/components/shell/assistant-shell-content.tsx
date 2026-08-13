/**
 * @file features/ai-assistant/ui/shell/assistant-shell-content.tsx
 * Assistant shell content: positions history and the active chat panel.
 * Used in: ChatWrapper.
 * Used for: Keeping sidebar layout separate from shell controls and chat behavior.
 * Closes the sidebar when the user clicks outside the panel.
 */

'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

interface AssistantShellContentProps {
  isVisible: boolean;
  isSidebarOpen: boolean;
  isFullScreen: boolean;
  sidebar: ReactNode;
  children: ReactNode;
  onCloseSidebar?: () => void;
}

/** Renders the shell content area and applies only layout-level state. */
export function AssistantShellContent({
  isVisible,
  isSidebarOpen,
  isFullScreen,
  sidebar,
  children,
  onCloseSidebar,
}: AssistantShellContentProps) {
  const styles = useAssistantStyleConfig();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(function closeSidebarOnOutsideClick() {
    if (!isSidebarOpen || !onCloseSidebar) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (sidebarRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('#assistant-sidebar-toggle')) return;
      onCloseSidebar?.();
    }

    document.addEventListener('mousedown', handlePointerDown);
    return function removeOutsideClickListener() {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isSidebarOpen, onCloseSidebar]);

  return (
    <div
      className={`flex-1 w-full min-h-0 overflow-hidden transition-opacity duration-300 relative ${styles.shell?.contentClassName ?? ''} ${
        isVisible ? 'flex' : 'hidden'
      }`}
    >
      <div
        ref={sidebarRef}
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
