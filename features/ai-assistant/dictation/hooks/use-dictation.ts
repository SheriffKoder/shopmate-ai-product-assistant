/**
 * @file features/ai-assistant/dictation/hooks/use-dictation.ts
 * Provider-neutral dictation entry point.
 */

'use client';

import type { AssistantDictationConfig, DictationCallbacks } from '../model/dictation-config';
import { useBrowserDictation } from './use-browser-dictation';
import { useOpenAIDictation } from './use-openai-dictation';

export function useDictation(
  config: AssistantDictationConfig,
  callbacks: DictationCallbacks,
) {
  const browser = useBrowserDictation(config, callbacks);
  const openai = useOpenAIDictation(config, callbacks);
  return config.provider === 'openai' ? openai : browser;
}
