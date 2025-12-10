/**
 * Document Preview Component
 * 
 * Purpose: Conditionally renders preview card (when panel closed) or button (when panel open)
 * Used in: Message list when artifacts are created
 * Why: Shows artifact preview in messages, clickable to open artifact panel
 * 
 * Key Behavior:
 * - When artifact.isVisible === false: Shows preview card with content (overflow hidden, ~257px height)
 * - When artifact.isVisible === true: Shows small button (DocumentToolResult or DocumentToolCall)
 */

'use client';

import { useMemo, useRef, useEffect, useCallback, memo } from 'react';
import { useArtifact } from '../../hooks/use-artifact';
import { useDocument } from '../../hooks/use-document-swr';
import { DocumentToolCall } from '../../components/document-tool-call';
import { DocumentToolResult } from '../../components/document-tool-result';
import { DocumentHeader } from '../../components/document-header-chat-card';
import { DocumentContent } from '../../components/document-content-chat-card';
import { DocumentSkeleton } from '../../components/document-skeleton-chat-card';
import { Maximize2 } from 'lucide-react';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';

interface DocumentPreviewProps {
  isReadonly?: boolean;
  result?: {
    id: string;
    title: string;
    kind: 'text' | 'code' | 'sheet';
  };
  args?: {
    title: string;
    kind: 'text' | 'code' | 'sheet';
  };
}

/**
 * Document Preview Component
 * 
 * Conditionally renders based on artifact visibility:
 * - Panel OPEN: Shows button (compact view)
 * - Panel CLOSED: Shows preview card (with content)
 */
export function DocumentPreview({
  isReadonly = false,
  result,
  args,
}: DocumentPreviewProps) {
  // ALL HOOKS MUST BE CALLED FIRST (before any conditional returns)
  const { artifact, setArtifact } = useArtifact();
  const hitboxRef = useRef<HTMLDivElement>(null);

  // Track bounding box for animation transitions
  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();
    if (artifact.documentId && artifact.documentId !== 'init' && boundingBox) {
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  // Determine this preview's document ID (from result or args)
  const previewDocumentId = useMemo(() => {
    if (result?.id) return result.id;
    // For args, we can't know the ID until the tool completes
    return null;
  }, [result]);

  // Fetch document from Supabase if we have a document ID and it's not currently streaming
  // This provides persistence for completed documents
  const { document: fetchedDocument } = useDocument(
    previewDocumentId && artifact.status !== 'streaming' ? previewDocumentId : null
  );

  // When artifact panel is CLOSED: show preview card
  // Use artifact state ONLY if it matches this preview's document ID
  // This prevents all previews from showing the same streaming content
  const document = useMemo(() => {
    // Priority 1: Use fetched document from Supabase (persisted version)
    if (fetchedDocument && previewDocumentId === fetchedDocument.id) {
      return {
        title: fetchedDocument.title || result?.title || args?.title || 'Untitled Document',
        kind: fetchedDocument.kind as 'text' | 'code' | 'sheet' || result?.kind || args?.kind || 'text',
        content: fetchedDocument.content || '',
        id: fetchedDocument.id,
      };
    }

    // Priority 2: Use artifact state ONLY if it matches this preview's document ID
    // This ensures each preview only shows content for its own document during streaming
    const artifactMatchesPreview = 
      previewDocumentId && 
      artifact.documentId !== 'init' && 
      artifact.documentId === previewDocumentId;
    
    if (artifactMatchesPreview && (artifact.content || artifact.title)) {
      return {
        title: artifact.title || result?.title || args?.title || 'Untitled Document',
        kind: artifact.kind || result?.kind || args?.kind || 'text',
        content: artifact.content || '',
        id: artifact.documentId,
      };
    }
    
    // Priority 3: Use result if available (for completed documents without Supabase data)
    if (result) {
      return {
        title: result.title || 'Untitled Document',
        kind: result.kind || 'text',
        content: '', // Don't use artifact.content here - it might be from a different document
        id: result.id,
      };
    }
    
    // Priority 4: Use args if available (tool call in progress)
    // Only show title, no content until tool completes
    if (args) {
      return {
        title: args.title || 'Untitled Document',
        kind: args.kind || 'text',
        content: '', // Don't show content for args - wait for result
        id: '', // No ID yet for args
      };
    }
    
    return null;
  }, [artifact, result, args, previewDocumentId, fetchedDocument]);

  // NOW we can do conditional returns (after all hooks are called)
  // When artifact panel is OPEN: show button only
  // When artifact panel is CLOSED: show preview card
  if (artifact.isVisible) {
    // Panel is open - show compact button
    if (result) {
      return (
        <DocumentToolResult
          isReadonly={isReadonly}
          result={{ id: result.id, title: result.title, kind: result.kind }}
          type="create"
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          args={{ title: args.title, kind: args.kind }}
          isReadonly={isReadonly}
          type="create"
        />
      );
    }
    
    // If panel is open but no result/args, still show button with artifact data
    if (artifact.documentId !== 'init' || artifact.title) {
      return (
        <DocumentToolResult
          isReadonly={isReadonly}
          result={{
            id: artifact.documentId !== 'init' ? artifact.documentId : '',
            title: artifact.title || 'Untitled Document',
            kind: artifact.kind || 'text',
          }}
          type="create"
        />
      );
    }
  }

  // Panel is closed - show preview card
  // Show loading skeleton only if we have absolutely no data
  if (!document || (!document.title && !result && !args)) {
    return <DocumentSkeleton artifactKind={result?.kind ?? args?.kind ?? artifact.kind ?? 'text'} />;
  }
  
  // Even if content is empty, show the preview card with title
  // This ensures the card appears when panel is closed

  return (
    <div className="relative w-full cursor-pointer" ref={hitboxRef}>
      {/* Clickable hitbox layer - entire card is clickable */}
      <HitboxLayer
        hitboxRef={hitboxRef as React.RefObject<HTMLDivElement>}
        result={result}
        args={args}
        setArtifact={setArtifact}
      />
      
      {/* Preview Card */}
      <DocumentHeader
        isStreaming={artifact.status === 'streaming'}
        kind={document.kind}
        title={document.title}
      />
      <DocumentContent document={document} />
    </div>
  );
}

/**
 * Hitbox Layer Component
 * 
 * Makes the entire preview card clickable to open the artifact panel
 */
const PureHitboxLayer = ({
  hitboxRef,
  result,
  args,
  setArtifact,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result?: any;
  args?: any;
  setArtifact: any;
}) => {
  const { isFullScreen } = useFullscreen();
  
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      
      // Only open artifact panel if in fullscreen mode
      if (!isFullScreen) {
        return;
      }
      
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setArtifact((artifact: any) => {
        // Preserve existing artifact state, just make it visible
        const updatedArtifact = {
          ...artifact,
          // Update with result/args if available and artifact is empty
          title: artifact.title || result?.title || args?.title || artifact.title,
          documentId: artifact.documentId !== 'init' ? artifact.documentId : (result?.id || artifact.documentId),
          kind: artifact.kind || result?.kind || args?.kind || artifact.kind,
          isVisible: true,
          boundingBox: {
            left: boundingBox.x,
            top: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height,
          },
        };
        return updatedArtifact;
      });
    },
    [setArtifact, result, args, isFullScreen]
  );

  return (
    <>
      {/* Header area - clickable to open panel */}
      <div
        className="absolute top-0 left-0 z-10 w-full h-[57px] cursor-pointer rounded-t-xl"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
      />
      
      {/* Maximize button - separate clickable area */}
      <div 
        className="absolute top-[13px] right-[9px] z-20 rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e as any);
          }
        }}
      >
        <Maximize2 size={16} className="text-muted-foreground" />
      </div>
    </>
  );
};

const HitboxLayer = memo(PureHitboxLayer);

