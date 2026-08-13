/**
 * @file features/shop-assistant/server/speaker.ts
 * Optional Shop Assistant speaker: one streamText, no tools.
 * Used in: shop-assistant-runtime.ts after server render.
 * Used for: Short confirm after UI, or a full conversation reply without inventing SKUs.
 *
 * Function Index:
 * buildSpeakerMessages: Pure system + prompt, or null when deterministic text owns the reply.
 * createSpeakerStream: streamText with no tools. Returns null on skip or failure.
 *
 * Steps:
 * 1. Skip refuse, policy, empty lookup (non-conversation), and speaker: none.
 * 2. If cards / sheet / document / cart already rendered, ask for a brief confirm.
 * 3. Conversation: answer in full. No brief confirm. No invented SKUs. Category hints only.
 */

import { streamText, type LanguageModel } from 'ai';
import { logger } from '@/features/ai-assistant/lib/logger';
import type { ExecutionRender, ExecutionSpeaker } from '../model/execution-plan';

/** Inputs the speaker may use. Filters stay on the schema; this is prose only. */
export interface SpeakerInput {
  speaker: ExecutionSpeaker;
  render: ExecutionRender;
  userQuery: string;
  catalogNames?: string[];
  cartItemCount?: number;
  renderedTitle?: string;
  lookupEmpty?: boolean;
  /** Conversation Find-chip labels from schema metadata. Never product names. */
  categoryHints?: string[];
}

const SPEAKER_SYSTEM = `You are ShopMate, a concise electronics store assistant.

Do not invent product names, prices, SKUs, availability, or catalog facts.
If STORE CONTEXT lists products, only mention those names.
If UI already rendered product cards, a sheet, a document, or the cart, confirm briefly in 1-2 sentences. Do not rebuild a table or list every SKU.
If this is a conversation answer (advice / compare), reply in full. Do not confirm briefly. Do not invent SKUs. You may mention store categories. Find chips may appear under your reply.
Use markdown. No tools.`;

/**
 * Build speaker system + prompt, or null when deterministic text should own the reply.
 *
 * @example
 * buildSpeakerMessages({ speaker: 'confirm', render: 'cards', userQuery: 'Show me smart phones', catalogNames: ['iPhone 15 Pro Max'] })
 */
export function buildSpeakerMessages(input: SpeakerInput): { system: string; prompt: string } | null {
  // 1. Deterministic copy owns refuse, policy, empty lookup, and speaker: none.
  if (input.speaker === 'none') return null;
  if (input.render === 'refuse' || input.render === 'policy') return null;
  // Conversation skipped lookup on purpose. Empty lookup must not steal the speaker.
  if (input.lookupEmpty && input.render !== 'conversation') return null;

  const lines = [`User: ${input.userQuery.trim() || '(empty)'}`];

  if (input.render !== 'conversation' && input.catalogNames && input.catalogNames.length > 0) {
    lines.push(`STORE CONTEXT: ${input.catalogNames.join(', ')}`);
  }

  if (input.render === 'cards') {
    lines.push('Product cards already rendered from the store catalog. Confirm briefly.');
  } else if (input.render === 'sheet') {
    lines.push(
      input.renderedTitle
        ? `A catalog sheet artifact titled "${input.renderedTitle}" already exists. Confirm briefly. Do not invent CSV rows.`
        : 'A catalog sheet artifact already exists. Confirm briefly. Do not invent CSV rows.',
    );
  } else if (input.render === 'document') {
    lines.push(
      input.renderedTitle
        ? `A document artifact titled "${input.renderedTitle}" already exists. Confirm briefly.`
        : 'A document artifact already exists. Confirm briefly.',
    );
  } else if (input.render === 'cart') {
    const count = input.cartItemCount ?? 0;
    lines.push(
      `Cart UI already rendered (${count} item${count === 1 ? '' : 's'}). Confirm briefly. Do not invent cart items.`,
    );
  } else if (input.render === 'conversation') {
    lines.push('Answer the question in full. Do not confirm briefly. Do not invent product names, prices, or SKUs.');
    if (input.categoryHints && input.categoryHints.length > 0) {
      lines.push(
        `CATEGORY HINTS: ${input.categoryHints.join(', ')}. You may discuss these store categories. Find chips will appear under your reply.`,
      );
    } else {
      lines.push('You may discuss store categories in general. Do not list fake ShopMate products.');
    }
  } else if (input.catalogNames && input.catalogNames.length > 0) {
    lines.push('Answer using only STORE CONTEXT. Stay on those store products.');
  } else {
    lines.push('No catalog rows. Answer the question without inventing ShopMate products.');
  }

  return { system: SPEAKER_SYSTEM, prompt: lines.join('\n') };
}

/**
 * Stream a speaker reply with no tools. Returns null when skipped or when streamText fails.
 *
 * @example
 * await createSpeakerStream({ model, speaker: 'confirm', render: 'cards', userQuery: 'Show me smart phones', catalogNames: ['iPhone 15 Pro Max'] })
 */
export async function createSpeakerStream(
  input: SpeakerInput & { model: LanguageModel },
) {
  const messages = buildSpeakerMessages(input);
  if (!messages) {
    logger.node({
      name: 'SPEAKER',
      input: { speaker: input.speaker, render: input.render, lookupEmpty: input.lookupEmpty },
      details: 'Speaker skipped. Deterministic reply owns this path.',
      result: { skipped: true },
      status: 'skipped',
    });
    return null;
  }

  try {
    // 2. One streamText. No tools. Confirm stays short; reply may be a bit longer.
    const result = streamText({
      model: input.model,
      system: messages.system,
      prompt: messages.prompt,
      maxOutputTokens: input.speaker === 'confirm' ? 220 : 2000,
    });

    logger.node({
      name: 'SPEAKER',
      input: {
        speaker: input.speaker,
        render: input.render,
        catalogNames: input.catalogNames,
        cartItemCount: input.cartItemCount,
        categoryHints: input.categoryHints,
      },
      details: 'Streaming speaker prose with no tools. Catalog facts stay on lookup rows.',
      result: { promptPreview: messages.prompt.slice(0, 160) },
      status: 'success',
    });

    return result.toUIMessageStream();
  } catch (error) {
    logger.node({
      name: 'SPEAKER',
      input: { speaker: input.speaker, render: input.render },
      details: 'Speaker streamText failed. Runtime will use the deterministic confirm / stub.',
      status: 'error',
      error,
    });
    return null;
  }
}
