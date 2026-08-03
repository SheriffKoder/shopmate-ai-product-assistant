/**
 * Product Type Compatibility Export
 *
 * Purpose: Temporarily keeps old assistant imports working after product types moved to the ShopMate domain.
 * Used in: Files not yet migrated during the assistant refactor.
 * Used for: Migration compatibility only.
 *
 * Cleanup: Remove in migration phase 08 after all imports use `features/shop/model/product`.
 */

export type { Product } from '@/features/shop/model/product';
