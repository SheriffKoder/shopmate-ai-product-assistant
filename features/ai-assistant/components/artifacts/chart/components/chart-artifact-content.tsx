/**
 * Chart Artifact Content Component
 * 
 * Purpose: Renders the actual chart artifact content on the right side of the panel
 * Used in: ArtifactPanel component
 * Why: Displays the chart artifact with chart rendering capabilities
 * 
 * Features:
 * - Editable title
 * - Auto-save with debounce (5 seconds)
 * - Version history support
 * - Streaming status indicator
 * - Responsive layout with proper padding
 * - Dark mode support
 * - Chart is read-only (JSON content cannot be edited directly)
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
import { ChartRenderer } from './chart-renderer';
import { useEffect, useState, useRef } from 'react';
import { logger } from '@/features/ai-assistant/lib/logger';

/**
 * Chart Artifact Content Component
 * 
 * Displays the chart artifact content with chart rendering support.
 * 
 * Features:
 * - Editable title (via VersionHistoryHeader)
 * - Read-only chart content (JSON cannot be edited directly)
 * - Auto-save with 5-second debounce (title only)
 * - Version history tracking
 * - Streaming support (chart updates in real-time during streaming)
 * - Smart content priority: streaming > fetched > artifact state
 * 
 * Editing Flow:
 * 1. User edits title
 * 2. Changes trigger debounce timer (5 seconds)
 * 3. Countdown indicator shows remaining time
 * 4. After 5 seconds of inactivity, save is triggered
 * 5. New version created in Supabase (same ID, new createdAt)
 * 6. Version count updates automatically
 */
export function ChartArtifactContent() {
  const { artifact, setArtifact } = useArtifact();
  const documentId = artifact.documentId !== 'init' ? artifact.documentId : null;

  // Fetch all document versions from Supabase
  // This provides persistence and version history support
  const { documents, document: latestDocument, mutate: mutateDocuments } = useDocument(documentId);

  // Version navigation hook - manages current version selection
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
  });

  // Determine which document to use: currentVersion (if navigating) or latestDocument
  const activeDocument = currentVersion || latestDocument;

  // Local state for editing (separate from artifact state for immediate UI updates)
  // Priority: active document (from navigation) > artifact state > default
  const [localTitle, setLocalTitle] = useState(
    activeDocument?.title || artifact.title || 'Untitled Chart'
  );
  const [localJson, setLocalJson] = useState(
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
  const latestJsonRef = useRef(localJson);
  
  // Keep refs in sync with state
  useEffect(() => {
    latestTitleRef.current = localTitle;
    latestJsonRef.current = localJson;
  }, [localTitle, localJson]);

  // Sync local state with active document when it changes (only if not currently editing)
  // Only sync when the document ID or createdAt changes (version navigation), not on every render
  useEffect(() => {
    const documentId = activeDocument?.id;
    const createdAt = activeDocument?.createdAt;
    
    // Check if this is actually a different document/version
    const isDifferentDocument = 
      documentId !== lastSyncedDocumentIdRef.current ||
      createdAt !== lastSyncedCreatedAtRef.current;
    
    // If we just saved, don't sync at all - wait for the flag to be cleared
    if (justSavedRef.current) {
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
      setLocalJson(activeDocument.content || '');
      lastSyncedDocumentIdRef.current = documentId || null;
      lastSyncedCreatedAtRef.current = createdAt || null;
    }
  }, [activeDocument?.id, activeDocument?.createdAt, artifact.status]);

  // Sync local state with artifact state during streaming and when status changes to complete
  // This ensures localJson stays in sync with artifact.content as it streams
  useEffect(() => {
    if (artifact.status === 'streaming' || artifact.status === 'complete') {
      // During streaming or when just completed, sync with artifact state
      // Only sync if user is not actively editing
      if (!isUserEditingRef.current) {
        setLocalJson(artifact.content);
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
          const jsonToSave = latestJsonRef.current;
          
          logger.debug('[Chart Artifact] Saving with values', {
            titleLength: titleToSave.length,
            jsonLength: jsonToSave.length,
            title: titleToSave,
            jsonPreview: jsonToSave.substring(0, 100),
          });
          
          // Mark that we're saving to prevent sync race condition
          justSavedRef.current = true;
          
          await saveVersion({
            documentId,
            title: titleToSave,
            content: jsonToSave,
            kind: 'chart',
          });
          
          // Wait for SWR to refetch and update documents array
          await mutateDocuments(undefined, { revalidate: true });
          await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms for refetch to complete
          
          // Now reset to latest version
          resetToLatest();
          
          // Clear the flag after a delay to allow new version to be fetched and synced
          setTimeout(() => {
            justSavedRef.current = false;
          }, 2000); // Wait 2 seconds for new version to be available
        } catch (err) {
          logger.error('[Chart Artifact] Error saving version', err);
          justSavedRef.current = false; // Reset flag on error
        }
      }
    },
  });

  /**
   * Handle title change
   * Updates local state, artifact state, and triggers debounce
   */
  const handleTitleChange = (newTitle: string) => {
    isUserEditingRef.current = true; // Mark that user is editing
    setLocalTitle(newTitle);
    setArtifact((prev) => ({ ...prev, title: newTitle }));
    triggerDebounce(); // Start debounce timer
    
    // Reset editing flag after a delay
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

  // Content for display
  const displayJson = isStreaming
    ? artifact.content
    : (localJson || activeDocument?.content || artifact.content || '');

  return (
    <div className="h-full flex flex-col text-foreground">
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
                kind={artifact.kind || 'chart'}
              />
            )}
            <ArtifactCopyButton
              content={displayJson}
              kind={artifact.kind || 'chart'}
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
        <ChartRenderer
          jsonContent={displayJson}
          isPreview={false}
        />
      </div>
    </div>
  );
}

