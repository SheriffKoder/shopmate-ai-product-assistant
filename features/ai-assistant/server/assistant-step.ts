import type { UIMessageStreamWriter } from 'ai';
import type { AssistantStepEvent } from '../model/assistant-events';

/** Writes a transient, safe progress summary for the generic assistant UI. */
export function writeAssistantStep(
  dataStream: UIMessageStreamWriter<any> | undefined,
  step: AssistantStepEvent
) {
  dataStream?.write({ type: 'data-assistantStep', data: step, transient: true });
}
