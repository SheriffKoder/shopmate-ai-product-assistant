/**
 * @file features/shop-assistant/ui/integration/stream-part-registry.tsx
 * Shop Assistant stream-part renderers for persisted data-* parts.
 * Used in: ui/integration/shop-assistant-config.tsx.
 * Used for: Mounting cards, cart, and conversation metadata from data parts, not AI tool names.
 *
 * Function Index:
 * ShopAssistantStreamPartContext: Adapter-owned render context for cart interactions.
 * shopAssistantStreamPartRenderers: data-productCards / data-cart / data-uiMetadata renderer map.
 *
 * Steps:
 * 1. Integration passes live cart + command handler as opaque context.
 * 2. MessagePartRenderer looks up a renderer by part.type and forwards sendMessage + status.
 * 3. This registry parses the payload and mounts ProductCards, CartPanel, or Find chips.
 */

'use client';

import type { AssistantStreamPartRendererRegistry } from '@/features/ai-assistant/model/stream-part-renderer-registry';
import type { CartState } from '@/features/cart/model/cart';
import { getProductCardsPart } from '../../lib/stream/get-product-cards-part';
import { getCartPart } from '../../lib/stream/get-cart-part';
import { getUiMetadataPart } from '../../lib/stream/get-ui-metadata-part';
import type { ShopAssistantCommand } from '../../model/sources/shop-assistant-command-handler';
import { ProductCards } from '../cards/product-cards';
import { CartPanel } from '../cart/cart-panel';
import { MetadataButtons } from '../metadata/buttons';

export interface ShopAssistantStreamPartContext {
  cart?: CartState;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

export const shopAssistantStreamPartRenderers: AssistantStreamPartRendererRegistry<ShopAssistantStreamPartContext> = {
  'data-productCards': ({ part, messageId, partIndex, context }) => {
    const payload = getProductCardsPart(part);
    if (!payload) return null;

    return (
      <ProductCards
        part={payload}
        messageId={messageId}
        partIndex={partIndex}
        cart={context?.cart}
        onCommand={context?.onCommand}
      />
    );
  },
  'data-cart': ({ part, messageId, partIndex, context }) => {
    const payload = getCartPart(part);
    if (!payload) return null;

    return (
      <CartPanel
        part={payload}
        messageId={messageId}
        partIndex={partIndex}
        cart={context?.cart}
        onCommand={context?.onCommand}
      />
    );
  },
  'data-uiMetadata': ({ part, messageId, partIndex, sendMessage, status, isLastMessage }) => {
    const payload = getUiMetadataPart(part);
    if (!payload) return null;

    switch (payload.type) {
      case 'buttons':
        return (
          <MetadataButtons
            part={payload}
            messageId={messageId}
            partIndex={partIndex}
            sendMessage={sendMessage}
            status={status}
            isLastMessage={isLastMessage}
          />
        );
      default:
        return null;
    }
  },
};
