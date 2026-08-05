/**
 * Shadow Product Grid Widget
 *
 * Purpose: Renders localized server-first product grids.
 * Used in: shadow home, products, and category views.
 * Used for: Keeps product list markup reusable without client data fetching.
 */

import type { ShadowProduct } from '@/entities/product/model/product';
import type { ShadowLocale } from '@/shared/i18n/config';
import { ShadowProductCard } from '@/widgets/product-card/ui/product-card';

type ShadowProductGridProps = {
  emptyState: string;
  locale: ShadowLocale;
  products: ShadowProduct[];
  title: string;
};

/**
 * Renders a titled product grid.
 *
 * @param props - Products, active locale, and localized section text.
 * @returns A server-rendered product grid or empty state.
 */
export function ShadowProductGrid(props: ShadowProductGridProps) {
  const { emptyState, locale, products, title } = props;
  const sectionId = `shadow-product-grid-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section aria-labelledby={sectionId} className="space-y-4">
      <h2 id={sectionId} className="text-xl font-semibold text-gray-950">
        {title}
      </h2>
      {products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(function renderProduct(product) {
            return <ShadowProductCard key={product.id} locale={locale} product={product} />;
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-white p-6 text-sm text-muted-foreground">{emptyState}</div>
      )}
    </section>
  );
}
