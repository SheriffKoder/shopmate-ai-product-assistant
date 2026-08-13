/**
 * Sheet Artifact Handler (Server-Side)
 * 
 * Purpose: Generates CSV/spreadsheet content and streams it to the artifact UI
 * Used in: Agents after createDocument tool is called with kind='sheet',
 *          and server renderers that pass precomputed CSV
 * Why: Handles the actual content generation and streaming for sheet artifacts
 * 
 * How it works:
 * 1. Receives document title, dataStream, and optional precomputed CSV
 * 2. Streams provided CSV directly, or uses AI to generate CSV from the title
 * 3. Streams CSV deltas to UI in real-time
 * 4. Signals completion when done
 * 5. Writes non-transient data-artifactContent so chat can mount DocumentPreview
 * 6. Saves to Supabase for persistence
 * 
 * Usage:
 * - Called after createDocument tool execution
 * - Called with precomputed CSV when the caller already owns the rows
 * - Only for sheet artifacts (kind === 'sheet')
 * - Content is streamed as it's generated
 */

import { streamObject } from 'ai';
import { z } from 'zod/v3';
import type { UIMessageStreamWriter } from 'ai';
import { supabaseAdmin } from '@/shared/infrastructure/supabase/server/create-service-client';
import { logger } from '@/features/ai-assistant/lib/logger';
import { getOrCreateConstantUser } from '@/shared/infrastructure/supabase/queries/user-queries';
import { getAssistantModels } from '@/features/ai-assistant/server/assistant-model-provider';
import { writeAssistantStep } from '@/features/ai-assistant/server/assistant-step';
import { getSupabaseTableNames } from '@/shared/config/table-names';
import type { PersistenceMode } from '@/features/ai-assistant/message-persistence/model/persistence-mode';

const tableNames = getSupabaseTableNames();

/**
 * Parameters for creating a sheet document
 */
interface CreateSheetDocumentParams {
  /** Document title (used as prompt when content is not provided) */
  title: string;
  /** Data stream writer for streaming content to UI */
  dataStream: UIMessageStreamWriter<any>;
  /** Document ID (optional, will be generated if not provided) */
  documentId?: string;
  persistenceMode?: PersistenceMode;
  /** Precomputed CSV. When set, skip LLM generation and stream these rows. */
  content?: string;
}

/**
 * Create Sheet Document
 * 
 * Generates CSV/spreadsheet content using AI and streams it to the artifact UI.
 * After streaming completes, saves the document to Supabase for persistence.
 * When `content` is provided, that CSV is streamed as-is instead of generating from the title.
 * 
 * Uses streamObject for structured CSV generation (better than text streaming for tables).
 * 
 * @param params - Parameters including title, dataStream, optional documentId, and optional CSV content
 * @returns Full generated CSV content as string
 * 
 * @example
 * ```typescript
 * await createSheetDocument({
 *   title: "Product inventory spreadsheet",
 *   dataStream: writer,
 *   documentId: "doc-123", // Optional
 *   content: "Name,Price\\niPhone,999", // Optional precomputed CSV
 * });
 * ```
 */
export async function createSheetDocument({
  title,
  dataStream,
  documentId,
  persistenceMode = 'database',
  content,
}: CreateSheetDocumentParams): Promise<string> {
  logger.debug('[Sheet Artifact] createSheetDocument called', {
    title,
    documentId: documentId || 'NOT PROVIDED',
    hasDataStream: !!dataStream,
    hasPrecomputedContent: Boolean(content),
  });

  let fullContent = '';
  let deltaCount = 0;

  // ✅ STREAMING PHASE: Stream content in real-time
  if (content) {
    // Caller already has the full CSV. Skip model generation.
    logger.debug('[Sheet Artifact] Streaming precomputed CSV...');
    fullContent = content;
    deltaCount = 1;
    dataStream.write({
      type: 'data-sheetDelta',
      data: content,
      transient: true, // UI-only, don't save to message history
    });
  } else {
    // Generate CSV content using AI with structured output
    logger.debug('[Sheet Artifact] Starting CSV generation stream...');
    const models = getAssistantModels();
    const { fullStream } = streamObject({
      model: models.chat,
      system: `You are a helpful assistant that creates well-structured CSV data for spreadsheets.
Generate CSV data based on the user's request. The CSV should be properly formatted with headers.
Return only valid CSV data, no explanations or markdown formatting.
Use commas as delimiters and newlines for rows.`,
      prompt: title,
      schema: z.object({
        csv: z.string().describe('CSV data with headers. Use commas as delimiters, newlines for rows.'),
      }),
    });

    // Stream CSV deltas to UI in real-time
    logger.debug('[Sheet Artifact] Starting to process stream deltas...');
    for await (const delta of fullStream) {
      if (delta.type === 'object') {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          // streamObject sends full object each time, so we replace (not append)
          // This is different from textDelta which appends incrementally
          fullContent = csv;
          deltaCount++;

          // Stream full CSV to UI (streamObject replaces, not appends)
          dataStream.write({
            type: 'data-sheetDelta',
            data: csv,
            transient: true, // UI-only, don't save to message history
          });
        }
      }
    }
  }

  logger.debug('[Sheet Artifact] Streaming completed', {
    totalDeltas: deltaCount,
    contentLength: fullContent.length,
    documentId: documentId || 'NOT PROVIDED',
  });

  // Signal completion
  logger.debug('[Sheet Artifact] Sending completion status to UI...');
  dataStream.write({
    type: 'data-artifactStatus',
    data: 'complete',
    transient: true,
  });
  // Persist on the assistant message so MessagePartRenderer can mount a sheet card without createDocument.
  dataStream.write({
    type: 'data-artifactContent',
    data: { documentId, title, kind: 'sheet', content: fullContent },
  });
  writeAssistantStep(dataStream, {
    id: `artifact:${title}`,
    label: 'Creating artifact',
    summary: title,
    status: 'done',
  });

  // ✅ PERSISTENCE PHASE: Save to Supabase AFTER streaming completes
  // Note: This happens after streaming, so it doesn't block the UI
  // If documentId is provided, use it; otherwise skip saving (will be saved in agent)
  if (documentId && persistenceMode === 'database') {
    try {
      logger.info(`[Sheet Artifact] Starting Supabase save operation`, {
        documentId,
        title,
        contentLength: fullContent.length,
        kind: 'sheet',
      });
      
      const owner = await getOrCreateConstantUser();
      if (!owner) {
        logger.error('[Sheet Artifact] Failed to resolve document owner user', { documentId });
        return fullContent;
      }

      const documentData = {
        id: documentId,
        title,
        content: fullContent,
        kind: 'sheet' as const,
        userId: owner.id,
        createdAt: new Date().toISOString(),
      };

      logger.debug('[Sheet Artifact] Supabase insert payload', {
        id: documentData.id,
        title: documentData.title,
        contentLength: documentData.content.length,
        kind: documentData.kind,
        userId: documentData.userId,
        createdAt: documentData.createdAt,
      });

      const { data, error } = await supabaseAdmin
        .from(tableNames.documents)
        .insert(documentData)
        .select();

      if (error) {
        logger.error('[Sheet Artifact] Supabase insert error', {
          documentId,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
        });
        // Don't throw - artifact still works, just not persisted
        // User already sees the content via streaming
      } else {
        logger.info(`[Sheet Artifact] Successfully saved document to Supabase`, {
          documentId,
          title,
          savedAt: new Date().toISOString(),
          returnedData: data,
        });
        logger.debug('[Sheet Artifact] Supabase response data', data);
      }
    } catch (error) {
      logger.error('[Sheet Artifact] Unexpected error during Supabase save', {
        documentId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw - streaming already completed successfully
    }
  } else {
    logger.warn('[Sheet Artifact] No documentId provided, skipping Supabase save', {
      title,
      contentLength: fullContent.length,
      reason: 'documentId was not provided to createSheetDocument',
    });
  }

  return fullContent;
}
