'use client';

import React, { Suspense, lazy, useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from './AnimationEnhancer';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// 懒加载组件包装器
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback,
  className 
}) => {
  const defaultFallback = (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="md" />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// 图片懒加载组件
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;
  }, [src, onLoad, onError]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-70'
      } ${className}`}
      style={{
        filter: isLoaded ? 'none' : 'blur(2px)',
      }}
    />
  );
};

// 虚拟滚动组件
interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className
}: VirtualScrollProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 防抖Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 节流Hook
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const [lastRan, setLastRan] = useState(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value);
        setLastRan(Date.now());
      }
    }, limit - (Date.now() - lastRan));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit, lastRan]);

  return throttledValue;
}

// 交集观察器Hook
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

// 内存使用监控Hook
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// 性能监控组件
interface PerformanceMonitorProps {
  showInProduction?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showInProduction = false
}) => {
  const [renderTime, setRenderTime] = useState(0);
  const [fps, setFps] = useState(0);
  const memoryInfo = useMemoryMonitor();

  useEffect(() => {
    const startTime = performance.now();
    
    const measureRenderTime = () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };

    measureRenderTime();
  }, []);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    const animationId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationId);
  }, []);

  // 只在开发环境或明确允许时显示
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs font-mono">
      <div>渲染时间: {renderTime.toFixed(2)}ms</div>
      <div>FPS: {fps}</div>
      {memoryInfo && (
        <>
          <div>内存: {(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
          <div>总计: {(memoryInfo.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB</div>
        </>
      )}
    </div>
  );
};

// 代码分割的路由组件
export const createLazyRoute = (importFunc: () => Promise<{ default: React.ComponentType<any> }>) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: any) => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex justify-center pt-4">
                  <LoadingSpinner size="md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
};

// 预加载Hook
export function usePreload(urls: string[]) {
  useEffect(() => {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [urls]);
}

// 错误边界组件
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="w-full max-w-md mx-auto mt-8">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">出现了一些问题</h2>
            <p className="text-muted-foreground mb-4">
              页面加载时遇到错误，请刷新页面重试。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              刷新页面
            </button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
