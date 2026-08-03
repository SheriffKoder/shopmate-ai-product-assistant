/**
 * Initial Product Data Compatibility Export
 *
 * Purpose: Temporarily keeps old assistant imports working after mock catalog data moved to the ShopMate domain.
 * Used in: Files not yet migrated during the assistant refactor.
 * Used for: Migration compatibility only.
 *
 * Cleanup: Remove in migration phase 08 after all imports use `features/shop/model/initial-data`.
 */

export { getInitialProducts } from '@/features/shop/model/initial-data';
