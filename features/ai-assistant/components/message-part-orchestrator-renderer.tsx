/**
 * Message Part Renderer
 * 
 * Purpose: Renders individual message parts with generic tool and stream-part registration.
 * Used in: features/ai-assistant/components/message-list.tsx
 * Why: Centralizes reusable assistant message rendering without importing business tool UI.
 *
 * Function Index:
 * MessagePartRenderer: Mount text, reasoning, tool, artifact, and adapter data parts.
 *
 * Steps:
 * 1. Render reasoning and text parts.
 * 2. Mount DocumentPreview from createDocument tool results.
 * 3. Mount DocumentPreview from persisted data-artifactContent when no createDocument card exists.
 * 4. Mount adapter UI from streamPartRenderers keyed by data-* type, forwarding sendMessage + status.
 * 5. Ignore unknown data-* parts without warning.
 */

'use client';

import { MessageResponse } from '@/features/ai-assistant/components/generic/ai-elements/message';
import { Reasoning, ReasoningTrigger, ReasoningContent } from '@/features/ai-assistant/components/generic/ai-elements/reasoning';
import { DefaultToolRenderer } from '../tools/default-tool-renderer';
import { MarkdownText } from './ui/markdown-text';
import { DiscussionCard } from './ui/discussion-card';
import { DocumentPreview } from '@/features/ai-assistant/components/artifacts/components';
import type { AssistantStreamPartRendererRegistry } from '../model/stream-part-renderer-registry';
import type { AssistantToolRendererRegistry } from '../model/tool-renderer-registry';
import {
  getArtifactContentPart,
  hasCreateDocumentPreviewForId,
} from '@/features/ai-assistant/lib/artifact-content-part';

interface MessagePartRendererProps {
  part: any;
  messageId: string;
  partIndex: number;
  sendMessage: (message: { text: string }, options?: { body: any }) => void;
  status?: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  isLastPart?: boolean;
  isLastMessage?: boolean;
  toolRenderers?: AssistantToolRendererRegistry;
  streamPartRenderers?: AssistantStreamPartRendererRegistry;
  toolRendererContext?: unknown;
  /** Sibling parts on the same message, used to avoid duplicate artifact cards. */
  messageParts?: unknown[];
}

export const MessagePartRenderer = ({
  part,
  messageId,
  partIndex,
  sendMessage,
  status,
  isLastPart,
  isLastMessage,
  toolRenderers,
  streamPartRenderers,
  toolRendererContext,
  messageParts,
}: MessagePartRendererProps) => {
  // Render reasoning parts
  if (part.type === 'reasoning') {
    // Do not render an empty reasoning block, including its expandable chevron.
    if (!part.text?.trim()) {
      return null;
    }

    const isStreaming = status === 'streaming' && isLastPart && isLastMessage;
    return (
      <Reasoning
        key={`${messageId}-${partIndex}`}
        className="w-full"
        isStreaming={isStreaming}
      >
        <ReasoningTrigger />
        <ReasoningContent>{part.text || ''}</ReasoningContent>
      </Reasoning>
    );
  }

  // Render step-start parts (just skip them as they're markers)
  if (part.type === 'step-start') {
    return null;
  }

  // Render text parts
  if (part.type === 'text') {
    // Check if text starts with "**Discussion about" and state is "done"
    const isDiscussionHeader = part.text?.startsWith('**Discussion about') && part.state === 'done';
    
    // Extract topic from "**Discussion about [TOPIC]**"
    let discussionTopic: string | null = null;
    if (isDiscussionHeader) {
      const match = part.text.match(/\*\*Discussion about (.+?)\*\*/);
      if (match && match[1]) {
        discussionTopic = match[1];
      }
    }

    // Use DiscussionCard component if it's a discussion header
    if (isDiscussionHeader && discussionTopic) {
      return (
        <DiscussionCard
          key={`${messageId}-${partIndex}`}
          text={part.text}
          topic={discussionTopic}
          className="w-full"
          sendMessage={sendMessage}
        />
      );
    }

    // Regular text rendering
    return (
      <MarkdownText key={`${messageId}-${partIndex}`} className="!text-black">
        {part.text}
      </MarkdownText>
    );
  }


  // Render tool parts (dynamic-tool type)
  if (part.type === 'dynamic-tool') {
    const dynamicToolPart = part as any;

    // Custom rendering for createDocument tool
    if (dynamicToolPart.toolName === 'createDocument') {
      // Check if we have output (result) or input (args)
      if (dynamicToolPart.output && 
          (dynamicToolPart.output.id || dynamicToolPart.output.title || dynamicToolPart.output.kind)) {
        // Tool has completed - show result
        return (
          <DocumentPreview
            key={`${messageId}-${partIndex}`}
            result={{
              id: dynamicToolPart.output.id || '',
              title: dynamicToolPart.output.title || 'Untitled Document',
              kind: dynamicToolPart.output.kind || 'text',
            }}
            isReadonly={false}
          />
        );
      } else if (dynamicToolPart.input) {
        // Tool is being called - show args
        return (
          <DocumentPreview
            key={`${messageId}-${partIndex}`}
            args={dynamicToolPart.input || {}}
            isReadonly={false}
          />
        );
      }
    }

    // Look up adapter-provided renderers so assistant core does not know business tool names.
    const RegisteredToolRenderer = toolRenderers?.[dynamicToolPart.toolName];
    if (RegisteredToolRenderer) {
      return (
        <RegisteredToolRenderer
          toolPart={dynamicToolPart}
          messageId={messageId}
          partIndex={partIndex}
          context={toolRendererContext}
        />
      );
    }

    // Default tool rendering
    return (
      <DefaultToolRenderer
        toolPart={dynamicToolPart}
        messageId={messageId}
        partIndex={partIndex}
      />
    );
  }

  // Catalog sheets (and other runtime artifacts) persist as data-artifactContent, not tool calls.
  // Skip when createDocument already mounted a card for the same id so technical-discussion stays unchanged.
  const artifactContent = getArtifactContentPart(part);
  if (artifactContent?.id && artifactContent.title && artifactContent.kind) {
    if (hasCreateDocumentPreviewForId(messageParts, artifactContent.id)) {
      return null;
    }

    return (
      <DocumentPreview
        key={`${messageId}-${partIndex}`}
        result={{
          id: artifactContent.id,
          title: artifactContent.title,
          kind: artifactContent.kind,
          content: artifactContent.content,
        }}
        isReadonly={false}
      />
    );
  }

  // Adapter data parts (product cards, cart) persist like artifacts. Core does not know business UI.
  const partType = typeof part.type === 'string' ? part.type : '';
  const StreamPartRenderer = partType ? streamPartRenderers?.[partType] : undefined;
  if (StreamPartRenderer) {
    return (
      <StreamPartRenderer
        part={part}
        messageId={messageId}
        partIndex={partIndex}
        context={toolRendererContext}
        sendMessage={sendMessage}
        status={status}
        isLastMessage={isLastMessage}
      />
    );
  }

  // Ignore other data-* parts (thinking steps, deltas, transient product cards).
  if (partType.startsWith('data-')) {
    return null;
  }

  // Filter out internal AI SDK parts that shouldn't be displayed
  // These include: step-finish, text-delta
  // Note: tool-call and tool-result are handled above for createDocument
  // Note: reasoning and step-start are handled above
  const internalPartTypes = ['step-finish', 'text-delta'];
  if (internalPartTypes.includes(part.type)) {
    return null;
  }

  // Default: render as text if type is unknown (but log for debugging)
  // Most unknown types should be filtered out above, but this is a safety net
  console.warn('Unknown message part type:', part.type, part);
  return null;
};
