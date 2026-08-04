/**
 * @file features/shop-assistant/server/shop-api-sources.ts
 * Shop API source adapters.
 *
 * Purpose: Adapts the generic ShopApiClient to the focused source contracts consumed by agents.
 * Used in: shop-assistant runtime composition.
 */

import type { Product } from '@/features/catalog/model/product';
import type { CartState } from '@/features/cart/model/cart';
import type { CatalogSource } from '../model/catalog-source';
import type { CartSource } from '../model/cart-source';
import type { ShopApiClient } from '../model/shop-api-client';

/** Creates the catalog source used by agents from the typed Shop API client. */
export function createCatalogSourceFromShopApi(shopApi: ShopApiClient): CatalogSource {
  return {
    async searchProducts(input) {
      const products = await shopApi.searchProducts({ ...input });
      return products as unknown as Product[];
    },
    async getProductContext(input) {
      const products = await shopApi.searchProducts({ query: input.query, limit: input.limit });
      return products as unknown as Product[];
    },
    async getProductById(id) {
      const product = await shopApi.getProduct(id);
      return product as unknown as Product | null;
    },
  };
}

/** Creates the cart source used by agents from the typed Shop API client. */
export function createCartSourceFromShopApi(shopApi: ShopApiClient): CartSource {
  return {
    async getCart() {
      return (await shopApi.getCart()) as unknown as CartState;
    },
    async getItemByProductId(productId) {
      const cart = (await shopApi.getCart()) as unknown as CartState;
      return cart.items.find((item) => item.productId === productId) ?? null;
    },
  };
}
