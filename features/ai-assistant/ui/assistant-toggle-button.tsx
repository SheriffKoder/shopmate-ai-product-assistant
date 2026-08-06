/**
 * Assistant Toggle Button
 *
 * Purpose: Owns the header control for opening and closing the assistant shell.
 * Used in: widgets/app-header/ui/app-header.tsx
 * Used for: Keeps assistant visibility behavior inside the assistant feature.
 */

'use client';

import { MessageCircle } from 'lucide-react';

import { useAssistantShell } from '@/features/ai-assistant/providers/assistant-shell-context';
import { HeaderIconButton } from '@/shared/ui/header-icon-button';

/**
 * Renders the assistant shell toggle button.
 *
 * @returns Header assistant toggle button.
 */
export function AssistantToggleButton() {
  const { isOpen: isAssistantOpen, toggleAssistant } = useAssistantShell();

  return (
    <HeaderIconButton
      icon={MessageCircle}
      label="Shop Assistant"
      tooltip={isAssistantOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      onClick={toggleAssistant}
      isActive={isAssistantOpen}
      className="header-assistant-control"
      inactiveClassName=""
      activeClassName="[&]:bg-primary [&]:text-foreground"
    />
  );
}
