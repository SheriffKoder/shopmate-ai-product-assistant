/**
 * @file features/ai-assistant/providers/assistant-style-context.tsx
 * Provides the host-configurable visual contract for the assistant UI.
 */

'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  defaultAssistantStyleConfig,
  mergeAssistantStyleConfig,
  type AssistantStyleConfig,
} from '../config/assistant-style-config';

const AssistantStyleContext = createContext<AssistantStyleConfig>(defaultAssistantStyleConfig);

interface AssistantStyleProviderProps {
  children: ReactNode;
  config?: AssistantStyleConfig;
}

/** Makes the resolved assistant theme available to generic assistant components. */
export function AssistantStyleProvider({ children, config }: AssistantStyleProviderProps) {
  const value = useMemo(() => mergeAssistantStyleConfig(config), [config]);
  return <AssistantStyleContext.Provider value={value}>{children}</AssistantStyleContext.Provider>;
}

/** Reads the resolved assistant theme. */
export function useAssistantStyleConfig() {
  return useContext(AssistantStyleContext);
}
