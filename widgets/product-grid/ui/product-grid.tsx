/**
 * Product Grid Widget
 *
 * Purpose: Renders localized server-first product grids.
 * Used in: home, products, and category views.
 * Used for: Keeps product list markup reusable without client data fetching.
 */

import type { Product } from '@/entities/product/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { ProductCard } from '@/widgets/product-card/ui/product-card';

type ProductGridProps = {
  emptyState: string;
  locale: AppLocale;
  products: Product[];
  title: string;
};

/**
 * Renders a titled product grid.
 *
 * @param props - Products, active locale, and localized section text.
 * @returns A server-rendered product grid or empty state.
 */
export function ProductGrid(props: ProductGridProps) {
  const { emptyState, locale, products, title } = props;
  const sectionId = `product-grid-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section aria-labelledby={sectionId} className="space-y-4">
      <h2 id={sectionId} className="text-xl font-semibold text-gray-950">
        {title}
      </h2>
      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(function renderProduct(product) {
            return <ProductCard key={product.id} locale={locale} product={product} />;
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-white p-6 text-sm text-muted-foreground">{emptyState}</div>
      )}
    </section>
  );
}
