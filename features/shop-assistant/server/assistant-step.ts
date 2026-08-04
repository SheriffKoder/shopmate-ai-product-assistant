import type { UIMessageStreamWriter } from 'ai';
import type { AssistantStepEvent } from '@/features/ai-assistant/model/assistant-events';

/** Emits a safe, transient progress summary for the generic assistant UI. */
export function writeAssistantStep(
  dataStream: UIMessageStreamWriter<any> | undefined,
  step: AssistantStepEvent
) {
  dataStream?.write({ type: 'data-assistantStep', data: step, transient: true });
}
