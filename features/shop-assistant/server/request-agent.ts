/**
 * @file features/shop-assistant/server/request-agent.ts
 * One schema LLM for Shop Assistant.
 * Used in: shop-assistant-runtime.ts before planFromSchema and lookup.
 * Used for: Labeling action + filters + view + conversation metadata. No tools. No specialist-agent intent.
 *
 * Function Index:
 * labelAssistantRequest: generateObject → validateAssistantRequest, or DEFAULT_ASSISTANT_REQUEST.
 *
 * Steps:
 * 1. Ask the model for the slim AssistantRequest schema (action, filters, view, metadata).
 * 2. Normalize untrusted fields before planning or lookup.
 * 3. On failure, return the safe catalog + conversation default (no second classifier).
 */

import { generateObject, type LanguageModel } from 'ai';
import { logger } from '@/features/ai-assistant/lib/logger';
import {
  DEFAULT_ASSISTANT_REQUEST,
  type AssistantRequest,
} from '../model/assistant-request';
import {
  assistantRequestSchema,
  validateAssistantRequest,
} from '../schema/assistant-request-schema';

/** Input required by the one schema labeler. */
export interface LabelAssistantRequestInput {
  query: string;
  model: LanguageModel;
}

const REQUEST_AGENT_PROMPT = `You label one user message for an electronics store assistant.

Return only the structured schema. Do not invent catalog facts, product ids, prices, availability, or SKUs.

action:
- catalog: shopping, browsing, product search, recommendations, comparisons of store products, buying guides about our products
- cart: view or edit the cart. This does not authorize a mutation.
- policy: returns, refunds, shipping, warranty, store hours
- technical: technology explanations or comparisons that are not shopping in this store (for example Windows vs Mac, OLED vs AMOLED)
- unrelated: no connection to this store, products, or consumer electronics (for example "Who is Elon Musk?", weather, cooking)

catalogQuery:
- Concise search phrase the catalog is likely to contain. Example: "do you have iphones?" → "iphone".
- Rec / compare: leave empty or use a short need phrase. Do not invent SKUs. Presentation is view + metadata, not lookup.
- Browse-all requests such as "all products", "all available products", "show everything in the store", or "entire catalog" must use an empty string. Do not invent search terms.

category: one of smartphone, laptop, tablet, smartwatch, headphones, or null. Null when uncertain, rec/compare covering more than one aisle, or browse-all.

constraints: price bounds, colors, feature keywords, sortBy. Omit unknown fields or use null / []. Do not invent sortBy.

view is presentation only. It never changes action. The runtime stays dumb and follows view.
- cards: the user defined products they want to see ("show me", "what do you have", "do you have X", "Provide X from the catalog")
- sheet: table, spreadsheet, tabular list, structured list
- document: buying guide, write a document/article/report, artifact prose
- conversation: broader discussion — rec, compare, "what products match", open advice, policy, cart, unrelated, ordinary chat

metadata is conversation UI only. It never changes action, lookup, or view.
- Defined product request → view=cards, metadata.type=none, items=[].
- Broader rec / compare → view=conversation, metadata.type=buttons, 1–3 items. Include every matching catalog aisle (pen/diary → smartphone AND tablet, not tablet only).
- Table / document / cart / unrelated / "Provide X from the catalog" → metadata.type=none, items=[].
- items[].label is chip text (Tablets). items[].value is a catalog category only: smartphone, laptop, tablet, smartwatch, headphones. No invented product names.
- "Provide tablets from the catalog" → action=catalog, view=cards, category=tablet, metadata.type=none.

Examples:
- "Show me smart phones" → action=catalog, catalogQuery="smartphone", category=smartphone, view=cards, metadata.type=none
- "All available products in a table" → action=catalog, catalogQuery="", category=null, view=sheet, metadata.type=none
- "Buying guide for our smartphones" → action=catalog, catalogQuery="smartphone", category=smartphone, view=document, metadata.type=none
- "Windows vs Mac laptops" → action=technical, catalogQuery="", category=null, view=document, metadata.type=none
- "Edit my cart" → action=cart, catalogQuery="", category=null, view=conversation, metadata.type=none
- "Who is Elon Musk?" → action=unrelated, catalogQuery="", category=null, view=conversation, metadata.type=none
- "i plan to write often my diary on the go, what products can be matching?" → action=catalog, catalogQuery="", category=null, view=conversation, metadata={ type: "buttons", items: [{ label: "Smartphones", value: "smartphone" }, { label: "Tablets", value: "tablet" }] }
- "which is better tablets or laptops for travel?" → action=catalog, catalogQuery="", category=null, view=conversation, metadata={ type: "buttons", items: [{ label: "Tablets", value: "tablet" }, { label: "Laptops", value: "laptop" }] }
- "Provide tablets from the catalog" → action=catalog, catalogQuery="", category=tablet, view=cards, metadata.type=none`;

/**
 * Label one user query as a validated AssistantRequest.
 *
 * @example
 * await labelAssistantRequest({ query: 'Show me smart phones', model })
 * // { action: 'catalog', catalogQuery: 'smartphone', category: 'smartphone', view: 'cards', ... }
 */
export async function labelAssistantRequest(
  input: LabelAssistantRequestInput,
): Promise<AssistantRequest> {
  try {
    // 1. Ask the model for a schema-constrained label of the query.
    const result = await generateObject({
      model: input.model,
      system: REQUEST_AGENT_PROMPT,
      prompt: input.query,
      schema: assistantRequestSchema,
      temperature: 0.1,
    });

    // 2. Normalize untrusted fields before planning or lookup can use them.
    const assistantRequest = validateAssistantRequest(result.object);
    logger.node({
      name: 'REQUEST SCHEMA',
      input: { query: input.query },
      details: 'Schema LLM labeled action, filters, view, and metadata.',
      result: assistantRequest,
      status: 'success',
    });
    return assistantRequest;
  } catch (error) {
    // 3. Labeling failure is recoverable. Prefer shopping default over a second classifier.
    logger.node({
      name: 'REQUEST SCHEMA',
      input: { query: input.query },
      details: 'Schema LLM failed; using catalog + conversation default.',
      result: DEFAULT_ASSISTANT_REQUEST,
      status: 'error',
      error,
    });
    return DEFAULT_ASSISTANT_REQUEST;
  }
}
