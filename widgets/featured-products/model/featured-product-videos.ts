/**
 * @file widgets/featured-products/model/featured-product-videos.ts
 * Maps featured product slugs to their optional promotional video assets.
 */

/**
 * Resolve the promotional video path for a featured product.
 *
 * Add matching files to `public/videos` using the mapped paths when videos are
 * available; products without a ready asset continue to use their image.
 */
export const featuredProductVideos: Partial<Record<string, string>> = {
  'macbook-pro-16-m3': '/videos/macbook-pro-16-m3.mp4',
  'dell-xps-15-9530': '/videos/dell-xps-15-9530.mp4',
  'ipad-pro-12.9-m2': '/videos/ipad-pro-12.9-m2.mp4',
};
