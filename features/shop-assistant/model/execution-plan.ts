/**
 * @file features/shop-assistant/model/execution-plan.ts
 * Deterministic planner from a validated AssistantRequest.
 * Used in: shop-assistant-runtime.ts after schema labeling.
 * Used for: lookup vs skip, and which server render to run. No model. No agent switch.
 *
 * Function Index:
 * ExecutionRender: Server render the runtime will call.
 * ExecutionSpeaker: Whether the optional speaker writes the reply or a brief confirm.
 * ExecutionPlan: Pure plan derived from action + view.
 * planFromSchema: Map action + view to lookup / render / speaker.
 *
 * Steps:
 * 1. Read action. View never overrides action (cart + document still renders cart).
 * 2. Catalog is the only action that requires lookup.
 * 3. Derive render + speaker from action, then view where it is meaningful.
 */

import type { AssistantAction, AssistantRequest, AssistantView } from './assistant-request';

/** What the runtime should render. Derived, never chosen by the model. */
export type ExecutionRender =
  | 'refuse'
  | 'policy'
  | 'cart'
  | 'cards'
  | 'sheet'
  | 'document'
  | 'conversation'
  | 'answer';

/**
 * Optional speaker after render.
 * `reply` = speaker is the answer. `confirm` = short confirm after UI/artifact.
 */
export type ExecutionSpeaker = 'none' | 'reply' | 'confirm';

/** Deterministic execution plan. Filters stay on AssistantRequest for lookup. */
export interface ExecutionPlan {
  action: AssistantAction;
  view: AssistantView;
  requiresCatalogLookup: boolean;
  render: ExecutionRender;
  speaker: ExecutionSpeaker;
}

/**
 * Map schema action + view to lookup / render / speaker.
 *
 * View never overrides action. `unrelated` + `sheet` still refuses.
 * Technical only honors `document`; other technical views become conversation.
 *
 * @example
 * planFromSchema({ action: 'catalog', view: 'cards' })
 * // { requiresCatalogLookup: true, render: 'cards', speaker: 'confirm' }
 *
 * @example
 * planFromSchema({ action: 'cart', view: 'document' })
 * // { requiresCatalogLookup: false, render: 'cart', speaker: 'confirm' }
 */
export function planFromSchema(
  request: Pick<AssistantRequest, 'action' | 'view'>,
): ExecutionPlan {
  const { action, view } = request;

  // 1. Unrelated: no lookup, refuse text. Ignore view (no fake sheet).
  if (action === 'unrelated') {
    return plan(action, view, {
      requiresCatalogLookup: false,
      render: 'refuse',
      speaker: 'reply',
    });
  }

  // 2. Policy: no lookup, speak store policy. Ignore view.
  if (action === 'policy') {
    return plan(action, view, {
      requiresCatalogLookup: false,
      render: 'policy',
      speaker: 'reply',
    });
  }

  // 3. Cart: no lookup, render cart UI. Schema does not authorize mutations.
  if (action === 'cart') {
    return plan(action, view, {
      requiresCatalogLookup: false,
      render: 'cart',
      speaker: 'confirm',
    });
  }

  // 4. Technical: no catalog lookup. Document artifact or conversation speaker.
  if (action === 'technical') {
    const wantsDocument = view === 'document';
    return plan(action, view, {
      requiresCatalogLookup: false,
      render: wantsDocument ? 'document' : 'conversation',
      speaker: wantsDocument ? 'confirm' : 'reply',
    });
  }

  // 5. Catalog: lookup first, then view chooses presentation.
  // answer looks up for speaker facts but never streams cards.
  // conversation skips lookup at runtime (Find chips from schema only).
  return plan(action, view, {
    requiresCatalogLookup: true,
    render: renderForCatalogView(view),
    speaker: view === 'conversation' || view === 'answer' ? 'reply' : 'confirm',
  });
}

function renderForCatalogView(view: AssistantView): ExecutionRender {
  if (view === 'cards') return 'cards';
  if (view === 'sheet') return 'sheet';
  if (view === 'document') return 'document';
  if (view === 'answer') return 'answer';
  return 'conversation';
}

function plan(
  action: AssistantAction,
  view: AssistantView,
  rest: Pick<ExecutionPlan, 'requiresCatalogLookup' | 'render' | 'speaker'>,
): ExecutionPlan {
  return { action, view, ...rest };
}
