'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface AssistantShellContextValue {
  isOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
}

const AssistantShellContext = createContext<AssistantShellContextValue | undefined>(undefined);

export function AssistantShellProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const value = useMemo(() => ({
    isOpen,
    openAssistant: function openAssistant() { setIsOpen(true); },
    closeAssistant: function closeAssistant() { setIsOpen(false); },
    toggleAssistant: function toggleAssistant() { setIsOpen((current) => !current); },
  }), [isOpen]);

  return <AssistantShellContext.Provider value={value}>{children}</AssistantShellContext.Provider>;
}

export function useAssistantShell() {
  const context = useContext(AssistantShellContext);
  if (!context) throw new Error('useAssistantShell must be used within AssistantShellProvider');
  return context;
}
