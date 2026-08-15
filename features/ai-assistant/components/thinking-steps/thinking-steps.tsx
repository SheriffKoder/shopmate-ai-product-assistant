'use client';

import { useState } from 'react';
import { ChevronDown, CircleCheck, CircleX } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/shared/lib/utils';
import type { AssistantStepEvent } from '../../model/assistant-events';
import { ThinkingStepItem } from './thinking-step-item';
import { useAssistantStyleConfig } from '../../providers/assistant-style-context';

function isResolutionStep(step: AssistantStepEvent): boolean {
  return step.kind === 'resolution' || step.id === 'resolution';
}

export function ThinkingSteps({ steps }: { steps: AssistantStepEvent[] }) {
  const styles = useAssistantStyleConfig();
  const [isOpen, setIsOpen] = useState(false);

  if (steps.length === 0) return null;

  const detailSteps = steps.filter((step) => !isResolutionStep(step));
  const resolution = steps.find(isResolutionStep);
  const shouldCollapse = Boolean(resolution) && detailSteps.length > 2;

  if (detailSteps.length === 0 && !resolution) return null;

  const containerClassName = styles.thinkingSteps?.containerClassName ?? 'mb-3';

  if (!shouldCollapse || !resolution) {
    return (
      <div className={containerClassName} aria-label="Assistant progress">
        {detailSteps.map((step) => (
          <ThinkingStepItem key={step.id} step={step} />
        ))}
      </div>
    );
  }

  const StatusIcon = resolution.status === 'error' ? CircleX : CircleCheck;

  return (
    <div className={containerClassName} aria-label="Assistant progress">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-fit">
        <CollapsibleTrigger
          className={cn(
            styles.thinkingSteps?.headerClassName,
            'flex w-fit items-center gap-2 py-1 text-left text-xs text-black/70 hover:opacity-80 cursor-pointer',
          )}
        >
          <StatusIcon
            className={cn(
              'size-3.5 shrink-0',
              resolution.status === 'error' ? 'text-destructive' : 'text-primary',
            )}
            aria-hidden="true"
          />
          <span className="font-medium">{resolution.label}</span>
          <ChevronDown
            className={cn(
              'size-3.5 shrink-0 text-black/50 transition-transform',
              isOpen ? 'rotate-180' : 'rotate-0',
            )}
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4">
          {detailSteps.map((step) => (
            <ThinkingStepItem key={step.id} step={step} />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
