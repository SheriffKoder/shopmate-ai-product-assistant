/**
 * Shop Context Compatibility Export
 *
 * Purpose: Temporarily keeps old assistant imports working after shop state moved to the ShopMate domain.
 * Used in: Files not yet migrated during the assistant refactor.
 * Used for: Migration compatibility only.
 *
 * Cleanup: Remove in migration phase 08 after all imports use `features/shop/providers/shop-context`.
 */

export { ShopProvider, useShop } from '@/features/shop/providers/shop-context';
