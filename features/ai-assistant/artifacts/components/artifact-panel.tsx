/**
 * Artifact Panel Component
 * 
 * Purpose: Full-screen split view with chat on left, artifact on right
 * Used in: ChatContainer when artifact is visible
 * Why: Provides split-screen layout for viewing artifacts alongside chat
 * 
 * Layout:
 * - Left side (50%): Chat messages
 * - Right side (50%): Artifact content
 * - Fixed position overlay with animations
 */

'use client';

import { useArtifact } from '../hooks/use-artifact';
import { useDocument } from '../hooks/use-document-swr';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect } from 'react';
import { ArtifactMessages } from './artifact-panel-messages';
import { TextArtifactContent } from '../text/components/text-artifact-content';
import { SheetArtifactContent } from '../sheet/components/sheet-artifact-content';
import { ArtifactCloseButton } from './artifact-close-button';
import { useFullscreen } from '@/features/ai-assistant/providers/fullscreen-context';
import type { AssistantToolRendererRegistry } from '@/features/ai-assistant/model/tool-renderer-registry';

interface ArtifactPanelProps {
  chatId: string;
  messages: any[];
  status: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  input: string;
  setInput: (input: string) => void;
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
  regenerate?: () => void;
  cart?: any;
  dispatchCartAction?: any;
  toolRenderers?: AssistantToolRendererRegistry;
  toolRendererContext?: unknown;
}

/**
 * Artifact Panel Component
 * 
 * Creates a split-screen layout:
 * - Left: Chat messages (50% width)
 * - Right: Artifact content (50% width)
 * 
 * Only renders when artifact.isVisible is true
 */
export function ArtifactPanel({
  chatId,
  messages,
  status,
  input,
  setInput,
  sendMessage,
  regenerate,
  cart,
  dispatchCartAction,
  toolRenderers,
  toolRendererContext,
}: ArtifactPanelProps) {
  const { artifact, setArtifact } = useArtifact();
  const { isFullScreen } = useFullscreen();

  // Fetch document from Supabase when panel is open and not streaming
  const { document: fetchedDocument, mutate: mutateDocument } = useDocument(
    artifact.documentId !== 'init' && artifact.status !== 'streaming'
      ? artifact.documentId
      : null
  );

  // Sync artifact content with fetched document
  useEffect(() => {
    if (fetchedDocument) {
      setArtifact((currentArtifact) => ({
        ...currentArtifact,
        content: fetchedDocument.content || currentArtifact.content,
        title: fetchedDocument.title || currentArtifact.title,
        kind: fetchedDocument.kind || currentArtifact.kind, // Sync kind to ensure correct component renders
      }));
    }
  }, [fetchedDocument, setArtifact]);

  // Determine which kind to use: fetched document kind takes priority, then artifact kind
  const artifactKind = fetchedDocument?.kind || artifact.kind;

  // Don't render if artifact is not visible OR if not in fullscreen mode
  if (!artifact.isVisible || !isFullScreen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        animate={{ opacity: 1 }}
        className="fixed top-0 left-0 z-50 flex h-screen w-screen flex-row bg-background"
        exit={{ opacity: 0, transition: { delay: 0.4 } }}
        initial={{ opacity: 1 }}
      >
        {/* Left Side: Chat Messages (50% width) */}
        <motion.div
          animate={{ width: '50%' }}
          className="flex h-full flex-col border-r bg-background"
          exit={{ width: '100%' }}
          initial={{ width: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <ArtifactMessages
            chatId={chatId}
            messages={messages}
            status={status}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            regenerate={regenerate}
            cart={cart}
            dispatchCartAction={dispatchCartAction}
            toolRenderers={toolRenderers}
            toolRendererContext={toolRendererContext}
          />
        </motion.div>

        {/* Right Side: Artifact Content (50% width) */}
        <motion.div
          animate={{ width: '50%' }}
          className="flex h-full flex-col bg-background"
          exit={{ width: 0 }}
          initial={{ width: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="relative h-full overflow-auto">
            <ArtifactCloseButton />
            
            {artifactKind === 'text' && (
              <TextArtifactContent />
            )}
            
            {artifactKind === 'sheet' && (
              <SheetArtifactContent />
            )}
            
            {/* Future: code, image artifacts */}
            {artifactKind === 'code' && (
              <div className="p-6">
                <pre className="p-4 text-sm overflow-auto bg-muted rounded-lg">
                  <code>{artifact.content}</code>
                </pre>
              </div>
            )}
            
            {/* Fallback: If kind is not recognized, log for debugging */}
            {artifactKind !== 'text' && artifactKind !== 'sheet' && artifactKind !== 'code' && (
              <div className="p-6">
                <p className="text-muted-foreground">
                  Unknown artifact kind: {artifactKind || 'undefined'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Artifact kind: {JSON.stringify({ artifactKind, fetchedKind: fetchedDocument?.kind, artifactKindState: artifact.kind })}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
