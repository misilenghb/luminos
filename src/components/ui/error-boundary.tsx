'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件，用于捕获和显示React组件树中的错误
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              出现了一个错误
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2 font-medium">错误信息：</p>
              <p className="mb-4 font-mono text-xs bg-muted p-2 rounded overflow-auto max-h-[100px]">
                {this.state.error?.toString() || '未知错误'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <>
                  <p className="mb-2 font-medium">组件堆栈：</p>
                  <pre className="font-mono text-xs bg-muted p-2 rounded overflow-auto max-h-[200px]">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="w-full"
            >
              重新加载页面
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary }; 