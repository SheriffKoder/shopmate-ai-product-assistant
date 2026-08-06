/**
 * @file features/ai-assistant/schema/assistant-request-schema.ts
 * Assistant Request Schema
 *
 * Purpose: Validates reusable chat transport fields while allowing business-specific request data.
 * Used in: features/ai-assistant/server/parse-assistant-request.ts and compatibility schema exports.
 * Used for: Keeping assistant request validation portable across apps that attach different business context.
 *
 * Function Index:
 * messagePartSchema: Flexible AI SDK message-part validation.
 * uiMessageSchema: Minimal AI SDK UI message validation.
 * assistantRequestSchema: Public reusable request schema for assistant HTTP requests.
 * AssistantRequestBody: TypeScript type inferred from the schema.
 *
 * Steps:
 * 1. Validate the message transport shape needed by the assistant core.
 * 2. Keep unknown top-level fields with passthrough so adapters can receive app context.
 * 3. Let the parser split reusable fields from business context after validation.
 */

import { z } from 'zod';

/**
 * Schema for UIMessage part.
 *
 * Why: AI SDK parts can contain tool calls, reasoning, and other provider fields, so passthrough keeps valid SDK payloads intact.
 */
const messagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
}).passthrough();

/**
 * Schema for UIMessage.
 *
 * Why: The assistant core only requires role and text-bearing parts, while preserving extra SDK fields for rendering/history.
 */
const uiMessageSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  parts: z.array(messagePartSchema).optional(),
  content: z.string().optional(),
}).passthrough();

/**
 * Reusable AI assistant request schema.
 *
 * Example input:
 * `{ id: "chat-id", messages: [...], modelId: "o3-mini", products: [...], cart: {...} }`
 *
 * Example output:
 * A validated body where `products` and `cart` remain available for business context extraction.
 */
export const assistantRequestSchema = z.object({
  id: z.string().optional(),
  messages: z.array(uiMessageSchema).min(1, 'At least one message is required'),
  modelId: z.string().optional(),
  persistenceMode: z.enum(['local', 'database']).default('local'),
}).passthrough();

export type AssistantRequestBody = z.infer<typeof assistantRequestSchema>;
