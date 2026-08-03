/**
 * Legacy Product Hook Compatibility Export
 *
 * Purpose: Temporarily keeps old assistant imports working after legacy product state moved to the ShopMate domain.
 * Used in: Files not yet migrated during the assistant refactor.
 * Used for: Migration compatibility only.
 *
 * Cleanup: Remove in migration phase 08 after all imports use `features/shop/hooks/use-products-legacy`.
 */

export { useProducts } from '@/features/shop/hooks/use-products-legacy';
