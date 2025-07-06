'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

/**
 * 可自定义的加载指示器组件
 */
export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin text-primary/80', sizeClass[size])} />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * 全页加载指示器
 */
export function PageLoadingSpinner({ text = '页面加载中...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * 内联加载指示器
 */
export function InlineLoadingSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin inline mr-2" />;
} 