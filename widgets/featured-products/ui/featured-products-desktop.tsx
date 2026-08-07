import { AssistantAwareLink } from '@/features/ai-assistant/navigation';
import type { Product } from '@/entities/product/model/product';
import type { AppLocale } from '@/shared/i18n/config';
import { getLocalizedText } from '@/shared/i18n/lib/get-localized-text';
import { FeaturedProductMedia } from '@/widgets/featured-products/ui/featured-product-media';
import { BlurImage } from '@/shared/ui/blur-image';

type Props = { actionLabel: string; locale: AppLocale; onSelect: (id: string) => void; products: Product[]; selectedProduct: Product };

export function FeaturedProductsDesktop({ actionLabel, locale, onSelect, products, selectedProduct }: Props) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
      <ProductImage product={selectedProduct} />
      <div className="flex flex-col">
        <ProductThumbs locale={locale} onSelect={onSelect} products={products} selectedId={selectedProduct.id} />
        <ProductDetails actionLabel={actionLabel} locale={locale} product={selectedProduct} />
      </div>
      <div className="flex justify-center gap-2 lg:col-span-2" aria-label="Featured product navigation">
        {products.map(function renderDot(product) {
          const isSelected = product.id === selectedProduct.id;
          return (
            <button
              aria-label={`Select ${getLocalizedText(product.name, locale)}`}
              className={`size-2 rounded-full ${isSelected ? 'bg-foreground' : 'bg-foreground/30'}`}
              key={product.id}
              onClick={function handleClick() { onSelect(product.id); }}
              type="button"
            >
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductImage({ product }: { product: Product }) {
  return <FeaturedProductMedia priority product={product} sizes="(max-width: 1024px) 50vw, 53vw" />;
}

function ProductThumbs({ locale, onSelect, products, selectedId }: { locale: AppLocale; onSelect: (id: string) => void; products: Product[]; selectedId: string }) {
  return <div className="flex gap-4 overflow-x-auto">{products.map(function renderThumb(product) { const productName = getLocalizedText(product.name, locale); return <div className="w-42 flex-none text-center" key={product.id}><button aria-label={`Select ${productName}`} className={`relative aspect-square w-full bg-foreground cursor-pointer hover:opacity-80 ${product.id === selectedId ? 'border border-foreground/20' : ''}`} onClick={function handleClick() { onSelect(product.id); }} type="button"><BlurImage alt={productName} className="object-cover" fill priority sizes="112px" src={product.imageUrl ?? '/images/products/placeholder.png'} /></button><span className="mt-2 block line-clamp-2 font-button text-xs font-light opacity-70 text-foreground">{productName}</span></div>; })}</div>;
}

function ProductDetails({ actionLabel, locale, product }: { actionLabel: string; locale: AppLocale; product: Product }) {
  return <div className="mt-8 space-y-4"><h3 className="text-2xl text-foreground">{getLocalizedText(product.name, locale)}</h3><p className="max-w-xl text-sm leading-6 text-muted-foreground">{getLocalizedText(product.description, locale)}</p><p className="text-xl text-foreground">${product.price.toFixed(2)}</p><AssistantAwareLink className="inline-flex bg-foreground px-5 py-3 font-button text-sm text-background" href={`/${locale}/products/${product.slug}`}>{actionLabel}</AssistantAwareLink></div>;
}
