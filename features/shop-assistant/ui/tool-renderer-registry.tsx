/**
 * @file features/shop-assistant/ui/tool-renderer-registry.tsx
 * Shop Assistant Tool Renderer Registry
 *
 * Purpose: Registers ShopMate product and cart tool renderers for the generic assistant UI.
 * Used in: features/ai-assistant/chat-container.tsx.
 * Used for: Keeping product/cart visual rendering outside the reusable assistant core.
 *
 * Function Index:
 * ShopAssistantToolRendererContext: Adapter-owned render context for cart interactions.
 * shopAssistantToolRenderers: Tool-name renderer map consumed by MessagePartRenderer.
 *
 * Steps:
 * 1. The chat integration passes ShopMate cart state and dispatch as opaque context.
 * 2. The generic message renderer looks up a renderer by tool name.
 * 3. The ShopMate renderer casts context back to the adapter-owned shape.
 */

'use client';

import type { AssistantToolRendererRegistry } from '@/features/ai-assistant/model/tool-renderer-registry';
import type { CartState } from '@/features/cart/model/cart';
import type { ShopAssistantCommand } from '../model/shop-assistant-command-handler';
import { CartInfoToolRenderer } from '../tools/cart-info/cart-info-tool-renderer';
import { ProductSearchToolRenderer } from '../tools/product-search/product-search-tool-renderer';

export interface ShopAssistantToolRendererContext {
  /** Current cart state used by product and cart renderers. */
  cart?: CartState;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

export const shopAssistantToolRenderers: AssistantToolRendererRegistry<ShopAssistantToolRendererContext> = {
  productSearch: ({ toolPart, messageId, partIndex, context }) => (
    <ProductSearchToolRenderer
      toolPart={toolPart}
      messageId={messageId}
      partIndex={partIndex}
      cart={context?.cart}
      onCommand={context?.onCommand}
    />
  ),
  cartInfo: ({ toolPart, messageId, partIndex, context }) => (
    <CartInfoToolRenderer
      toolPart={toolPart}
      messageId={messageId}
      partIndex={partIndex}
      cart={context?.cart}
      onCommand={context?.onCommand}
    />
  ),
};
