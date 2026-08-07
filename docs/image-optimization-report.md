# Image Optimization Report

## Scope

This report documents the current image-loading strategy for the ShopMate pages and widgets, the shared blur-to-sharp image component, its impact on server-first rendering and SEO, and the next recommended improvements.

## Current strategy

ShopMate uses `next/image` for product, category, logo, gallery, and related-product images. Images are assigned one of three loading behaviors:

- `priority`: reserved for important above-the-fold imagery.
- `loading="lazy"`: used for images lower in the page or outside the initial viewport.
- Default Next.js behavior: used where explicit lazy loading is not needed; Next.js normally lazy-loads non-priority images.

### Page-level loading behavior

| Page or section | Image role | Current behavior |
| --- | --- | --- |
| Home / Featured Products | Main featured image fallback | `priority` with `BlurImage` |
| Home / Featured Products | Desktop and mobile thumbnails | `priority` with `BlurImage` |
| Home / Featured Products | Promotional video | Starts with `preload="none"`, changes to `preload="auto"` after the page `load` event |
| Home / Category Showcase | Desktop category side image | `priority` with `BlurImage` |
| Home / Category Showcase | Mobile category icon | `priority` with `BlurImage` |
| Home / Category Showcase | Product tiles | Default Next.js loading |
| Home / Latest Products | Product cards | Explicit `loading="lazy"`; first three use `priority` |
| Home / Recently Viewed | Product images | Explicit `loading="lazy"` |
| Products page | Product-card images | First three use `priority`; remaining images use `loading="lazy"` |
| Category detail page | Product-card images | First three use `priority`; remaining images use `loading="lazy"` |
| Product detail | Main product image | `priority` with `BlurImage` |
| Product detail | Gallery variation images | Default Next.js lazy loading |
| Product detail | Related product images | Explicit `loading="lazy"`; first three use `priority` through the shared card grid |

## Shared `BlurImage` strategy

`shared/ui/blur-image.tsx` wraps `next/image` and provides:

1. A blurred initial state using `filter: blur(12px)` and a slight scale-up to hide blur edges.
2. A CSS transition from `blur(12px)` to `blur(0px)`.
3. Resolution of the blur only after the image's actual `onLoad` event fires.
4. Preservation of any `onLoad` callback supplied by the caller.
5. Next.js `placeholder="blur"` support with a lightweight generic fallback `blurDataURL`.

The component is currently used for:

- Product-detail main images.
- Featured-product main image fallbacks and thumbnails.
- Product highlight-card images.
- Category showcase main/side images.

The promotional featured video receives the same CSS blur-to-sharp treatment directly on the `<video>` element because `BlurImage` is specifically an image wrapper.

## Server-first rendering impact

The route pages remain server-first. Product and category data are fetched and composed in server-side views, and the initial image markup is available as part of the server-rendered page response.

`BlurImage` is a small client component because it owns React state and the image `onLoad` transition. This introduces a small hydration requirement for the wrapper, but it does not move product data fetching or page composition to the client. The image still uses Next.js image optimization and retains its `priority`, `sizes`, and responsive rendering behavior.

The main performance benefits are:

- Important images can be requested early through `priority`.
- Lower-page images avoid competing with initial page resources through lazy loading.
- Reserved containers and `fill` images reduce layout movement.
- The blur preview improves perceived loading while the full image downloads.

## SEO impact

The strategy is SEO-safe and supports image discovery:

- Product images have descriptive `alt` text in the main product and card surfaces.
- Product detail structured data includes the main product image and image variations.
- Server-first route output makes the main image markup available without waiting for client data fetching.
- `priority` does not directly improve rankings, but it improves the loading experience and can support performance metrics such as LCP when applied to the correct above-the-fold image.
- Lazy-loaded images remain discoverable because they are rendered as normal image elements; lazy loading only delays their network request.

The blur effect itself has no direct SEO value. It is a user-experience enhancement layered over the server-rendered image.

## Current tradeoffs and risks

### Duplicate responsive mounts

Some desktop/mobile widgets are both mounted and hidden with CSS. This currently affects:

- Featured Products desktop/mobile main media and thumbnails.
- Category Showcase desktop side image and mobile category icon.

Because both variants can have `priority`, the browser may receive duplicate preload requests. This should be reviewed before adding more priority images.

### Generic blur preview

The current `blurDataURL` is a generic lightweight preview rather than a product-specific low-quality image. It enables the Next.js blur placeholder flow, but it does not represent the actual product colors or composition.

### Priority budget

Priority is currently applied to the first three cards in shared product grids. This is appropriate when those cards are visible near the top of the page. If the grid begins below the fold, those images should remain lazy.

### Client hydration for animation

`BlurImage` adds a small client boundary for the transition state. This is an acceptable tradeoff for the current UX, but a static server-rendered image without animation would have less JavaScript overhead.

## Recommended next steps

1. Generate product-specific low-quality previews when images are uploaded or seeded in Supabase, then pass each value through `blurDataURL`.
2. Review duplicate desktop/mobile mounts and remove `priority` from the hidden responsive variants.
3. Confirm that only genuinely above-the-fold images use `priority`; keep the rest lazy.
4. Replace `width={0}` and `height={0}` patterns in product highlight cards with explicit dimensions or a stable aspect-ratio wrapper.
5. Verify remote image configuration, CDN caching, source dimensions, and compression for Supabase-hosted images.
6. Validate Core Web Vitals with production builds, especially LCP, CLS, and total image bytes on mobile connections.
7. Add automated or manual visual checks for slow-image loading, image failures, and responsive layouts.

## Summary

The current approach combines server-first page composition, Next.js image optimization, selective priority loading, lazy loading for secondary content, and a shared blur-to-sharp transition. It is SEO-compatible and preserves the server-first architecture. The highest-value follow-ups are product-specific blur previews, a stricter priority budget, and eliminating duplicate priority requests from responsive variants.
