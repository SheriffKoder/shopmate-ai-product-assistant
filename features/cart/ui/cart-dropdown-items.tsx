'use client';

import { CartItemCard } from '@/features/shop-assistant/tools/cart-info/cart-item-card';
import type { ShopAssistantCommand } from '@/features/shop-assistant/model/shop-assistant-command-handler';
import type { CartDropdownItem } from './cart-dropdown.types';

interface CartDropdownItemsProps {
  items: CartDropdownItem[];
  removeItem?: (productId: string) => Promise<void>;
  decreaseQuantity?: (productId: string) => Promise<void>;
  increaseQuantity?: (productId: string) => Promise<void>;
}

export function CartDropdownItems({ items, removeItem, decreaseQuantity, increaseQuantity }: CartDropdownItemsProps) {
  if (items.length === 0) {
    return <div className="px-4 py-8 text-center text-white/60 text-sm">Your cart is empty</div>;
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      {items.map((item) => (
        <CartItemCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          badge={item.badge}
          price={item.price}
          quantity={item.quantity}
          image={item.image}
          productId={item.productId}
          onCommand={(command: ShopAssistantCommand) => {
            if (command.type === 'cart.remove-item') return removeItem?.(command.payload.productId);
            if (command.type !== 'cart.apply-action') return;
            if (command.payload.type === 'DECREASE_QUANTITY') return decreaseQuantity?.(command.payload.payload);
            if (command.payload.type === 'INCREASE_QUANTITY') return increaseQuantity?.(command.payload.payload);
          }}
        />
      ))}
    </div>
  );
}
