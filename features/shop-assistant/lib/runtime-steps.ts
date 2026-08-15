/**
 * @file features/shop-assistant/lib/runtime-steps.ts
 * User-facing thinking-step copy for the schema → plan → lookup → render → speaker flow.
 * Used in: shop-assistant-runtime.ts.
 * Used for: Stable step ids/labels without exposing LLM schema fields or internal render names.
 *
 * Function Index:
 * getClassifyingStep: Always-on labeler progress.
 * getActionStep: Planned action after schema + planFromSchema.
 * getCheckingStoreStep: Catalog lookup progress when search actually runs.
 * getRenderStep: Presentation step from ExecutionRender (null when action already said enough).
 * getResolutionStep: Final group header after the turn's deterministic work finishes.
 *
 * Steps:
 * 1. Map action to a user-facing gate label.
 * 2. Map render to a presentation label when it adds signal beyond the action.
 * 3. Emit a resolution header so the UI can collapse detail steps when finished.
 */

import type { AssistantStepEvent, AssistantStepStatus } from '@/features/ai-assistant/model/assistant-events';
import type { AssistantAction } from '../model/assistant-request';
import type { ExecutionRender } from '../model/execution-plan';

/** Stable thinking-step ids. Same id upserts loading → done; never duplicate rows. */
export const RUNTIME_STEP_IDS = {
  classifying: 'query-classification',
  action: 'action',
  checkingStore: 'checking-store',
  showingCards: 'showing-cards',
  preparingTable: 'preparing-table',
  preparingDocument: 'preparing-document',
  preparingAnswer: 'preparing-answer',
  preparingResponse: 'preparing-response',
  checkingCart: 'checking-cart',
  resolution: 'resolution',
} as const;

/**
 * Always-on first step while the schema LLM labels the request.
 *
 * @example
 * getClassifyingStep('loading')
 */
export function getClassifyingStep(
  status: AssistantStepStatus = 'done',
): AssistantStepEvent {
  return {
    id: RUNTIME_STEP_IDS.classifying,
    label: 'Classifying',
    summary: 'Understanding the type of request.',
    status,
  };
}

/**
 * Action gate after planFromSchema. View never overrides this label.
 *
 * @example
 * getActionStep('catalog')
 */
export function getActionStep(
  action: AssistantAction,
  status: AssistantStepStatus = 'done',
): AssistantStepEvent {
  if (action === 'technical') {
    return {
      id: RUNTIME_STEP_IDS.action,
      label: 'Technical discussion',
      summary: 'Preparing a clear comparison and explanation.',
      status,
    };
  }

  if (action === 'unrelated') {
    return {
      id: RUNTIME_STEP_IDS.action,
      label: 'Not related',
      summary: 'This request is outside the store.',
      status,
    };
  }

  if (action === 'policy') {
    return {
      id: RUNTIME_STEP_IDS.action,
      label: 'Store policy',
      summary: 'Answering with store policy details.',
      status,
    };
  }

  if (action === 'cart') {
    return {
      id: RUNTIME_STEP_IDS.action,
      label: 'Cart',
      summary: 'Checking cart details.',
      status,
    };
  }

  return {
    id: RUNTIME_STEP_IDS.action,
    label: 'Catalog',
    summary: 'Working from the product catalog.',
    status,
  };
}

/**
 * Catalog lookup step. Emit only when searchProducts actually runs.
 *
 * @example
 * getCheckingStoreStep('loading')
 */
export function getCheckingStoreStep(
  status: AssistantStepStatus = 'done',
): AssistantStepEvent {
  return {
    id: RUNTIME_STEP_IDS.checkingStore,
    label: 'Checking store',
    summary: 'Looking up matching products.',
    status,
  };
}

/**
 * Presentation step from the planned render.
 * Returns null when the action step already covers the outcome (refuse / cart).
 *
 * @example
 * getRenderStep('sheet')
 */
export function getRenderStep(
  render: ExecutionRender,
  status: AssistantStepStatus = 'done',
): AssistantStepEvent | null {
  if (render === 'refuse' || render === 'cart') {
    return null;
  }

  if (render === 'cards') {
    return {
      id: RUNTIME_STEP_IDS.showingCards,
      label: 'Showing products',
      summary: 'Presenting matching store products.',
      status,
    };
  }

  if (render === 'sheet') {
    return {
      id: RUNTIME_STEP_IDS.preparingTable,
      label: 'Preparing table',
      summary: 'Building a spreadsheet from store products.',
      status,
    };
  }

  if (render === 'document') {
    return {
      id: RUNTIME_STEP_IDS.preparingDocument,
      label: 'Preparing document',
      summary: 'Building a document from the request.',
      status,
    };
  }

  if (render === 'answer') {
    return {
      id: RUNTIME_STEP_IDS.preparingAnswer,
      label: 'Answering product',
      summary: 'Writing product details from the store.',
      status,
    };
  }

  // conversation | policy
  return {
    id: RUNTIME_STEP_IDS.preparingResponse,
    label: 'Preparing response',
    summary: 'Writing an answer from store details.',
    status,
  };
}

/**
 * Finished-group header for the thinking panel.
 * Emit once after deterministic work succeeds or fails. UI collapses detail steps under this
 * when there are more than two detail rows.
 *
 * @example
 * getResolutionStep({ action: 'catalog', render: 'cards', status: 'done' })
 */
export function getResolutionStep(input: {
  action: AssistantAction;
  render: ExecutionRender;
  status: Exclude<AssistantStepStatus, 'loading'>;
}): AssistantStepEvent {
  const { action, render, status } = input;
  const failed = status === 'error';

  if (action === 'unrelated' || render === 'refuse') {
    return {
      id: RUNTIME_STEP_IDS.resolution,
      kind: 'resolution',
      label: failed ? 'Not related failed' : 'Not related',
      summary: failed
        ? 'Could not finish this request.'
        : 'This request is outside the store.',
      status,
    };
  }

  if (action === 'cart' || render === 'cart') {
    return {
      id: RUNTIME_STEP_IDS.resolution,
      kind: 'resolution',
      label: failed ? 'Cart failed' : 'Cart ready',
      summary: failed ? 'Could not load cart details.' : 'Cart details are ready.',
      status,
    };
  }

  if (action === 'policy' || render === 'policy') {
    return {
      id: RUNTIME_STEP_IDS.resolution,
      kind: 'resolution',
      label: failed ? 'Store policy failed' : 'Store policy ready',
      summary: failed ? 'Could not prepare the policy answer.' : 'Store policy answer is ready.',
      status,
    };
  }

  if (render === 'cards') {
    return {
      id: RUNTIME_STEP_IDS.resolution,
      kind: 'resolution',
      label: failed ? 'Products failed' : 'Products ready',
      summary: failed ? 'Could not present matching products.' : 'Matching products are ready.',
      status,
    };
  }

  if (render === 'sheet') {
    return {
      id: RUNTIME_STEP_IDS.resolution,
      kind: 'resolution',
      label: failed ? 'Table failed' : 'Table ready',
      summary: failed ? 'Could not build the product table.' : 'Product table is ready.',
      status,
    };
  }

  if (render === 'document') {
    return {
      id: RUNTIME_STEP_IDS.resolution,
      kind: 'resolution',
      label: failed ? 'Document failed' : 'Document ready',
      summary: failed ? 'Could not build the document.' : 'Document is ready.',
      status,
    };
  }

  if (render === 'answer') {
    return {
      id: RUNTIME_STEP_IDS.resolution,
      kind: 'resolution',
      label: failed ? 'Answer failed' : 'Answer ready',
      summary: failed ? 'Could not prepare the product answer.' : 'Product answer is ready.',
      status,
    };
  }

  if (action === 'technical') {
    return {
      id: RUNTIME_STEP_IDS.resolution,
      kind: 'resolution',
      label: failed ? 'Technical discussion failed' : 'Technical discussion ready',
      summary: failed
        ? 'Could not prepare the technical explanation.'
        : 'Technical explanation is ready.',
      status,
    };
  }

  return {
    id: RUNTIME_STEP_IDS.resolution,
    kind: 'resolution',
    label: failed ? 'Response failed' : 'Response ready',
    summary: failed ? 'Could not prepare the response.' : 'Response is ready.',
    status,
  };
}
