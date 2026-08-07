/**
 * Reusable blur-to-sharp image.
 *
 * Purpose: Keeps image space reserved while animating the loaded image from blurred to sharp.
 * Used in: Product and category image surfaces.
 */

'use client';

import Image, { type ImageProps } from 'next/image';
import { useState, type SyntheticEvent } from 'react';

type BlurImageProps = ImageProps;

const DEFAULT_BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiIHZpZXdCb3g9IjAgMCAxIDEiPjxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNkMWQ1ZGIiLz48L2xpbmVhckdyYWRpZW50PjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InVybCgjZykiLz48L3N2Zz4=';

export function BlurImage({ blurDataURL, className, onLoad, placeholder, ...props }: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  function handleLoad(event: SyntheticEvent<HTMLImageElement>) {
    setIsLoaded(true);
    onLoad?.(event);
  }

  return (
    <Image
      {...props}
      blurDataURL={blurDataURL ?? DEFAULT_BLUR_DATA_URL}
      className={className}
      onLoad={handleLoad}
      placeholder={placeholder ?? 'blur'}
      style={{
        ...props.style,
        filter: `blur(${isLoaded ? 0 : 12}px)`,
        transform: isLoaded ? 'scale(1)' : 'scale(1.02)',
        transition: 'filter 500ms ease-out, transform 500ms ease-out',
      }}
    />
  );
}
