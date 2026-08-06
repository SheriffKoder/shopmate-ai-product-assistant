/**
 * @file features/ai-assistant/dictation/hooks/use-openai-dictation.ts
 * MediaRecorder adapter for server-side OpenAI transcription.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AssistantDictationConfig, DictationCallbacks } from '../model/dictation-config';
import { getSupportedAudioMimeType } from '../lib/dictation-support';
import { appendTranscript, shouldAutoSubmit } from '../lib/transcript';
import { transcribeAudio } from '../client/transcribe-audio';

export function useOpenAIDictation(
  config: AssistantDictationConfig,
  callbacks: DictationCallbacks,
) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const releaseStream = useCallback(function releaseMicrophoneStream() {
    streamRef.current?.getTracks().forEach(function stopTrack(track) {
      track.stop();
    });
    streamRef.current = null;
  }, []);

  const stop = useCallback(function stopOpenAIDictation() {
    recorderRef.current?.stop();
    releaseStream();
    setIsListening(false);
  }, [releaseStream]);

  const start = useCallback(async function startOpenAIDictation() {
    const mimeType = getSupportedAudioMimeType();
    if (!mimeType || !navigator.mediaDevices?.getUserMedia) {
      setError('Audio recording is not supported here.');
      return;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;

      recorder.ondataavailable = function collectAudioChunk(event) {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async function transcribeRecordedAudio() {
        setIsListening(false);
        setIsTranscribing(true);
        try {
          const result = await transcribeAudio(
            new Blob(chunksRef.current, { type: mimeType }),
            config.transcriptionEndpoint,
          );
          const nextInput = appendTranscript(callbacks.input, result.text);
          callbacks.setInput(nextInput);
          if (shouldAutoSubmit(config.autoSubmit, result.text)) callbacks.handleSubmit();
        } catch {
          setError('OpenAI could not transcribe the recording.');
        } finally {
          setIsTranscribing(false);
          recorderRef.current = null;
          releaseStream();
        }
      };

      recorder.start();
      setIsListening(true);
      window.setTimeout(function stopAfterLimit() {
        if (recorder.state === 'recording') recorder.stop();
      }, config.maxRecordingSeconds * 1000);
    } catch {
      setError('Microphone permission was denied or unavailable.');
      releaseStream();
    }
  }, [callbacks, config, releaseStream]);

  useEffect(function cleanupOpenAIDictation() {
    return function stopRecorderOnUnmount() {
      recorderRef.current?.stop();
      releaseStream();
    };
  }, [releaseStream]);

  return {
    isListening,
    isTranscribing,
    isSupported: typeof MediaRecorder !== 'undefined',
    error,
    start,
    stop,
  };
}
