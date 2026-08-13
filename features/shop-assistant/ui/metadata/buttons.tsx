/**
 * @file features/shop-assistant/ui/metadata/buttons.tsx
 * Conversation Find chips mounted from a persisted data-uiMetadata part.
 * Used in: ui/integration/stream-part-registry.tsx when metadata.type is buttons.
 * Used for: Advice first; catalog cards only after a visible follow-up turn.
 *
 * Function Index:
 * MetadataButtons: Find + items.map → sendMessage(Provide X from the catalog).
 *
 * Steps:
 * 1. Skip when there are no items or no sendMessage.
 * 2. Skip while the current reply is still streaming or submitted.
 * 3. Each chip sends a visible user prompt. No silent businessContext bypass.
 */

'use client';

import { Button } from '@/components/ui/button';
import type { AssistantSendMessage } from '@/features/ai-assistant/model/stream-part-renderer-registry';
import {
  buildProvideCatalogPrompt,
  type UiMetadataPart,
} from '../../lib/stream/get-ui-metadata-part';
import { SearchIcon } from 'lucide-react';

interface MetadataButtonsProps {
  part: UiMetadataPart;
  messageId: string;
  partIndex: number;
  sendMessage?: AssistantSendMessage;
  status?: 'idle' | 'streaming' | 'submitted' | 'error' | 'ready';
  isLastMessage?: boolean;
}

/**
 * Mount Find chips under a conversation reply.
 *
 * @example
 * <MetadataButtons
 *   part={{ type: 'buttons', items: [{ label: 'Tablets', value: 'tablet' }] }}
 *   messageId="m1"
 *   partIndex={2}
 *   sendMessage={sendMessage}
 * />
 */
export function MetadataButtons({
  part,
  messageId,
  partIndex,
  sendMessage,
  status,
  isLastMessage,
}: MetadataButtonsProps) {
  if (part.type !== 'buttons' || part.items.length === 0 || !sendMessage) return null;
  // data-uiMetadata can arrive before speaker text. Wait until this reply finishes.
  const isReplyInProgress =
    isLastMessage === true && (status === 'streaming' || status === 'submitted');
  if (isReplyInProgress) return null;
  // Nested click handlers do not keep the optional-prop narrow from the guard above.
  const submitMessage = sendMessage;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-sm text-black/70">Find</span>
      {part.items.map((item) => {
        function sendProvideCatalogQuery() {
          submitMessage({
            text: buildProvideCatalogPrompt(item.value, part.maxPrice),
          });
        }

        return (
          <Button
            key={`${messageId}-${partIndex}-${item.value}`}
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer rounded-none bg-foreground hover:bg-foreground/80 text-background font-button"
            onClick={sendProvideCatalogQuery}
          >
            {item.label} <SearchIcon className="w-4 h-4" />
          </Button>
        );
      })}
    </div>
  );
}
