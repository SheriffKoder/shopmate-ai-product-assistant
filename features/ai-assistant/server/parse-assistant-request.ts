/**
 * @file features/ai-assistant/server/parse-assistant-request.ts
 * Assistant Request Parser
 *
 * Purpose: Reads and validates assistant HTTP requests for the reusable server handler.
 * Used in: features/ai-assistant/server/handle-assistant-request.ts.
 * Used for: Separating stable assistant transport fields from app-specific business context.
 *
 * Function Index:
 * ParsedAssistantRequest: Parsed request shape returned to the handler.
 * parseAssistantRequest: Reads JSON, validates it, and extracts reusable fields.
 *
 * Steps:
 * 1. Read the raw HTTP JSON body.
 * 2. Validate assistant-owned fields with the schema layer.
 * 3. Split chat id, messages, and model id from all remaining business context.
 * 4. Return a typed object for the server handler and runtime adapter.
 */

import type { UIMessage } from 'ai';
import {
  assistantRequestSchema,
  type AssistantRequestBody,
} from '../schema/assistant-request-schema';

export interface ParsedAssistantRequest<TBusinessContext = Record<string, unknown>> {
  /** Existing chat id from the client, if present. */
  chatId?: string;
  /** Chat messages sent by the AI SDK client. */
  messages: UIMessage[];
  /** Selected model id from the client, if present. */
  modelId?: string;
  /** Top-level non-assistant fields passed to the injected runtime. */
  businessContext: TBusinessContext;
}

/**
 * Parse a request body into reusable assistant fields plus generic business context.
 *
 * @template TBusinessContext - App-specific context shape expected by the runtime adapter.
 * @param req - Incoming assistant HTTP request.
 * @returns Parsed assistant request with reusable fields and adapter-owned context.
 */
export async function parseAssistantRequest<TBusinessContext = Record<string, unknown>>(
  req: Request
): Promise<ParsedAssistantRequest<TBusinessContext>> {
  // 1. Read the raw request payload from the Next.js route adapter.
  const body = await req.json();

  // 2. Validate the portable assistant fields while preserving passthrough context.
  const validatedBody = assistantRequestSchema.parse(body) as AssistantRequestBody;

  // 3. Keep assistant-owned fields explicit and pass the rest to the runtime adapter.
  const { id, messages, modelId, ...businessContext } = validatedBody;

  // 4. Return a stable shape consumed by the reusable handler.
  return {
    chatId: id,
    messages: messages as UIMessage[],
    modelId,
    businessContext: businessContext as TBusinessContext,
  };
}
