/**
 * @file features/shop-assistant/ui/cards/product-cards.tsx
 * Catalog card grid mounted from a persisted data-productCards part.
 * Used in: ui/integration/stream-part-registry.tsx.
 * Used for: Chat remount after refresh without a productSearch AI tool.
 *
 * Function Index:
 * ProductCards: Header, paragraph, lookup-row cards, optional footer.
 *
 * Steps:
 * 1. Render copy from the persisted payload.
 * 2. Mount one ProductCard per lookup row.
 */

'use client';

import type { CartState } from '@/features/cart/model/cart';
import { MarkdownText } from '@/features/ai-assistant/components/ui/markdown-text';
import type { ProductCardsPart } from '../../transform/catalog/product-cards-part';
import type { ShopAssistantCommand } from '../../model/sources/shop-assistant-command-handler';
import { ProductCard } from './product-card';

interface ProductCardsProps {
  part: ProductCardsPart;
  messageId: string;
  partIndex: number;
  cart?: CartState;
  onCommand?: (command: ShopAssistantCommand) => void | Promise<void>;
}

/**
 * Mount catalog cards from a persisted stream payload.
 *
 * @example
 * <ProductCards part={payload} messageId="m1" partIndex={0} onCommand={commandHandler} />
 */
export function ProductCards({
  part,
  messageId,
  partIndex,
  cart,
  onCommand,
}: ProductCardsProps) {
  return (
    <div key={`${messageId}-${partIndex}`} className="w-full space-y-4">
      {part.header && (
        <MarkdownText className="!text-black text-xl font-semibold">
          {part.header}
        </MarkdownText>
      )}

      {part.paragraph && (
        <MarkdownText className="!text-black">
          {part.paragraph}
        </MarkdownText>
      )}

      {part.products.length > 0 && (
        <div className="flex flex-row gap-4 mt-4 flex-wrap">
          {part.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cart={cart}
              onCommand={onCommand}
            />
          ))}
        </div>
      )}

      {part.footer && (
        <MarkdownText className="text-gray-400 text-sm">
          {part.footer}
        </MarkdownText>
      )}
    </div>
  );
}
