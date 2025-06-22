'use client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React, { useState } from 'react';

interface IBlurImage {
    height?: any;
    width?: any;
    src?: string | any;
    objectFit?: any;
    className?: string | any;
    alt?: string | undefined;
    layout?: any;
    priority?: boolean;
    quality?: number;
    sizes?: string;
    [x: string]: any;
}

export const BlurImage = ({
    height,
    width,
    src,
    className,
    objectFit,
    alt,
    layout,
    priority = false,
    quality = 75, // Reduced from default 100 for better performance
    sizes,
    ...rest
}: IBlurImage) => {
    const [isLoading, setLoading] = useState(true);

    // Generate a simple blur placeholder
    const shimmer = (w: number, h: number) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#333" offset="20%" />
          <stop stop-color="#222" offset="50%" />
          <stop stop-color="#333" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#333" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" opacity="0.5">
        <animate attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
      </rect>
    </svg>`;

    const toBase64 = (str: string) =>
        typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

    return (
        <Image
            className={cn(
                'transition-all duration-500 ease-in-out',
                isLoading ? 'blur-sm scale-105' : 'blur-0 scale-100',
                className
            )}
            onLoad={() => setLoading(false)}
            src={src}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding='async'
            placeholder='blur'
            blurDataURL={`data:image/svg+xml;base64,${toBase64(
                shimmer(width || 700, height || 475)
            )}`}
            layout={layout}
            quality={quality}
            sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
            alt={alt ? alt : 'Image'}
            priority={priority}
            {...rest}
        />
    );
};
