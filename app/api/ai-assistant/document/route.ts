/**
 * Document API Route
 * 
 * Purpose: Handle document CRUD operations for artifacts
 * Used in: Client components via SWR hooks
 * Why: Provides API endpoints for fetching and saving artifact documents
 * 
 * Endpoints:
 * - GET /api/document?id={documentId} - Fetch document(s) by ID
 * - POST /api/document?id={documentId} - Create new version (INSERT, never UPDATE)
 * - DELETE /api/document?id={documentId} - Delete document versions
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import type { Document } from '@/lib/supabase/types';
import { logger } from '@/features/ai-assistant/lib/logger';
import { generateUUID } from '@/features/ai-assistant/lib/utils';

/**
 * GET /api/document?id={documentId}
 * 
 * Fetches document(s) by ID from Supabase.
 * Returns array of documents (for version history support).
 * 
 * Query Parameters:
 * - id (required): Document ID to fetch
 * 
 * Returns:
 * - 200: Array of documents (ordered by createdAt ascending)
 * - 400: Missing id parameter
 * - 404: Document not found
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      logger.warn('[Document API] Missing id parameter');
      return NextResponse.json(
        { error: 'Parameter id is missing' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const session = await getSession();
    // if (!session?.user) {
    //   logger.warn('[Document API] Unauthorized request');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    logger.info(`[Document API] Fetching documents with id: ${id}`);

    // Fetch all versions of document (ordered by createdAt ascending)
    // This enables version history - latest version is last in array
    const { data: documents, error } = await supabaseAdmin
      .from('Document')
      .select('*')
      .eq('id', id)
      .order('createdAt', { ascending: true });

    if (error) {
      logger.error('[Document API] Error fetching documents:', error);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    if (!documents || documents.length === 0) {
      logger.info(`[Document API] Document not found: ${id}`);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // TODO: Add authorization check
    // Verify user owns the document
    // if (documents[0].userId !== session.user.id) {
    //   logger.warn(`[Document API] Forbidden: User does not own document ${id}`);
    //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    // }

    logger.info(`[Document API] Successfully fetched ${documents.length} document version(s) for id: ${id}`);

    // Return documents array (for version history support)
    // Latest version is documents[documents.length - 1]
    return NextResponse.json(documents, { status: 200 });
  } catch (error) {
    logger.error('[Document API] Unexpected error in GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/document?id={documentId}
 * 
 * Creates a NEW VERSION of a document in Supabase.
 * IMPORTANT: This always uses INSERT (creates new row), never UPDATE (modifies existing row).
 * 
 * Version History Mechanism:
 * - Creates a new row with the same id but new createdAt timestamp
 * - Composite primary key (id, createdAt) allows multiple versions per document
 * - Each save creates a new version, preserving all previous versions
 * 
 * Query Parameters:
 * - id (required): Document ID (same for all versions of a document)
 * 
 * Request Body:
 * - title: Document title
 * - content: Document content
 * - kind: Document kind ('text' | 'code' | 'sheet')
 * 
 * Returns:
 * - 200: Created document (new version with new createdAt)
 * - 400: Missing id or invalid body
 * - 500: Server error
 * 
 * Example:
 * - First save: Creates row with id="abc", createdAt="2024-01-01T10:00:00Z"
 * - Second save: Creates row with id="abc", createdAt="2024-01-01T10:05:00Z" (new version)
 * - Both rows exist in database (version history preserved)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      logger.warn('[Document API] Missing id parameter in POST');
      return NextResponse.json(
        { error: 'Parameter id is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const session = await getSession();
    // if (!session?.user) {
    //   logger.warn('[Document API] Unauthorized POST request');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      logger.warn('[Document API] Invalid JSON in POST body');
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { title, content, kind } = body;

    // Validate required fields
    if (!title || !kind) {
      logger.warn('[Document API] Missing required fields in POST');
      return NextResponse.json(
        { error: 'Title and kind are required' },
        { status: 400 }
      );
    }

    // Validate kind enum
    if (!['text', 'code', 'sheet'].includes(kind)) {
      logger.warn(`[Document API] Invalid kind: ${kind}`);
      return NextResponse.json(
        { error: 'Kind must be one of: text, code, sheet' },
        { status: 400 }
      );
    }

    logger.info(`[Document API] Saving document with id: ${id}`);

    // Check if document exists to reuse userId (for version history consistency)
    const { data: existingDocs } = await supabaseAdmin
      .from('Document')
      .select('userId')
      .eq('id', id)
      .limit(1);

    // Use existing userId if document exists, otherwise generate new UUID
    // This ensures all versions of the same document have the same userId
    let userId: string;
    if (existingDocs && existingDocs.length > 0) {
      userId = existingDocs[0].userId;
      // TODO: Add authorization check
      // if (userId !== session.user.id) {
      //   logger.warn(`[Document API] Forbidden: User does not own document ${id}`);
      //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      // }
    } else {
      // First version - generate new UUID for userId
      // TODO: Replace with session.user.id when authentication is implemented
      userId = generateUUID();
      logger.debug('[Document API] Generated new userId for first version', { userId });
    }

    // Insert new version (creates new row with same id, new createdAt)
    // This enables version history - each save creates a new version
    // IMPORTANT: We use INSERT, not UPDATE, to create a new version
    // The composite primary key (id, createdAt) allows multiple versions per document
    const timestamp = new Date().toISOString();
    
    const { data: document, error } = await supabaseAdmin
      .from('Document')
      .insert({
        id,
        title,
        content: content || null,
        kind,
        userId, // Use existing userId for consistency, or new UUID for first version
        createdAt: timestamp, // New timestamp = new version (never updates existing)
      })
      .select()
      .single();

    if (error) {
      logger.error('[Document API] Error saving document:', error);
      return NextResponse.json(
        { error: 'Failed to save document' },
        { status: 500 }
      );
    }

    logger.info(`[Document API] Successfully saved document version with id: ${id}`);

    return NextResponse.json(document, { status: 200 });
  } catch (error) {
    logger.error('[Document API] Unexpected error in POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/document?id={documentId}&timestamp={timestamp}
 * 
 * Deletes document version(s) from Supabase.
 * 
 * Query Parameters:
 * - id (required): Document ID
 * - timestamp (optional): If provided, deletes all versions after this timestamp
 *                        If not provided, deletes all versions of the document
 * 
 * Returns:
 * - 200: Successfully deleted
 * - 400: Missing id parameter
 * - 500: Server error
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const timestamp = searchParams.get('timestamp');

    if (!id) {
      logger.warn('[Document API] Missing id parameter in DELETE');
      return NextResponse.json(
        { error: 'Parameter id is required' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const session = await getSession();
    // if (!session?.user) {
    //   logger.warn('[Document API] Unauthorized DELETE request');
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    logger.info(`[Document API] Deleting document(s) with id: ${id}${timestamp ? ` after timestamp: ${timestamp}` : ''}`);

    // Build delete query
    let deleteQuery = supabaseAdmin
      .from('Document')
      .delete()
      .eq('id', id);

    // If timestamp provided, delete versions after that timestamp
    if (timestamp) {
      deleteQuery = deleteQuery.gt('createdAt', timestamp);
    }

    // TODO: Add authorization check
    // Verify user owns the document before deleting
    // const { data: existingDocs } = await supabaseAdmin
    //   .from('Document')
    //   .select('userId')
    //   .eq('id', id)
    //   .limit(1);
    //
    // if (existingDocs && existingDocs.length > 0) {
    //   if (existingDocs[0].userId !== session.user.id) {
    //     logger.warn(`[Document API] Forbidden: User does not own document ${id}`);
    //     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    //   }
    // }

    const { error } = await deleteQuery;

    if (error) {
      logger.error('[Document API] Error deleting documents:', error);
      return NextResponse.json(
        { error: 'Failed to delete documents' },
        { status: 500 }
      );
    }

    logger.info(`[Document API] Successfully deleted document(s) with id: ${id}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error('[Document API] Unexpected error in DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
