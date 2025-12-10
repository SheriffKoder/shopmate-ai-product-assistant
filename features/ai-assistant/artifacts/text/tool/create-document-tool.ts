/**
 * Create Document Tool
 * 
 * Purpose: Tool that AI can call to create a text artifact
 * Used in: Agents (products-cart, recommendation, etc.)
 * Why: Allows AI to create artifacts via tool calls during conversations
 * 
 * How it works:
 * 1. AI calls this tool with title and kind
 * 2. Tool generates UUID and streams artifact metadata to UI
 * 3. Tool returns success message
 * 4. Artifact handler (separate) will generate and stream content
 * 
 * Usage:
 * - For substantial content (>10 lines)
 * - For content users will likely save/reuse (emails, code, essays, etc.)
 * - When explicitly requested to create a document
 * - For content containing code snippets
 */

import { dynamicTool, type UIMessageStreamWriter } from 'ai';
import { z } from 'zod/v3';
import { generateUUID } from '@/features/ai-assistant/lib/utils';
import type { ShopMateUIDataTypes } from '../../../types/stream';

/**
 * Create Document Tool
 * 
 * Creates a new artifact document and streams metadata to UI.
 * The actual content generation is handled by artifact handlers (e.g., text/server.ts).
 * 
 * @param dataStream - Optional data stream writer for streaming artifact metadata
 * @param getSharedId - Optional function to get shared document ID from agent
 * @param setSharedId - Optional function to set shared document ID for agent
 * @returns Dynamic tool that can be called by AI
 */
export const createDocumentTool = (
  dataStream?: UIMessageStreamWriter<any>,
  getSharedId?: () => string | null,
  setSharedId?: (id: string) => void
) =>
  dynamicTool({
    description:
      'Create a document for writing, editing, or content creation. Use this for substantial content (>10 lines) that users will likely save or reuse. Examples: essays, emails, code snippets, articles, guides, documentation, spreadsheets, comparison tables. IMPORTANT: When the user asks for a "spreadsheet", "table", "comparison table", or "list" with structured data (products with prices, features, etc.), ALWAYS use this tool with kind="sheet" to create a spreadsheet. DO NOT use for short responses or conversational text - keep those in the chat.',
    inputSchema: z.object({
      title: z
        .string()
        .describe('The title of the document. Should be descriptive and clear.'),
      kind: z
        .enum(['text', 'code', 'sheet'])
        .default('text')
        .describe(
          'The type of document. Use "text" for general content, "code" for code snippets, "sheet" for spreadsheets, tables, or comparison lists with structured data (products with prices, features, specifications, etc.). ALWAYS use "sheet" when the user asks for a spreadsheet, table, or structured list.'
        ),
    }),
    execute: async (input) => {
      const { title, kind = 'text' } = input as {
        title: string;
        kind?: 'text' | 'code' | 'sheet';
      };
      
      // Use shared ID from agent if available, otherwise generate new one
      // This ensures the tool and agent use the same ID for syncing
      let id: string;
      if (getSharedId && getSharedId()) {
        id = getSharedId()!;
      } else {
        id = generateUUID();
        // Store the ID so agent can use it
        if (setSharedId) {
          setSharedId(id);
        }
      }

      // Stream artifact metadata to UI
      // These will be processed by DataStreamHandler to update artifact state

      // 1. Stream document ID
      dataStream?.write({
        type: 'data-artifactId',
        data: id,
        transient: true, // UI-only, don't save to message history
      });

      // 2. Stream document title
      dataStream?.write({
        type: 'data-artifactTitle',
        data: title,
        transient: true,
      });

      // 3. Stream document kind
      dataStream?.write({
        type: 'data-artifactKind',
        data: kind,
        transient: true,
      });

      // 4. Set status to streaming (content will be generated next)
      dataStream?.write({
        type: 'data-artifactStatus',
        data: 'streaming',
        transient: true,
      });

      // 5. Clear any existing artifact content
      dataStream?.write({
        type: 'data-artifactClear',
        data: null,
        transient: true,
      });

      // Return success message
      // Note: Actual content generation happens in artifact handlers (e.g., text/server.ts)
      // which are called separately after the tool execution
      return {
        id,
        title,
        kind,
        message:
          'Document created. Content will be generated and displayed in the artifact panel.',
      };
    },
  });

