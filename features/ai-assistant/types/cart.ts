/**
 * Cart Type Compatibility Export
 *
 * Purpose: Temporarily keeps old assistant imports working after cart types moved to the ShopMate domain.
 * Used in: Files not yet migrated during the assistant refactor.
 * Used for: Migration compatibility only.
 *
 * Cleanup: Remove in migration phase 08 after all imports use `features/shop/model/cart`.
 */

export type { CartAction, CartItem, CartState } from '@/features/shop/model/cart';
