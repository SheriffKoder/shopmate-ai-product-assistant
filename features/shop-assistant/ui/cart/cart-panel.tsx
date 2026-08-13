/**
 * @file features/shop-assistant/ui/cart/cart-panel.tsx
 * Cart UI mounted from a persisted data-cart part.
 * Used in: ui/integration/stream-part-registry.tsx.
 * Used for: Chat remount after refresh without a cartInfo AI tool.
 *
 * Function Index:
 * CartPanel: Header, live or snapshot items, total, checkout.
 *
 * Steps:
 * 1. Prefer live cart from context so quantity edits update immediately.
 * 2. Fall back to the persisted snapshot when live cart is missing.
 * 3. Mutations stay on UI commands.
 */

'use client';

import type { CartItem, CartState } from '@/features/cart/model/cart';
import { MarkdownText } from '@/features/ai-assistant/components/ui/markdown-text';
import { Button } from '@/components/ui/button';
import type { CartRenderPayload } from '../../server/render/cart';
import type { ShopAssistantCommand } from '../../model/sources/shop-assistant-command-handler';
import { CartItemCard } from './cart-item-card';

interface CartPanelProps {
  part: CartRenderPayload;
  messageId: string;
  partIndex: number;
  cart?: CartState;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

/**
 * Mount cart UI from a persisted stream payload, using live cart when available.
 *
 * @example
 * <CartPanel part={payload} messageId="m1" partIndex={0} cart={cart} onCommand={commandHandler} />
 */
export function CartPanel({
  part,
  messageId,
  partIndex,
  cart,
  onCommand,
}: CartPanelProps) {
  // 1. Live cart wins so remove/increase/decrease show immediately. Snapshot is for remount.
  const displayedItems: CartItem[] = cart?.items ?? part.items;
  const totalPrice = cart?.totalPrice ?? displayedItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);
  const displayHeader = displayedItems.length === 0 ? 'Your cart is now empty' : part.header;
  const displayParagraph = displayedItems.length === 0
    ? (cart ? 'Your cart is empty.' : part.paragraph)
    : part.paragraph;

  return (
    <div key={`${messageId}-${partIndex}`} className="w-full space-y-4">
      {displayHeader && (
        <MarkdownText className="!text-black text-xl font-semibold">
          {displayHeader}
        </MarkdownText>
      )}

      {displayParagraph && (
        <MarkdownText className="!text-black">
          {displayParagraph}
        </MarkdownText>
      )}

      {displayedItems.length > 0 && (
        <div className="mt-4 space-y-0 bg-[#191919]/20 backdrop-blur-xl rounded-lg border border-white/20 overflow-hidden">
          {displayedItems.map((item) => (
            <CartItemCard
              key={item.productId}
              id={item.productId}
              title={item.product.name}
              description={item.product.shortDescription}
              badge={item.quantity > 1 ? `Qty: ${item.quantity}` : undefined}
              price={item.product.price}
              quantity={item.quantity}
              image={item.product.image_url || undefined}
              productId={item.productId}
              onCommand={onCommand}
            />
          ))}
        </div>
      )}

      {displayedItems.length > 0 && (
        <div className="space-y-3">
          <div className="border-t border-white/10"></div>
          <div className="flex justify-between items-center">
            <span className="text-black font-semibold text-lg">Total:</span>
            <span className="text-black font-bold text-xl">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full bg-foreground text-background font-semibold py-2 px-4 transition-colors hover:bg-primary hover:text-foreground cursor-pointer"
            onClick={() => {
              console.log('Checkout clicked');
            }}
          >
            Checkout
          </Button>
        </div>
      )}

      {part.footer && displayedItems.length > 0 && (
        <MarkdownText className="text-gray-400 text-sm">
          {part.footer}
        </MarkdownText>
      )}
    </div>
  );
}
