import Image from 'next/image';
import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import type { Product } from '@/entities/product/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import { FeaturedProductMedia } from '@/widgets/featured-products/ui/featured-product-media';

type Props = { actionLabel: string; locale: AppLocale; onSelect: (id: string) => void; products: Product[]; selectedProduct: Product };

export function FeaturedProductsMobile(props: Props) {
  const { actionLabel, locale, onSelect, products, selectedProduct } = props;
  const name = getLocalizedText(selectedProduct.name, locale);

  return (
    <div className="space-y-6">
      <div className="flex gap-3 overflow-x-auto pb-1">
        {products.map(function renderThumb(product) {
          return (
            <button
              aria-label={`Select ${getLocalizedText(product.name, locale)}`}
              className={`relative aspect-square w-20 flex-none bg-secondary ${product.id === selectedProduct.id ? 'ring-2 ring-foreground' : ''}`}
              key={product.id}
              onClick={function handleClick() { onSelect(product.id); }}
              type="button"
            >
              {product.imageUrl ? <Image alt={getLocalizedText(product.name, locale)} className="object-cover" fill loading="lazy" sizes="80px" src={product.imageUrl} /> : null}
            </button>
          );
        })}
      </div>
      <FeaturedProductMedia priority product={selectedProduct} sizes="100vw" />
      <div className="space-y-4">
        <h3 className="text-2xl text-foreground">{name}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{getLocalizedText(selectedProduct.description, locale)}</p>
        <p className="text-xl text-foreground">${selectedProduct.price.toFixed(2)}</p>
        <AssistantAwareLink className="inline-flex bg-foreground px-5 py-3 font-button text-sm text-background" href={`/${locale}/products/${selectedProduct.slug}`}>{actionLabel}</AssistantAwareLink>
      </div>
    </div>
  );
}
