// src/components/InstantImage.tsx
// مكون الصور المحسنة للتحميل الفوري
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface InstantImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
  loading?: 'lazy' | 'eager';
  style?: React.CSSProperties;
}

/**
 * InstantImage - مكون صور محسن للتحميل الفوري ⚡
 * 
 * الميزات:
 * 1. Lazy Loading ذكي
 * 2. Progressive Loading مع Blur placeholder
 * 3. Responsive images تلقائي
 * 4. WebP & AVIF support
 * 5. Intelligent preloading
 * 6. Fade-in animation سلس
 */
export default function InstantImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  className = '',
  objectFit = 'cover',
  objectPosition = 'center',
  sizes,
  onLoad,
  onError,
  loading = 'lazy',
  style,
}: InstantImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  // توليد blur placeholder تلقائي
  const defaultBlurDataURL = 
    blurDataURL ||
    `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width || 400}" height="${height || 300}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:rgb(229,231,235);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgb(209,213,219);stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)"/>
      </svg>`
    ).toString('base64')}`;

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Preload للصور المهمة
  useEffect(() => {
    if (priority && typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [src, priority]);

  // Sizes تلقائية محسنة
  const defaultSizes = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
        }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  const imageClasses = `
    transition-all duration-500 ease-in-out
    ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    ${className}
  `;

  const commonProps = {
    alt,
    quality,
    onLoad: handleLoad,
    onError: handleError,
    className: imageClasses,
    loading: priority ? 'eager' as const : loading,
    priority,
  };

  return (
    <div
      ref={imageRef}
      className={`relative overflow-hidden ${!fill ? '' : 'w-full h-full'}`}
      style={!fill ? { width, height } : {}}
    >
      {fill ? (
        <Image
          src={src}
          fill
          sizes={defaultSizes}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
          style={{ ...(style || {}), objectFit, objectPosition }}
          {...commonProps}
        />
      ) : (
        <Image
          src={src}
          width={width!}
          height={height!}
          sizes={defaultSizes}
          placeholder={placeholder}
          blurDataURL={placeholder === 'blur' ? defaultBlurDataURL : undefined}
          style={{ ...(style || {}), objectFit, objectPosition }}
          {...commonProps}
        />
      )}

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
      )}
    </div>
  );
}

/**
 * InstantImageGallery - معرض صور محسن
 */
interface InstantImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
  onImageClick?: (index: number) => void;
}

export function InstantImageGallery({
  images,
  columns = 3,
  gap = 4,
  className = '',
  onImageClick,
}: InstantImageGalleryProps) {
  return (
    <div
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {images.map((image, index) => (
        <div
          key={index}
          className="relative aspect-square cursor-pointer group"
          onClick={() => onImageClick?.(index)}
        >
          <InstantImage
            src={image.src}
            alt={image.alt}
            fill
            className="rounded-lg group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  );
}

/**
 * preloadImages - تحميل الصور مسبقًا
 */
export function preloadImages(srcs: string[]) {
  if (typeof window === 'undefined') return;

  srcs.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
}


