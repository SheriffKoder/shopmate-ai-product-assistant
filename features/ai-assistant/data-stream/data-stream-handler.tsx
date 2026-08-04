/**
 * Generic streamed-data bridge.
 *
 * The assistant core only owns transport delivery. A host decides whether a
 * data part updates a catalog, cart, artifact, notification, or nothing.
 */

'use client';

import { useEffect } from 'react';
import type { DataUIPart } from 'ai';
import { useDataStream } from './data-stream-provider';
import type { AssistantUIDataTypes } from '../types/stream';
import type { AssistantStepEvent } from '../model/assistant-events';

export interface DataStreamHandlerProps {
  onDataPart?: (part: DataUIPart<AssistantUIDataTypes>) => void;
}

function isAssistantStep(value: unknown): value is AssistantStepEvent {
  if (!value || typeof value !== 'object') return false;
  const step = value as Partial<AssistantStepEvent>;
  return typeof step.id === 'string' && typeof step.label === 'string'
    && (step.status === 'loading' || step.status === 'done' || step.status === 'error');
}

/** Forwards each received part to the optional host adapter. */
export function DataStreamHandler({ onDataPart }: DataStreamHandlerProps) {
  const { dataStream, setDataStream, setAssistantSteps } = useDataStream();

  useEffect(() => {
    if (dataStream.length === 0) return;

    const parts = dataStream.slice();
    setDataStream([]);
    parts.forEach((part) => {
      if (part.type === 'data-assistantStep' && isAssistantStep(part.data)) {
        const step = part.data;
        setAssistantSteps((steps) => {
          const existingIndex = steps.findIndex((currentStep) => currentStep.id === step.id);
          if (existingIndex === -1) return [...steps, step];
          return steps.map((currentStep, index) => index === existingIndex ? step : currentStep);
        });
      }
      onDataPart?.(part);
    });
  }, [dataStream, onDataPart, setAssistantSteps, setDataStream]);

  return null;
}
