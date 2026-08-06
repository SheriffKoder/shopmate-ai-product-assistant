/**
 * @file features/ai-assistant/dictation/model/dictation-config.ts
 * Dictation configuration and provider contracts.
 *
 * Purpose: Defines the client-safe settings shared by browser and OpenAI dictation.
 * Used in: The isolated dictation hooks and later assistant UI wiring.
 */

export type DictationProvider = 'browser' | 'openai';

export interface AssistantDictationConfig {
  enabled: boolean;
  provider: DictationProvider;
  autoSubmit: boolean;
  language: string;
  maxRecordingSeconds: number;
  transcriptionEndpoint: string;
}

export interface DictationCallbacks {
  input: string;
  setInput: (value: string) => void;
  handleSubmit: () => void;
}

export const DEFAULT_DICTATION_CONFIG: AssistantDictationConfig = {
  enabled: false,
  provider: 'browser',
  autoSubmit: false,
  language: 'en-US',
  maxRecordingSeconds: 60,
  transcriptionEndpoint: '/api/ai-assistant/transcribe',
};

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

function parseProvider(value: string | undefined): DictationProvider {
  return value === 'openai' ? 'openai' : 'browser';
}

/**
 * Read public dictation settings without exposing server credentials.
 *
 * @returns A validated client-safe dictation configuration.
 */
export function getDictationConfig(): AssistantDictationConfig {
  const maxRecordingSeconds = Number.parseInt(
    process.env.NEXT_PUBLIC_AI_ASSISTANT_DICTATION_MAX_RECORDING_SECONDS ?? '',
    10,
  );

  return {
    enabled: parseBoolean(
      process.env.NEXT_PUBLIC_AI_ASSISTANT_DICTATION_ENABLED,
      DEFAULT_DICTATION_CONFIG.enabled,
    ),
    provider: parseProvider(process.env.NEXT_PUBLIC_AI_ASSISTANT_DICTATION_PROVIDER),
    autoSubmit: parseBoolean(
      process.env.NEXT_PUBLIC_AI_ASSISTANT_DICTATION_AUTO_SUBMIT,
      DEFAULT_DICTATION_CONFIG.autoSubmit,
    ),
    language:
      process.env.NEXT_PUBLIC_AI_ASSISTANT_DICTATION_LANGUAGE ??
      DEFAULT_DICTATION_CONFIG.language,
    maxRecordingSeconds:
      Number.isFinite(maxRecordingSeconds) && maxRecordingSeconds > 0
        ? maxRecordingSeconds
        : DEFAULT_DICTATION_CONFIG.maxRecordingSeconds,
    transcriptionEndpoint:
      process.env.NEXT_PUBLIC_AI_ASSISTANT_DICTATION_ENDPOINT ??
      DEFAULT_DICTATION_CONFIG.transcriptionEndpoint,
  };
}
