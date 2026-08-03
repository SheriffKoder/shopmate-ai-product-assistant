/**
 * Cart Info Tool Renderer
 * 
 * Purpose: Renders cartInfo tool output
 * Used in: message-part-orchestrator-renderer.tsx
 * Why: Separates cart info tool rendering logic
 */

'use client';

import { CartItem, CartAction, CartState } from '@/features/shop/model/cart';
import { MarkdownText } from '@/features/ai-assistant/components/ui/markdown-text';
import { CartItemCard } from './cart-item-card';
import { Button } from '@/components/ui/button';

interface CartInfoToolRendererProps {
  toolPart: any;
  messageId: string;
  partIndex: number;
  dispatchCartAction?: (action: CartAction) => void;
  cart?: CartState;
}

export const CartInfoToolRenderer = ({
  toolPart,
  messageId,
  partIndex,
  dispatchCartAction,
  cart,
}: CartInfoToolRendererProps) => {
  if (toolPart.state !== 'output-available' || !toolPart.output) {
    return null;
  }

  const cartOutput = toolPart.output as {
    header: string;
    paragraph: string;
    display: 'all' | 'some';
    productIds?: string[];
    footer?: string;
  };

  // Get displayed items based on display mode
  let displayedItems: CartItem[] = [];
  if (cartOutput.display === 'all') {
    // Use all items from current cart state directly
    displayedItems = cart?.items || [];
  } else {
    // Filter cart items from current cart state using product IDs from tool output
    displayedItems = cart?.items.filter(item => 
      cartOutput.productIds?.includes(item.productId)
    ) || [];
  }

  // Calculate total price from displayed items (using current cart state)
  const totalPrice = displayedItems.reduce((sum, item) => {
    return sum + (item.product.price * item.quantity);
  }, 0);

  // Determine if showing all items (for checkout button)
  // If display is 'all', show checkout if there are any items
  // If display is 'some', only show checkout if displayed items match all cart items
  let showCheckout = false;
  if (cartOutput.display === 'all') {
    showCheckout = displayedItems.length > 0;
  } else {
    const displayedItemIds = new Set(displayedItems.map(item => item.productId));
    const allCartItemIds = new Set(cart?.items.map(item => item.productId) || []);
    showCheckout = 
      displayedItems.length > 0 &&
      displayedItemIds.size === allCartItemIds.size &&
      Array.from(displayedItemIds).every(id => allCartItemIds.has(id)) &&
      Array.from(allCartItemIds).every(id => displayedItemIds.has(id));
  }

  // Update header with actual item count
  // Replace any numbers in the header with the actual count, or show empty message
  let displayHeader = cartOutput.header;
  if (displayedItems.length === 0) {
    // If cart is now empty, show different message
    displayHeader = '## Your Cart is Now Empty';
  } else {
    // Replace numbers in header with actual count
    displayHeader = cartOutput.header.replace(/\d+/g, displayedItems.length.toString());
  }

  return (
    <div key={`${messageId}-${partIndex}`} className="w-full space-y-4">
      {/* Header */}
      {displayHeader && (
        <MarkdownText className="!text-black text-xl font-semibold">
          {displayHeader}
        </MarkdownText>
      )}

      {/* Paragraph */}
      {cartOutput.paragraph && (
        <MarkdownText className="!text-black">
          {cartOutput.paragraph}
        </MarkdownText>
      )}

      {/* Cart Items List */}
      {displayedItems && displayedItems.length > 0 && (
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
              dispatchCartAction={dispatchCartAction}
            />
          ))}
        </div>
      )}

      {/* Separator and Total Price */}
      {displayedItems && displayedItems.length > 0 && (
        <div className="space-y-3">
          {/* Separator */}
          <div className="border-t border-white/10"></div>
          
          {/* Total Price */}
          <div className="flex justify-between items-center">
            <span className="text-black font-semibold text-lg">Total:</span>
            <span className="text-black font-bold text-xl">
              ${totalPrice.toFixed(2)}
            </span>
          </div>

          {/* Checkout Button */}
          {showCheckout && (
            <Button
              className="w-full bg-gradient-to-r from-primary to-secondary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              onClick={() => {
                // Handle checkout - can be implemented later
                console.log('Checkout clicked');
              }}
            >
              Checkout
            </Button>
          )}
        </div>
      )}

      {/* Footer */}
      {cartOutput.footer && (
        <MarkdownText className="text-gray-400 text-sm">
          {cartOutput.footer}
        </MarkdownText>
      )}
    </div>
  );
};
