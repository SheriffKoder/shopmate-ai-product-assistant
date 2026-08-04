'use client';

import type { AssistantStepEvent } from '../../model/assistant-events';
import { ThinkingStepItem } from './thinking-step-item';

export function ThinkingSteps({ steps }: { steps: AssistantStepEvent[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="mb-3 border-l-2 border-primary/30 pl-3" aria-label="Assistant progress">
      {steps.map((step) => <ThinkingStepItem key={step.id} step={step} />)}
    </div>
  );
}
