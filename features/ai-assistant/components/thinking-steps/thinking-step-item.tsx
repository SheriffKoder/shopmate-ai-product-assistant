'use client';

import { Check, CircleAlert, LoaderCircle } from 'lucide-react';
import type { AssistantStepEvent } from '../../model/assistant-events';
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

export function ThinkingStepItem({ step }: { step: AssistantStepEvent }) {
  const styles = useAssistantStyleConfig();
  const icon = step.status === 'done'
    ? <Check className="size-3.5" />
    : step.status === 'error'
      ? <CircleAlert className="size-3.5" />
      : <LoaderCircle className="size-3.5 animate-spin" />;

  return (
    <div className={styles.thinkingSteps?.itemClassName ?? 'flex items-start gap-2 py-1 text-xs text-black/70'}>
      <span className={styles.thinkingSteps?.iconClassName ?? 'mt-0.5 text-primary'} aria-hidden="true">{icon}</span>
      <div>
        <p className="font-medium">{step.label} <span className="font-normal">· {step.status}</span></p>
        {step.summary && <p className={styles.thinkingSteps?.summaryClassName ?? 'text-black/50'}>{step.summary}</p>}
      </div>
    </div>
  );
}
