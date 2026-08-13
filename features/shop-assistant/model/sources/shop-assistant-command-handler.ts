/**
 * @file features/shop-assistant/model/sources/shop-assistant-command-handler.ts
 * ShopMate cart commands translated into the cart mutation controller.
 * Used in: ui/integration/shop-assistant-integration.tsx and cart/card UI.
 * Used for: Keeping cart mutations on UI commands, not schema action: cart.
 *
 * Function Index:
 * ShopAssistantCommandMap: Supported cart command payloads.
 * createShopAssistantCommandHandler: Dispatch UI cart commands to CartMutationController.
 *
 * Steps:
 * 1. Add, remove, or apply a cart action from the chat UI.
 * 2. Schema never authorizes these mutations.
 */

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

/**
 * Translate chat cart commands into CartMutationController calls.
 *
 * @example
 * createShopAssistantCommandHandler(cartMutations)({ type: 'cart.remove-item', payload: { productId: 'iphone-15-pro-max' } })
 */
export function createShopAssistantCommandHandler(
  cartMutations: CartMutationController,
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
