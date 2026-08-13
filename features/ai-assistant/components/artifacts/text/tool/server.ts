/**
 * Text Artifact Handler (Server-Side)
 * 
 * Purpose: Generates text content and streams it to the artifact UI
 * Used in: Agents after createDocument tool is called
 * Why: Handles the actual content generation and streaming for text artifacts
 * 
 * How it works:
 * 1. Receives document title, dataStream, and optional precomputed markdown
 * 2. Streams provided text directly, or uses AI to generate text from the title
 * 3. Streams text deltas to UI in real-time
 * 4. Signals completion when done
 * 
 * Usage:
 * - Called after createDocument tool execution
 * - Only for text artifacts (kind === 'text')
 * - Content is streamed as it's generated
 */

import { streamText, smoothStream } from 'ai';
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
 * Parameters for creating a text document
 */
interface CreateTextDocumentParams {
  /** Document title (used as prompt when content is not provided) */
  title: string;
  /** Data stream writer for streaming content to UI */
  dataStream: UIMessageStreamWriter<any>;
  /** Document ID (optional, will be generated if not provided) */
  documentId?: string;
  persistenceMode?: PersistenceMode;
  /** Precomputed markdown. When set, skip LLM generation and stream this text. */
  content?: string;
}

/**
 * Create Text Document
 * 
 * Generates text content using AI and streams it to the artifact UI.
 * After streaming completes, saves the document to Supabase for persistence.
 * When `content` is provided, that markdown is streamed as-is instead of generating from the title.
 * 
 * @param params - Parameters including title, dataStream, optional documentId, and optional content
 * @returns Full generated content as string
 * 
 * @example
 * ```typescript
 * await createTextDocument({
 *   title: "Accessibility in Web Development",
 *   dataStream: writer,
 *   documentId: "doc-123", // Optional
 *   content: "# Guide\\n...", // Optional precomputed markdown
 * });
 * ```
 */
export async function createTextDocument({
  title,
  dataStream,
  documentId,
  persistenceMode = 'database',
  content,
}: CreateTextDocumentParams): Promise<string> {
  logger.debug('[Text Artifact] createTextDocument called', {
    title,
    documentId: documentId || 'NOT PROVIDED',
    hasDataStream: !!dataStream,
    hasPrecomputedContent: Boolean(content),
  });

  let fullContent = '';
  let deltaCount = 0;

  // ✅ STREAMING PHASE: Stream content in real-time
  if (content) {
    // Caller already has the full text. Skip model generation.
    logger.debug('[Text Artifact] Streaming precomputed text...');
    fullContent = content;
    deltaCount = 1;
    dataStream.write({
      type: 'data-textDelta',
      data: content,
      transient: true, // UI-only, don't save to message history
    });
  } else {
    // Generate text content using AI
    logger.debug('[Text Artifact] Starting text generation stream...');
    const models = getAssistantModels();
    const { fullStream } = streamText({
      model: models.chat, // Use configured assistant model for artifact content.
      system:
        'Write about the given topic. Markdown is supported. Use headings wherever appropriate. Be clear, concise, and well-structured.',
      experimental_transform: smoothStream({
        chunking: 'word', // Stream word by word for smooth experience
        delayInMs: 10, // Small delay for smoother streaming
      }),
      prompt: title,
    });

    // Stream text deltas to UI in real-time
    logger.debug('[Text Artifact] Starting to process stream deltas...');
    for await (const delta of fullStream) {
      if (delta.type === 'text-delta') {
        const text = delta.text;
        fullContent += text;
        deltaCount++;

        // Stream each text chunk to UI
        dataStream.write({
          type: 'data-textDelta',
          data: text,
          transient: true, // UI-only, don't save to message history
        });
      }
    }
  }

  logger.debug('[Text Artifact] Streaming completed', {
    totalDeltas: deltaCount,
    contentLength: fullContent.length,
    documentId: documentId || 'NOT PROVIDED',
  });

  // Signal completion
  logger.debug('[Text Artifact] Sending completion status to UI...');
  dataStream.write({
    type: 'data-artifactStatus',
    data: 'complete',
    transient: true,
  });
  dataStream.write({
    type: 'data-artifactContent',
    data: { documentId, title, kind: 'text', content: fullContent },
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
      logger.info(`[Text Artifact] Starting Supabase save operation`, {
        documentId,
        title,
        contentLength: fullContent.length,
        kind: 'text',
      });
      
      const owner = await getOrCreateConstantUser();
      if (!owner) {
        logger.error('[Text Artifact] Failed to resolve document owner user', { documentId });
        return fullContent;
      }

      const documentData = {
        id: documentId,
        title,
        content: fullContent,
        kind: 'text' as const,
        userId: owner.id,
        createdAt: new Date().toISOString(),
      };

      logger.debug('[Text Artifact] Supabase insert payload', {
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
        logger.error('[Text Artifact] Supabase insert error', {
          documentId,
          error: error.message,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
        });
        // Don't throw - artifact still works, just not persisted
        // User already sees the content via streaming
      } else {
        logger.info(`[Text Artifact] Successfully saved document to Supabase`, {
          documentId,
          title,
          savedAt: new Date().toISOString(),
          returnedData: data,
        });
        logger.debug('[Text Artifact] Supabase response data', data);
      }
    } catch (error) {
      logger.error('[Text Artifact] Unexpected error during Supabase save', {
        documentId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw - streaming already completed successfully
    }
  } else {
    logger.warn('[Text Artifact] No documentId provided, skipping Supabase save', {
      title,
      contentLength: fullContent.length,
      reason: 'documentId was not provided to createTextDocument',
    });
  }

  return fullContent;
}
