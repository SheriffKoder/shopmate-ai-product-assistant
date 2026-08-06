/**
 * @file features/ai-assistant/dictation/hooks/use-browser-dictation.ts
 * Browser Web Speech API adapter.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AssistantDictationConfig, DictationCallbacks } from '../model/dictation-config';
import {
  getSpeechRecognitionConstructor,
  type DictationSpeechEvent,
  type DictationSpeechRecognition,
} from '../lib/dictation-support';
import { appendTranscript, shouldAutoSubmit } from '../lib/transcript';

export function useBrowserDictation(
  config: AssistantDictationConfig,
  callbacks: DictationCallbacks,
) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<DictationSpeechRecognition | null>(null);
  const committedInputRef = useRef(callbacks.input);
  const callbacksRef = useRef(callbacks);

  useEffect(function syncCommittedInput() {
    committedInputRef.current = callbacks.input;
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const stop = useCallback(function stopBrowserDictation() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const start = useCallback(function startBrowserDictation() {
    const Recognition = getSpeechRecognitionConstructor();
    if (!Recognition) {
      setError('Browser dictation is not supported here.');
      return;
    }

    setError(null);
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = config.language;

    recognition.onresult = function handleSpeechResult(event: DictationSpeechEvent) {
      let finalizedTranscript = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        if (event.results[index].isFinal) {
          finalizedTranscript += event.results[index][0].transcript;
        }
      }

      if (!finalizedTranscript.trim()) return;
      const nextInput = appendTranscript(committedInputRef.current, finalizedTranscript);
      committedInputRef.current = nextInput;
      callbacksRef.current.setInput(nextInput);

      if (shouldAutoSubmit(config.autoSubmit, finalizedTranscript)) {
        window.setTimeout(function submitFinalTranscript() {
          callbacksRef.current.handleSubmit();
        }, 0);
        committedInputRef.current = '';
      }
    };

    recognition.onend = function handleSpeechEnd() {
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognition.onerror = function handleSpeechError() {
      setError('Browser dictation could not access speech recognition.');
      recognitionRef.current = null;
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [config.autoSubmit, config.language]);

  useEffect(function cleanupBrowserDictation() {
    return function stopRecognitionOnUnmount() {
      recognitionRef.current?.stop();
    };
  }, []);

  return {
    isListening,
    isTranscribing: false,
    isSupported: Boolean(getSpeechRecognitionConstructor()),
    error,
    start,
    stop,
  };
}
