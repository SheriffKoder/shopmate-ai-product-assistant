/**
 * @file features/ai-assistant/model/assistant-config.ts
 * Generic Assistant Configuration
 *
 * Purpose: Defines host-provided configuration for the reusable assistant shell.
 * Used in: Assistant providers, integrations, and generic assistant UI.
 * Used for: Keeping endpoint, identity, runtime, renderers, and host callbacks outside assistant implementation details.
 */

import type { ReactNode } from 'react';
import type { AssistantCommand, AssistantCommandDispatcher } from './assistant-commands';
import type { AssistantRuntime } from './assistant-runtime';
import type { AssistantToolRendererRegistry } from './tool-renderer-registry';
import type { SuggestionSet } from '../config/intro-suggestions';
import type { AssistantApiEndpoints } from './api-endpoints';

/** Minimal user identity required by assistant UI and persistence adapters. */
export interface AssistantUser {
  id: string;
  displayName?: string;
  email?: string;
}

/** Host callbacks for events that the generic assistant cannot interpret. */
export interface AssistantHostCallbacks {
  onError?: (error: unknown) => void;
  onDataEvent?: (event: unknown) => void;
  onCommand?: AssistantCommandDispatcher;
}

/** Complete host configuration for an assistant instance. */
export interface AssistantConfig {
  endpoint: string;
  apiEndpoints?: AssistantApiEndpoints;
  currentUser?: AssistantUser;
  runtime?: AssistantRuntime;
  toolRenderers?: AssistantToolRendererRegistry;
  emptyState?: ReactNode;
  suggestions?: SuggestionSet[];
  callbacks?: AssistantHostCallbacks;
}

/** Type helper for hosts that need to narrow a command before dispatching it. */
export type AssistantCommandHandler = (command: AssistantCommand) => Promise<void> | void;
