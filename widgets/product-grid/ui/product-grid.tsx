/**
 * Product Grid Widget
 *
 * Purpose: Renders localized server-first product grids for catalog routes.
 * Used in: products, category, and product-detail views.
 */

import type { Product } from '@/entities/product/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { ProductCard } from '@/widgets/product-card/ui/product-card';

type ProductGridProps = { emptyState: string; locale: AppLocale; products: Product[]; title: string };

export function ProductGrid({ emptyState, locale, products, title }: ProductGridProps) {
  const sectionId = `product-grid-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <section aria-labelledby={sectionId} className="space-y-4">
      <h2 id={sectionId} className="text-xl font-semibold text-foreground">{title}</h2>
      {products.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map(function renderProduct(product) { return <ProductCard key={product.id} locale={locale} product={product} />; })}</div> : <div className="border border-dashed bg-background p-6 text-sm text-muted-foreground">{emptyState}</div>}
    </section>
  );
}
