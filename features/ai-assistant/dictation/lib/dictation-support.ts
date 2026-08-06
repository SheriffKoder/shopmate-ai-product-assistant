/**
 * @file features/ai-assistant/dictation/lib/dictation-support.ts
 * Browser capability and recording helpers for dictation providers.
 */

export interface DictationSpeechResult {
  isFinal: boolean;
  0: { transcript: string };
}

export interface DictationSpeechResultList {
  length: number;
  [index: number]: DictationSpeechResult;
}

export interface DictationSpeechEvent {
  resultIndex: number;
  results: DictationSpeechResultList;
}

export interface DictationSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: DictationSpeechEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

export type DictationSpeechRecognitionConstructor = new () => DictationSpeechRecognition;

export function getSpeechRecognitionConstructor():
  | DictationSpeechRecognitionConstructor
  | undefined {
  if (typeof window === 'undefined') return undefined;

  const browserWindow = window as Window & {
    webkitSpeechRecognition?: DictationSpeechRecognitionConstructor;
  };

  return (window.SpeechRecognition as unknown as DictationSpeechRecognitionConstructor | undefined) ??
    browserWindow.webkitSpeechRecognition;
}

export function getSupportedAudioMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;

  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  return candidates.find((mimeType) => MediaRecorder.isTypeSupported(mimeType));
}
