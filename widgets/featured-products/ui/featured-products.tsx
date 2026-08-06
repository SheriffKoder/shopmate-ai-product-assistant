/**
 * Featured Products Widget
 *
 * Purpose: Provides interactive product selection for the home page.
 * Used in: views/home/ui/home-page.tsx
 * Used for: Presenting featured product imagery and localized purchase details.
 */

'use client';

import { useState } from 'react';
import type { Product } from '@/entities/product/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { FeaturedProductsDesktop } from '@/widgets/featured-products/ui/featured-products-desktop';
import { FeaturedProductsMobile } from '@/widgets/featured-products/ui/featured-products-mobile';

type FeaturedProductsProps = {
  actionLabel: string;
  emptyState: string;
  locale: AppLocale;
  products: Product[];
  title: string;
};

export function FeaturedProducts(props: FeaturedProductsProps) {
  const { actionLabel, emptyState, locale, products, title } = props;
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? '');
  const selectedProduct = products.find(function findSelectedProduct(product) {
    return product.id === selectedProductId;
  }) ?? products[0];

  if (!selectedProduct) {
    return <p className="text-sm text-muted-foreground">{emptyState}</p>;
  }

  function selectProduct(productId: string) {
    setSelectedProductId(productId);
  }

  return (
    <section
      aria-labelledby="featured-products-title"
      className="space-y-6"
    >
      <h2 id="featured-products-title" className="text-3xl text-foreground sm:text-4xl">
        {title}
      </h2>
      <div className="md:hidden">
        <FeaturedProductsMobile actionLabel={actionLabel} locale={locale} onSelect={selectProduct} products={products} selectedProduct={selectedProduct} />
      </div>
      <div className="hidden md:block">
        <FeaturedProductsDesktop actionLabel={actionLabel} locale={locale} onSelect={selectProduct} products={products} selectedProduct={selectedProduct} />
      </div>
    </section>
  );
}
