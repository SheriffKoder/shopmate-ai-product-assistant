/**
 * Text Artifact Content Component
 * 
 * Purpose: Renders the actual text artifact content on the right side with editing support
 * Used in: ArtifactPanel component
 * Why: Displays the text artifact with markdown rendering and editing capabilities
 * 
 * Features:
 * - Markdown rendering with GitHub Flavored Markdown support
 * - Editable title and content
 * - Auto-save with debounce (5 seconds)
 * - Version history support
 * - Streaming status indicator
 * - Responsive layout with proper padding
 * - Dark mode support
 */

'use client';

import { useArtifact } from '../../hooks/use-artifact';
import { useAssistantStyleConfig } from '@/features/ai-assistant/providers/assistant-style-context';
import { useDocument } from '../../hooks/use-document-swr';
import { useVersionHistoryDebounce } from '../../hooks/version-history-debounce';
import { useVersionHistorySave } from '../../hooks/version-history-save';
import { useVersionHistoryNavigation } from '../../hooks/version-history-navigation';
import { VersionHistoryHeader } from '../../components/version-history-header';
import { VersionHistoryManagementButtons } from '../../components/version-history-management-buttons';
import { ArtifactCopyButton } from '../../components/artifact-copy-button';
import { ArtifactDownloadButton } from '../../components/artifact-download-button';
import { EditableContent } from './version-history-editable-content';
import { MarkdownText } from '@/features/ai-assistant/components/ui/markdown-text';
import { useEffect, useState, useRef } from 'react';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * Text Artifact Content Component
 * 
 * Displays the text artifact content with markdown rendering and editing support.
 * 
 * Features:
 * - Editable title (via VersionHistoryHeader)
 * - Editable content (via EditableContent)
 * - Auto-save with 5-second debounce
 * - Version history tracking
 * - Streaming support (editing disabled during streaming)
 * - Smart content priority: streaming > fetched > artifact state
 * 
 * Editing Flow:
 * 1. User edits title/content
 * 2. Changes trigger debounce timer (5 seconds)
 * 3. Countdown indicator shows remaining time
 * 4. After 5 seconds of inactivity, save is triggered
 * 5. New version created in Supabase (same ID, new createdAt)
 * 6. Version count updates automatically
 */
export function TextArtifactContent() {
  const styles = useAssistantStyleConfig();
  const { artifact, setArtifact } = useArtifact();
  const documentId = artifact.documentId !== 'init' ? artifact.documentId : null;

  // Fetch all document versions from Supabase
  // This provides persistence and version history support
  const { documents, document: latestDocument, mutate: mutateDocuments } = useDocument(documentId);

  // Version navigation hook - manages current version selection
  // Note: We don't use onVersionChange here because we handle syncing via useEffect
  // This prevents conflicts with user editing
  const {
    currentVersion,
    currentIndex,
    canUndo,
    canRedo,
    canNavigate,
    undo,
    redo,
    resetToLatest,
    totalVersions,
  } = useVersionHistoryNavigation({
    documents,
    // Removed onVersionChange - we handle syncing via useEffect instead
  });

  // Determine which document to use: currentVersion (if navigating) or latestDocument
  const activeDocument = currentVersion || latestDocument;

  // Local state for editing (separate from artifact state for immediate UI updates)
  // Priority: active document (from navigation) > artifact state > default
  const [localTitle, setLocalTitle] = useState(
    activeDocument?.title || artifact.title || 'Untitled Document'
  );
  const [localContent, setLocalContent] = useState(
    artifact.status === 'streaming'
      ? artifact.content
      : (activeDocument?.content || artifact.content || '')
  );

  // Use a ref to track if we're in the middle of a user edit
  const isUserEditingRef = useRef(false);
  const lastSyncedDocumentIdRef = useRef<string | null>(null);
  const lastSyncedCreatedAtRef = useRef<string | null>(null);
  const justSavedRef = useRef(false); // Track if we just saved to prevent sync race condition
  
  // Use refs to store latest values to avoid closure stale values
  const latestTitleRef = useRef(localTitle);
  const latestContentRef = useRef(localContent);
  
  // Keep refs in sync with state
  useEffect(() => {
    latestTitleRef.current = localTitle;
    latestContentRef.current = localContent;
  }, [localTitle, localContent]);
  
  // Sync local state with active document when it changes (only if not currently editing)
  // Only sync when the document ID or createdAt changes (version navigation), not on every render
  // IMPORTANT: Do NOT include title/content in dependencies - only sync on version change, not content change
  useEffect(() => {
    const documentId = activeDocument?.id;
    const createdAt = activeDocument?.createdAt;
    
    // Check if this is actually a different document/version
    const isDifferentDocument = 
      documentId !== lastSyncedDocumentIdRef.current ||
      createdAt !== lastSyncedCreatedAtRef.current;
    
    // If we just saved, don't sync at all - wait for the flag to be cleared
    // This prevents race condition where old cached version overwrites new edits
    if (justSavedRef.current) {
      // Don't sync - just return early
      return;
    }
    
    // Only sync if:
    // 1. Not streaming
    // 2. User is not currently editing
    // 3. This is actually a different document/version (not just content update)
    if (
      activeDocument && 
      artifact.status !== 'streaming' && 
      !isUserEditingRef.current &&
      isDifferentDocument
    ) {
      setLocalTitle(activeDocument.title);
      setLocalContent(activeDocument.content || '');
      lastSyncedDocumentIdRef.current = documentId || null;
      lastSyncedCreatedAtRef.current = createdAt || null;
    }
  }, [activeDocument?.id, activeDocument?.createdAt, artifact.status]); // Only sync when document ID or createdAt changes (version navigation)

  // Sync local state with artifact state during streaming and when status changes to complete
  // This ensures localContent stays in sync with artifact.content as it streams
  useEffect(() => {
    if (artifact.status === 'streaming' || artifact.status === 'complete') {
      // During streaming or when just completed, sync with artifact state
      // Only sync if user is not actively editing
      if (!isUserEditingRef.current) {
        setLocalContent(artifact.content);
        if (artifact.title) {
          setLocalTitle(artifact.title);
        }
      }
    }
  }, [artifact.content, artifact.title, artifact.status]);

  // Save hook - handles saving new versions to Supabase
  const { saveVersion, isSaving, error, lastSavedAt } = useVersionHistorySave(documentId);

  // Debounce hook - triggers save after 5 seconds of inactivity
  const { isDebouncing, countdown, triggerDebounce } = useVersionHistoryDebounce({
    delay: 5000,
    onDebounceComplete: async () => {
      if (documentId) {
        try {
          // Use refs to get the absolute latest values (avoid closure stale values)
          const titleToSave = latestTitleRef.current;
          const contentToSave = latestContentRef.current;
          
          logger.debug('[Text Artifact] Saving with values', {
            titleLength: titleToSave.length,
            contentLength: contentToSave.length,
            title: titleToSave,
            contentPreview: contentToSave.substring(0, 50),
          });
          
          // Mark that we're saving to prevent sync race condition
          justSavedRef.current = true;
          
          await saveVersion({
            documentId,
            title: titleToSave,
            content: contentToSave,
            kind: 'text',
          });
          
          // Wait for SWR to refetch and update documents array
          // The mutateDocument() in saveVersion triggers a refetch, but we need to wait
          // for the documents array to actually update before resetting to latest
          // Also manually trigger a refetch to ensure we get the latest data
          await mutateDocuments(undefined, { revalidate: true });
          await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms for refetch to complete
          
          // Now reset to latest version - this will update currentIndex to point to new version
          // The navigation hook's useEffect will also handle this when totalVersions changes,
          // but we explicitly call it here to ensure we switch immediately
          resetToLatest();
          
          // Clear the flag after a delay to allow new version to be fetched and synced
          // Use a longer delay to ensure the new version is available in the database
          setTimeout(() => {
            justSavedRef.current = false;
          }, 2000); // Wait 2 seconds for new version to be available
        } catch (err) {
          logger.error('[Text Artifact] Error saving version', err);
          justSavedRef.current = false; // Reset flag on error
          // Error is already handled by save hook
        }
      }
    },
  });

  /**
   * Handle title change
   * Updates local state, artifact state, and triggers debounce
   */
  const handleTitleChange = (newTitle: string) => {
    setLocalTitle(newTitle);
    setArtifact((prev) => ({ ...prev, title: newTitle }));
    triggerDebounce(); // Start debounce timer
  };

  /**
   * Handle content change
   * Updates local state, artifact state, and triggers debounce
   */
  const handleContentChange = (newContent: string) => {
    isUserEditingRef.current = true; // Mark that user is editing
    setLocalContent(newContent);
    setArtifact((prev) => ({ ...prev, content: newContent }));
    triggerDebounce(); // Start debounce timer
    
    // Reset editing flag after a delay to allow sync on version change
    // Use a longer delay to ensure typing is complete
    setTimeout(() => {
      isUserEditingRef.current = false;
    }, 500);
  };

  // Determine if editing is enabled
  // Editing is ONLY enabled for the latest version (not old versions)
  // Editing is disabled during streaming or if no documentId
  const isStreaming = artifact.status === 'streaming';
  const isAtLatest = currentVersion === null || currentVersion === latestDocument;
  const canEdit = !isStreaming && documentId !== null && isAtLatest;

  // DEBUG: Log status changes and content state
  useEffect(() => {
    logger.debug('[TextArtifactContent] Status/Content update', {
      status: artifact.status,
      isStreaming,
      canEdit,
      documentId,
      contentLength: artifact.content.length,
      localContentLength: localContent.length,
      hasFetchedDocument: !!latestDocument,
      fetchedDocumentLength: latestDocument?.content?.length || 0,
    });
  }, [artifact.status, artifact.content, localContent, isStreaming, canEdit, documentId, latestDocument]);

  // Track if we're in edit mode (not preview mode) to disable undo/redo
  const [isInEditMode, setIsInEditMode] = useState(false);

  // Reset edit mode when navigating to a different version
  useEffect(() => {
    if (!isAtLatest) {
      setIsInEditMode(false); // Reset to preview mode when viewing old version
    }
  }, [currentVersion?.id, currentVersion?.createdAt, isAtLatest]);

  // Content for display (read-only mode)
  const displayContent = isStreaming
    ? artifact.content
    : (localContent || activeDocument?.content || artifact.content || '');

  return (
    <div className={styles.artifacts?.editorClassName}>
      {/* Sticky Header with editable title and version history */}
      <div className={styles.artifacts?.editorHeaderClassName}>
        <VersionHistoryHeader
          documentId={documentId}
          title={localTitle}
          onTitleChange={canEdit ? handleTitleChange : undefined}
          isDebouncing={isDebouncing}
          countdown={countdown}
          isSaving={isSaving}
          lastSavedAt={lastSavedAt}
          isStreaming={isStreaming}
          canEdit={canEdit}
          currentVersionIndex={currentIndex}
          totalVersions={totalVersions}
        />

        {/* Version Navigation Buttons and Copy Button */}
        {documentId && (
          <div className="mt-3 flex items-center gap-2">
            {totalVersions > 0 && (
              <VersionHistoryManagementButtons
                documentId={documentId}
                currentVersionTimestamp={currentVersion?.createdAt || null}
                canUndo={canUndo && !isInEditMode}
                canRedo={canRedo && !isInEditMode}
                canNavigate={canNavigate}
                isAtLatest={isAtLatest}
                onUndo={undo}
                onRedo={redo}
                viewingOldVersionMessage={
                  !isAtLatest && currentVersion
                    ? `Viewing version from ${new Date(currentVersion.createdAt).toLocaleString()}. Only the latest version can be edited.`
                    : null
                }
                kind={artifact.kind || 'text'}
              />
            )}
            <ArtifactCopyButton
              content={displayContent}
              kind={artifact.kind || 'text'}
            />
            <ArtifactDownloadButton
              content={displayContent}
              kind={artifact.kind || 'text'}
              title={localTitle}
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            Error saving: {error.message}
          </div>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-auto p-6 pt-4">
        {canEdit ? (
          <EditableContent
            content={localContent}
            onContentChange={handleContentChange}
            onPreviewModeChange={(isPreview) => setIsInEditMode(!isPreview)}
          />
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <MarkdownText>{displayContent}</MarkdownText>
          </div>
        )}
      </div>
    </div>
  );
}
