/**
 * 增强系统监控工具
 * 提供全面的性能监控、错误跟踪和用户行为分析
 */

'use client';

// 性能指标接口
interface PerformanceMetrics {
  timestamp: number;
  url: string;
  userId?: string;
  sessionId: string;
  
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // 自定义指标
  loadTime: number;
  renderTime: number;
  apiResponseTime: number;
  memoryUsage: number;
  
  // 网络信息
  connectionType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  
  // 设备信息
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
}

// 错误信息接口
interface ErrorInfo {
  timestamp: number;
  url: string;
  userId?: string;
  sessionId: string;
  
  // 错误详情
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  
  // 错误类型
  type: 'javascript' | 'network' | 'resource' | 'api' | 'user';
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // 上下文信息
  userAgent: string;
  component?: string;
  action?: string;
  
  // 重现信息
  breadcrumbs: Array<{
    timestamp: number;
    category: string;
    message: string;
    data?: any;
  }>;
}

// 用户行为事件
interface UserEvent {
  timestamp: number;
  url: string;
  userId?: string;
  sessionId: string;
  
  // 事件信息
  type: 'click' | 'scroll' | 'navigation' | 'form_submit' | 'ai_request' | 'custom';
  element?: string;
  action: string;
  
  // 性能相关
  duration?: number;
  success?: boolean;
  
  // 自定义数据
  metadata?: Record<string, any>;
}

// 系统状态监控
interface SystemStatus {
  timestamp: number;
  
  // 内存使用
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  
  // 网络状态
  networkStatus: {
    online: boolean;
    connectionType?: string;
    effectiveType?: string;
  };
  
  // 缓存状态
  cacheStatus: {
    size: number;
    hitRate: number;
    totalHits: number;
    totalCost: number;
  };
  
  // 错误率
  errorRate: {
    total: number;
    rate: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

// 增强监控类
export class EnhancedMonitoring {
  private sessionId: string;
  private userId?: string;
  private metrics: PerformanceMetrics[] = [];
  private errors: ErrorInfo[] = [];
  private events: UserEvent[] = [];
  private breadcrumbs: Array<{ timestamp: number; category: string; message: string; data?: any }> = [];
  private performanceObserver?: PerformanceObserver;
  private maxStoredItems = 1000;
  private isEnabled = true;
  private reportingEndpoint = '/api/monitoring';

  constructor(options: {
    userId?: string;
    maxStoredItems?: number;
    reportingEndpoint?: string;
    enableAutoReporting?: boolean;
  } = {}) {
    this.sessionId = this.generateSessionId();
    this.userId = options.userId;
    this.maxStoredItems = options.maxStoredItems || 1000;
    this.reportingEndpoint = options.reportingEndpoint || '/api/monitoring';
    
    if (typeof window !== 'undefined') {
      this.initializeMonitoring();
      
      if (options.enableAutoReporting) {
        this.startAutoReporting();
      }
    }
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private initializeMonitoring() {
    // 监听页面性能
    this.setupPerformanceObserver();
    
    // 监听错误
    this.setupErrorHandling();
    
    // 监听用户交互
    this.setupUserEventTracking();
    
    // 监听页面可见性变化
    this.setupVisibilityTracking();
    
    // 监听网络状态变化
    this.setupNetworkTracking();
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        for (const entry of entries) {
          if (entry.entryType === 'navigation') {
            this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
          } else if (entry.entryType === 'paint') {
            this.recordPaintMetrics(entry as PerformancePaintTiming);
          } else if (entry.entryType === 'largest-contentful-paint') {
            this.recordLCPMetrics(entry as any);
          } else if (entry.entryType === 'layout-shift') {
            this.recordCLSMetrics(entry as any);
          }
        }
      });

      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift'] });
      } catch (error) {
        console.warn('Performance Observer setup failed:', error);
      }
    }
  }

  private setupErrorHandling() {
    // JavaScript错误
    window.addEventListener('error', (event) => {
      this.recordError({
        type: 'javascript',
        severity: 'high',
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Promise拒绝
    window.addEventListener('unhandledrejection', (event) => {
      this.recordError({
        type: 'javascript',
        severity: 'high',
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      });
    });

    // 资源加载错误
    window.addEventListener('error', (event) => {
      if (event.target && event.target !== window) {
        this.recordError({
          type: 'resource',
          severity: 'medium',
          message: `Resource failed to load: ${(event.target as any).src || (event.target as any).href}`,
        });
      }
    }, true);
  }

  private setupUserEventTracking() {
    // 点击事件
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.recordUserEvent({
        type: 'click',
        element: this.getElementSelector(target),
        action: 'click',
        metadata: {
          x: event.clientX,
          y: event.clientY,
          button: event.button,
        },
      });
    });

    // 滚动事件（节流）
    let scrollTimer: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        this.recordUserEvent({
          type: 'scroll',
          action: 'scroll',
          metadata: {
            scrollY: window.scrollY,
            scrollX: window.scrollX,
          },
        });
      }, 100);
    });

    // 表单提交
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.recordUserEvent({
        type: 'form_submit',
        element: this.getElementSelector(form),
        action: 'submit',
        metadata: {
          action: form.action,
          method: form.method,
        },
      });
    });
  }

  private setupVisibilityTracking() {
    let pageLoadStart = Date.now();
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        const duration = Date.now() - pageLoadStart;
        this.recordUserEvent({
          type: 'navigation',
          action: 'page_hidden',
          duration,
        });
      } else {
        pageLoadStart = Date.now();
        this.recordUserEvent({
          type: 'navigation',
          action: 'page_visible',
        });
      }
    });
  }

  private setupNetworkTracking() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      const trackNetworkChange = () => {
        this.recordUserEvent({
          type: 'custom',
          action: 'network_change',
          metadata: {
            effectiveType: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
          },
        });
      };

      connection.addEventListener('change', trackNetworkChange);
    }
  }

  private recordNavigationMetrics(entry: PerformanceNavigationTiming) {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      loadTime: entry.loadEventEnd - entry.fetchStart,
      renderTime: entry.domContentLoadedEventEnd - entry.fetchStart,
      apiResponseTime: entry.responseEnd - entry.requestStart,
      memoryUsage: this.getMemoryUsage(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
    };

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      metrics.connectionType = connection.type;
      metrics.effectiveType = connection.effectiveType;
      metrics.downlink = connection.downlink;
      metrics.rtt = connection.rtt;
    }

    this.metrics.push(metrics);
    this.trimArray(this.metrics);
  }

  private recordPaintMetrics(entry: PerformancePaintTiming) {
    const lastMetric = this.metrics[this.metrics.length - 1];
    if (lastMetric) {
      if (entry.name === 'first-contentful-paint') {
        lastMetric.fcp = entry.startTime;
      }
    }
  }

  private recordLCPMetrics(entry: any) {
    const lastMetric = this.metrics[this.metrics.length - 1];
    if (lastMetric) {
      lastMetric.lcp = entry.startTime;
    }
  }

  private recordCLSMetrics(entry: any) {
    const lastMetric = this.metrics[this.metrics.length - 1];
    if (lastMetric) {
      lastMetric.cls = (lastMetric.cls || 0) + entry.value;
    }
  }

  private recordError(errorDetails: Partial<ErrorInfo>) {
    const error: ErrorInfo = {
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      type: errorDetails.type || 'javascript',
      severity: errorDetails.severity || 'medium',
      message: errorDetails.message || 'Unknown error',
      stack: errorDetails.stack,
      filename: errorDetails.filename,
      lineno: errorDetails.lineno,
      colno: errorDetails.colno,
      userAgent: navigator.userAgent,
      component: errorDetails.component,
      action: errorDetails.action,
      breadcrumbs: [...this.breadcrumbs],
    };

    this.errors.push(error);
    this.trimArray(this.errors);
    
    // 添加到breadcrumbs
    this.addBreadcrumb('error', error.message, { type: error.type, severity: error.severity });
  }

  private recordUserEvent(eventDetails: Partial<UserEvent>) {
    const event: UserEvent = {
      timestamp: Date.now(),
      url: window.location.href,
      userId: this.userId,
      sessionId: this.sessionId,
      type: eventDetails.type || 'custom',
      element: eventDetails.element,
      action: eventDetails.action || 'unknown',
      duration: eventDetails.duration,
      success: eventDetails.success,
      metadata: eventDetails.metadata,
    };

    this.events.push(event);
    this.trimArray(this.events);
    
    // 添加到breadcrumbs
    this.addBreadcrumb('user_action', event.action, { type: event.type, element: event.element });
  }

  private addBreadcrumb(category: string, message: string, data?: any) {
    this.breadcrumbs.push({
      timestamp: Date.now(),
      category,
      message,
      data,
    });
    
    this.trimArray(this.breadcrumbs, 50); // 只保留最近50个breadcrumbs
  }

  private trimArray(array: any[], maxLength: number = this.maxStoredItems) {
    if (array.length > maxLength) {
      array.splice(0, array.length - maxLength);
    }
  }

  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  // 公共方法
  public trackEvent(type: string, action: string, metadata?: Record<string, any>) {
    this.recordUserEvent({
      type: 'custom',
      action: `${type}_${action}`,
      metadata,
    });
  }

  public trackAIRequest(requestType: string, duration: number, success: boolean, metadata?: Record<string, any>) {
    this.recordUserEvent({
      type: 'ai_request',
      action: requestType,
      duration,
      success,
      metadata,
    });
  }

  public trackError(message: string, component?: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    this.recordError({
      type: 'user',
      severity,
      message,
      component,
    });
  }

  public getSystemStatus(): SystemStatus {
    const now = Date.now();
    const recentErrors = this.errors.filter(e => now - e.timestamp < 60000); // 最近1分钟的错误
    
    return {
      timestamp: now,
      memoryUsage: {
        used: this.getMemoryUsage(),
        total: 'memory' in performance ? (performance as any).memory.totalJSHeapSize / 1024 / 1024 : 0,
        percentage: 'memory' in performance ? ((performance as any).memory.usedJSHeapSize / (performance as any).memory.totalJSHeapSize) * 100 : 0,
      },
      networkStatus: {
        online: navigator.onLine,
        connectionType: 'connection' in navigator ? (navigator as any).connection.type : undefined,
        effectiveType: 'connection' in navigator ? (navigator as any).connection.effectiveType : undefined,
      },
      cacheStatus: {
        size: 0, // 需要从缓存管理器获取
        hitRate: 0,
        totalHits: 0,
        totalCost: 0,
      },
      errorRate: {
        total: recentErrors.length,
        rate: recentErrors.length / 60, // 每秒错误数
        trend: 'stable', // 简化实现
      },
    };
  }

  public generateReport() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      metrics: this.metrics,
      errors: this.errors,
      events: this.events,
      systemStatus: this.getSystemStatus(),
    };
  }

  public async sendReport() {
    if (!this.isEnabled) return;

    try {
      const report = this.generateReport();
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });
    } catch (error) {
      console.error('Failed to send monitoring report:', error);
    }
  }

  private startAutoReporting() {
    // 每5分钟自动发送报告
    setInterval(() => {
      this.sendReport();
    }, 5 * 60 * 1000);

    // 页面卸载时发送报告
    window.addEventListener('beforeunload', () => {
      this.sendReport();
    });
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  public enable() {
    this.isEnabled = true;
  }

  public disable() {
    this.isEnabled = false;
  }

  public clear() {
    this.metrics = [];
    this.errors = [];
    this.events = [];
    this.breadcrumbs = [];
  }
}

// 全局监控实例
export const globalMonitoring = new EnhancedMonitoring({
  enableAutoReporting: true,
  maxStoredItems: 1000,
});

// 装饰器：为函数添加监控
export function withMonitoring<T extends (...args: any[]) => any>(
  fn: T,
  componentName: string,
  actionName: string
): T {
  return ((...args: Parameters<T>) => {
    const startTime = Date.now();
    
    try {
      const result = fn(...args);
      
      // 如果是Promise，监控异步结果
      if (result && typeof result.then === 'function') {
        return result
          .then((value: any) => {
            const duration = Date.now() - startTime;
            globalMonitoring.trackEvent(componentName, actionName, {
              duration,
              success: true,
              args: args.length > 0 ? args[0] : undefined,
            });
            return value;
          })
          .catch((error: any) => {
            const duration = Date.now() - startTime;
            globalMonitoring.trackError(
              `${componentName}.${actionName}: ${error.message}`,
              componentName,
              'high'
            );
            globalMonitoring.trackEvent(componentName, actionName, {
              duration,
              success: false,
              error: error.message,
            });
            throw error;
          });
      }
      
      // 同步函数
      const duration = Date.now() - startTime;
      globalMonitoring.trackEvent(componentName, actionName, {
        duration,
        success: true,
        args: args.length > 0 ? args[0] : undefined,
      });
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      globalMonitoring.trackError(
        `${componentName}.${actionName}: ${(error as Error).message}`,
        componentName,
        'high'
      );
      globalMonitoring.trackEvent(componentName, actionName, {
        duration,
        success: false,
        error: (error as Error).message,
      });
      throw error;
    }
  }) as T;
}

// 快捷方法
export const trackEvent = (type: string, action: string, metadata?: Record<string, any>) => {
  globalMonitoring.trackEvent(type, action, metadata);
};

export const trackError = (message: string, component?: string, severity?: 'low' | 'medium' | 'high' | 'critical') => {
  globalMonitoring.trackError(message, component, severity);
};

export const trackAIRequest = (requestType: string, duration: number, success: boolean, metadata?: Record<string, any>) => {
  globalMonitoring.trackAIRequest(requestType, duration, success, metadata);
}; 