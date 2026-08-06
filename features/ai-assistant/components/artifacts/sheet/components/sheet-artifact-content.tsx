/**
 * Sheet Artifact Content Component
 * 
 * Purpose: Renders the actual sheet artifact content on the right side of the panel with editing support
 * Used in: ArtifactPanel component
 * Why: Displays the sheet artifact with table rendering and editing capabilities
 * 
 * Features:
 * - Editable title and table cells
 * - Auto-save with debounce (5 seconds)
 * - Version history support
 * - Streaming status indicator
 * - Responsive layout with proper padding
 * - Dark mode support
 */

'use client';

import { useArtifact } from '../../hooks/use-artifact';
import { useDocument } from '../../hooks/use-document-swr';
import { useVersionHistoryDebounce } from '../../hooks/version-history-debounce';
import { useVersionHistorySave } from '../../hooks/version-history-save';
import { useVersionHistoryNavigation } from '../../hooks/version-history-navigation';
import { VersionHistoryHeader } from '../../components/version-history-header';
import { VersionHistoryManagementButtons } from '../../components/version-history-management-buttons';
import { ArtifactCopyButton } from '../../components/artifact-copy-button';
import { ArtifactDownloadButton } from '../../components/artifact-download-button';
import { EditableTable } from './editable-table';
import { Table } from './table-non-edit';
import { useEffect, useState, useRef } from 'react';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * Sheet Artifact Content Component
 * 
 * Displays the sheet artifact content with table editing support.
 * 
 * Features:
 * - Editable title (via VersionHistoryHeader)
 * - Editable table cells (via EditableTable)
 * - Auto-save with 5-second debounce
 * - Version history tracking
 * - Streaming support (editing disabled during streaming)
 * - Smart content priority: streaming > fetched > artifact state
 * 
 * Editing Flow:
 * 1. User edits cell or title
 * 2. Changes trigger debounce timer (5 seconds)
 * 3. Countdown indicator shows remaining time
 * 4. After 5 seconds of inactivity, save is triggered
 * 5. New version created in Supabase (same ID, new createdAt)
 * 6. Version count updates automatically
 */
export function SheetArtifactContent() {
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
    activeDocument?.title || artifact.title || 'Untitled Sheet'
  );
  const [localCsv, setLocalCsv] = useState(
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
  const latestCsvRef = useRef(localCsv);
  
  // Keep refs in sync with state
  useEffect(() => {
    latestTitleRef.current = localTitle;
    latestCsvRef.current = localCsv;
  }, [localTitle, localCsv]);

  // Sync local state with artifact state during streaming and when status changes to complete
  // This ensures localCsv stays in sync with artifact.content as it streams
  useEffect(() => {
    if (artifact.status === 'streaming' || artifact.status === 'complete') {
      // During streaming or when just completed, sync with artifact state
      // Only sync if user is not actively editing
      if (!isUserEditingRef.current) {
        setLocalCsv(artifact.content);
        if (artifact.title) {
          setLocalTitle(artifact.title);
        }
      }
    }
  }, [artifact.content, artifact.title, artifact.status]);

  // Sync with active document (when navigating versions)
  // Only sync when:
  // 1. Document ID or createdAt changes (version navigation)
  // 2. Not currently streaming
  // 3. User is not actively editing
  // 4. We haven't just saved (to prevent race condition)
  useEffect(() => {
    if (justSavedRef.current) {
      return; // Don't sync immediately after save
    }

    if (
      activeDocument &&
      artifact.status !== 'streaming' &&
      !isUserEditingRef.current &&
      (lastSyncedDocumentIdRef.current !== documentId ||
       lastSyncedCreatedAtRef.current !== activeDocument.createdAt)
    ) {
      setLocalTitle(activeDocument.title);
      setLocalCsv(activeDocument.content || '');
      lastSyncedDocumentIdRef.current = documentId || null;
      lastSyncedCreatedAtRef.current = activeDocument.createdAt || null;
    }
  }, [activeDocument, artifact.status, documentId]);

  // Save hook
  const { saveVersion, isSaving, error, lastSavedAt } = useVersionHistorySave(documentId);

  // Debounce hook - triggers save after 5 seconds of inactivity
  const { isDebouncing, countdown, triggerDebounce } = useVersionHistoryDebounce({
    delay: 5000,
    onDebounceComplete: async () => {
      if (documentId) {
        try {
          // Use refs to get the absolute latest values (avoid closure stale values)
          const titleToSave = latestTitleRef.current;
          const csvToSave = latestCsvRef.current;
          
          logger.debug('[Sheet Artifact] Saving with values', {
            titleLength: titleToSave.length,
            csvLength: csvToSave.length,
            title: titleToSave,
            csvPreview: csvToSave.substring(0, 100),
          });
          
          // Mark that we're saving to prevent sync race condition
          justSavedRef.current = true;
          
          await saveVersion({
            documentId,
            title: titleToSave,
            content: csvToSave,
            kind: 'sheet',
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
          logger.error('[Sheet Artifact] Error saving version', err);
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
   * Handle CSV content change (from cell edits)
   * Updates local state, artifact state, and triggers debounce
   */
  const handleCsvChange = (newCsv: string) => {
    isUserEditingRef.current = true; // Mark that user is editing
    setLocalCsv(newCsv);
    setArtifact((prev) => ({ ...prev, content: newCsv }));
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

  // Content for display (read-only mode)
  const displayCsv = isStreaming
    ? artifact.content
    : (localCsv || activeDocument?.content || artifact.content || '');

  return (
    <div className="h-full flex flex-col text-black">
      {/* Sticky Header with editable title and version history */}
      <div className="sticky top-0 z-10 bg-background border-b p-6 pb-4">
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
                canUndo={canUndo}
                canRedo={canRedo}
                canNavigate={canNavigate}
                isAtLatest={isAtLatest}
                onUndo={undo}
                onRedo={redo}
                viewingOldVersionMessage={
                  !isAtLatest && currentVersion
                    ? `Viewing version from ${new Date(currentVersion.createdAt).toLocaleString()}. Only the latest version can be edited.`
                    : null
                }
                kind={artifact.kind || 'sheet'}
              />
            )}
            <ArtifactCopyButton
              content={displayCsv}
              kind={artifact.kind || 'sheet'}
            />
            <ArtifactDownloadButton
              content={displayCsv}
              kind={artifact.kind || 'sheet'}
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
          <EditableTable
            csvContent={localCsv}
            onContentChange={handleCsvChange}
            isReadonly={false}
          />
        ) : (
          <Table 
            csvContent={displayCsv} 
            isPreview={false} 
            isStreaming={isStreaming} 
          />
        )}
      </div>
    </div>
  );
}
