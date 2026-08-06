/**
 * @file widgets/featured-products/ui/featured-product-media.tsx
 * Renders the active featured product video with manual playback and image fallback.
 */

'use client';

import Image from 'next/image';
import { Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/entities/product/model/product';
import { featuredProductVideos } from '@/widgets/featured-products/model/featured-product-videos';

type FeaturedProductMediaProps = {
  priority?: boolean;
  product: Product;
  sizes: string;
};

/**
 * Render the active product video without autoplay and provide a centered
 * playback control for the selected product.
 */
export function FeaturedProductMedia({ priority = false, product, sizes }: FeaturedProductMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const videoSrc = featuredProductVideos[product.slug];
  const imageSrc = product.imageUrl ?? '/images/products/placeholder.png';

  useEffect(function resetPlaybackForProduct() {
    setIsPlaying(false);
    setVideoAvailable(true);
    videoRef.current?.pause();
  }, [product.id]);

  async function togglePlayback() {
    if (!videoRef.current) {
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      return;
    }

    await videoRef.current.play();
    setIsPlaying(true);
  }

  return (
    <div className="relative aspect-square overflow-hidden bg-foreground md:aspect-[4/3]">
      {videoSrc && videoAvailable ? (
        <video
          ref={videoRef}
          aria-label={`${product.name.en} promotional video`}
          className="size-full object-cover"
          loop
          muted
          onError={function handleVideoError() { setVideoAvailable(false); }}
          playsInline
          poster={imageSrc}
          preload="metadata"
          src={videoSrc}
        />
      ) : (
        <Image alt={product.name.en} className="object-cover" fill priority={priority} sizes={sizes} src={imageSrc} unoptimized />
      )}
      {videoSrc && videoAvailable ? (
        <button
          aria-label={isPlaying ? 'Pause featured product video' : 'Play featured product video'}
          className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-foreground/80 text-background"
          onClick={togglePlayback}
          type="button"
        >
          {isPlaying ? <Pause aria-hidden="true" className="size-6 stroke-2" /> : <Play aria-hidden="true" className="ml-1 size-6 fill-current stroke-2" />}
        </button>
      ) : null}
    </div>
  );
}
