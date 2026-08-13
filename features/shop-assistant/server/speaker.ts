/**
 * @file features/shop-assistant/server/speaker.ts
 * Optional Shop Assistant speaker: one streamText, no tools.
 * Used in: shop-assistant-runtime.ts after server render.
 * Used for: Short confirm after UI, or a full conversation / answer reply without inventing SKUs.
 *
 * Function Index:
 * buildSpeakerMessages: Pure system + prompt, or null when deterministic text owns the reply.
 * createSpeakerStream: streamText with no tools. Returns null on skip or failure.
 *
 * Steps:
 * 1. Skip refuse, policy, empty lookup (non-conversation / non-answer), and speaker: none.
 * 2. If cards / sheet / document / cart already rendered, ask for a brief confirm.
 * 3. Conversation: answer in full. Category hints only. No invented SKUs.
 * 4. Answer: answer in full from STORE CONTEXT / catalogFacts. Optional Find chips.
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
  /** Factual lines from lookup rows (answer view). Prefer over bare names. */
  catalogFacts?: string[];
  cartItemCount?: number;
  renderedTitle?: string;
  lookupEmpty?: boolean;
  /** Conversation / answer Find-chip labels from schema metadata. Never product names. */
  categoryHints?: string[];
}

const SPEAKER_SYSTEM = `You are ShopMate, a concise electronics store assistant.

Do not invent product names, prices, SKUs, availability, or catalog facts.
If STORE CONTEXT lists products or facts, only use those.
If UI already rendered product cards, a sheet, a document, or the cart, confirm briefly in 1-2 sentences. Do not rebuild a table or list every SKU.
If this is a conversation answer (advice / compare), reply in full. Do not confirm briefly. If STORE CONTEXT lists products, you may cite those names briefly. Do not invent SKUs. Find chips may appear under your reply.
If this is a product answer (features / specs / tell me about), reply in full from STORE CONTEXT. Do not dump a product card. Find chips may appear under your reply.
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
  // Conversation / answer may still speak when lookup was empty (honest "not in store").
  if (input.lookupEmpty && input.render !== 'conversation' && input.render !== 'answer') {
    return null;
  }

  const lines = [`User: ${input.userQuery.trim() || '(empty)'}`];

  if (input.render === 'answer') {
    // Answer owns the reply from lookup facts. Never confirm a card that was not shown.
    if (input.catalogFacts && input.catalogFacts.length > 0) {
      lines.push('STORE CONTEXT:');
      for (const fact of input.catalogFacts) {
        lines.push(`- ${fact}`);
      }
    } else if (input.catalogNames && input.catalogNames.length > 0) {
      lines.push(`STORE CONTEXT: ${input.catalogNames.join(', ')}`);
    } else {
      lines.push('STORE CONTEXT: (no matching products in the catalog)');
    }
    lines.push(
      'Answer the question in full using only STORE CONTEXT. Do not invent features, prices, or SKUs. Do not confirm briefly.',
    );
    if (input.categoryHints && input.categoryHints.length > 0) {
      lines.push(
        `CATEGORY HINTS: ${input.categoryHints.join(', ')}. Find chips will appear under your reply.`,
      );
    }
  } else if (input.render !== 'conversation' && input.catalogNames && input.catalogNames.length > 0) {
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
    // Cite store products only when lookup returned them. Never invent SKUs.
    if (input.catalogFacts && input.catalogFacts.length > 0) {
      lines.push('STORE CONTEXT:');
      for (const fact of input.catalogFacts) {
        lines.push(`- ${fact}`);
      }
      lines.push(
        'Answer the question in full. You may briefly mention matching store products from STORE CONTEXT (for example "we have an iPhone 15 Pro Max if you want to check it out"). Do not invent names, prices, or features. Do not confirm briefly.',
      );
    } else if (input.catalogNames && input.catalogNames.length > 0) {
      lines.push(`STORE CONTEXT: ${input.catalogNames.join(', ')}`);
      lines.push(
        'Answer the question in full. You may briefly mention products from STORE CONTEXT. Do not invent SKUs. Do not confirm briefly.',
      );
    } else {
      lines.push('Answer the question in full. Do not confirm briefly. Do not invent product names, prices, or SKUs.');
      lines.push('No matching store products were found for this turn. Discuss categories in general only.');
    }
    if (input.categoryHints && input.categoryHints.length > 0) {
      lines.push(
        `FIND CHIPS: ${input.categoryHints.join(', ')}. Find chips will appear under your reply — do not list them as markdown buttons.`,
      );
    }
  } else if (input.render !== 'answer') {
    if (input.catalogNames && input.catalogNames.length > 0) {
      lines.push('Answer using only STORE CONTEXT. Stay on those store products.');
    } else {
      lines.push('No catalog rows. Answer the question without inventing ShopMate products.');
    }
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
        catalogFacts: input.catalogFacts?.length,
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
