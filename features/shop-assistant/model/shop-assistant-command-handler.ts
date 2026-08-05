/** ShopMate cart commands translated into the cart mutation controller. */

import type { AssistantCommand, AssistantCommandDispatcher } from '@/features/ai-assistant/model/assistant-commands';
import type { CartAction } from '@/features/cart/model/cart';
import type { Product } from '@/features/catalog/model/product';
import type { CartMutationController } from './cart-source';

export interface ShopAssistantCommandMap {
  'cart.add-item': { product: Product; quantity: number };
  'cart.remove-item': { productId: string };
  'cart.apply-action': CartAction;
}

export type ShopAssistantCommand = AssistantCommand<ShopAssistantCommandMap>;

export function createShopAssistantCommandHandler(
  cartMutations: CartMutationController
): AssistantCommandDispatcher<ShopAssistantCommandMap> {
  return async function dispatchShopAssistantCommand(command) {
    switch (command.type) {
      case 'cart.add-item':
        return cartMutations.addItem(command.payload.product, command.payload.quantity);
      case 'cart.remove-item':
        return cartMutations.removeItem(command.payload.productId);
      case 'cart.apply-action':
        if (command.payload.type === 'INCREASE_QUANTITY') return cartMutations.increaseQuantity(command.payload.payload);
        if (command.payload.type === 'DECREASE_QUANTITY') return cartMutations.decreaseQuantity(command.payload.payload);
        if (command.payload.type === 'REMOVE_FROM_CART') return cartMutations.removeItem(command.payload.payload);
        return;
    }
  };
}
