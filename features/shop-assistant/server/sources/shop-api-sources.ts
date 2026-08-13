/**
 * @file features/shop-assistant/server/sources/shop-api-sources.ts
 * Shop API source adapters.
 * Used in: shop-assistant runtime composition (catalog lookup + cart render).
 * Used for: Adapting ShopApiClient to CatalogSource / CartSource without agent code.
 *
 * Function Index:
 * createCatalogSourceFromShopApi: Catalog reads via the typed Shop API.
 * createCartSourceFromShopApi: Cart snapshot reads via the typed Shop API.
 */

import type { Product } from '@/features/catalog/model/product';
import type { CartState } from '@/features/cart/model/cart';
import type { CatalogSource } from '../../model/sources/catalog-source';
import type { CartSource } from '../../model/sources/cart-source';
import type { ShopApiClient } from '../../model/sources/shop-api-client';

/** Creates the catalog source used by lookup/render from the typed Shop API client. */
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

/** Creates the cart source used by server/render/cart from the typed Shop API client. */
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
