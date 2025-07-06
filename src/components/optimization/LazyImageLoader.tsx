"use client";

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LazyImageLoaderProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImageLoader({
  src,
  alt,
  width = 400,
  height = 400,
  className,
  placeholder = 'blur',
  quality = 85,
  priority = false,
  onLoad,
  onError,
}: LazyImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // 生成模糊占位符
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, w, h);
    }
    return canvas.toDataURL();
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded-lg",
          className
        )}
        style={{ width, height }}
      >
        <div className="text-gray-400 text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">图片加载失败</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        placeholder={placeholder === 'blur' || placeholder === 'empty' ? placeholder : undefined}
        blurDataURL={generateBlurDataURL(width, height)}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

// 预加载图片的Hook
export function useImagePreloader(imageUrls: string[]) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const preloadImages = async () => {
      const promises = imageUrls.map((url) => {
        return new Promise<string>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve(url);
          img.onerror = reject;
          img.src = url;
        });
      });

      try {
        const loaded = await Promise.allSettled(promises);
        const successful = loaded
          .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
          .map(result => result.value);
        
        setPreloadedImages(new Set(successful));
      } catch (error) {
        console.warn('图片预加载失败:', error);
      }
    };

    if (imageUrls.length > 0) {
      preloadImages();
    }
  }, [imageUrls]);

  return { preloadedImages };
}

// 虚拟滚动组件
export function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });

  useEffect(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    setVisibleRange({ start: startIndex, end: endIndex });
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  const totalHeight = items.length * itemHeight;
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      className={cn("overflow-auto", className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) =>
            renderItem(item, visibleRange.start + index)
          )}
        </div>
      </div>
    </div>
  );
} 