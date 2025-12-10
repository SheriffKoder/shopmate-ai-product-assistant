# Storage Abstraction Layer

## Purpose

This directory provides a unified interface for data persistence that makes it easy to swap between development (session storage) and production (database) backends.

## Architecture

```
lib/storage/
├── session-storage.ts    # Session storage implementation (development)
├── database.ts           # Database implementation (production) - TODO
└── README.md            # This file
```

## Current Implementation: Session Storage

**File**: `lib/storage/session-storage.ts`

- Uses browser `sessionStorage` for client-side persistence
- Data persists only for the browser session (cleared on tab close)
- Perfect for development and testing
- No database required

## Migration to Database

When ready to migrate to a real database:

1. **Create `lib/storage/database.ts`** with the same `StorageAdapter` interface
2. **Update `lib/storage/session-storage.ts`** to export `database` instead of `sessionStorage`
3. **No other code changes needed!** All API routes will automatically use the database

### Example Database Implementation

```typescript
// lib/storage/database.ts
import { db } from '@/lib/db';
import { products, carts } from '@/lib/db/schema';

class DatabaseAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    // Implement database queries
    if (key === STORAGE_KEYS.PRODUCTS) {
      const result = await db.select().from(products);
      return result as T;
    }
    // ... other keys
  }

  async set<T>(key: string, value: T): Promise<void> {
    // Implement database updates
    if (key === STORAGE_KEYS.PRODUCTS) {
      await db.insert(products).values(value as any);
    }
    // ... other keys
  }
  
  // ... other methods
}

export const storage: StorageAdapter = new DatabaseAdapter();
```

## Usage

### In API Routes

```typescript
import { storage, STORAGE_KEYS } from '@/lib/storage/session-storage';

// Get products
const products = storage.get<Product[]>(STORAGE_KEYS.PRODUCTS);

// Set products
storage.set(STORAGE_KEYS.PRODUCTS, newProducts);

// Check if exists
if (storage.has(STORAGE_KEYS.PRODUCTS)) {
  // ...
}
```

### Storage Keys

All storage keys are centralized in `STORAGE_KEYS` constant:

```typescript
export const STORAGE_KEYS = {
  PRODUCTS: 'shopmate:products',
  CART: 'shopmate:cart',
  USER: 'shopmate:user',
} as const;
```

## Benefits

1. **Easy Migration**: Swap storage backend with one import change
2. **Type Safety**: TypeScript ensures correct usage
3. **Consistent API**: Same interface for all storage operations
4. **Development Ready**: Works immediately without database setup
5. **Production Ready**: Easy to swap when database is added

## API Routes Using Storage

- `app/api/products/route.ts` - Products CRUD
- `app/api/cart/route.ts` - Cart operations

## Future Enhancements

- [ ] Add database adapter implementation
- [ ] Add caching layer
- [ ] Add data validation
- [ ] Add migration utilities

