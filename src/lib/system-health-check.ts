// 系统健康检查工具

export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: number;
}

export interface SystemHealthReport {
  overall: 'healthy' | 'warning' | 'error';
  checks: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    warnings: number;
    errors: number;
  };
  timestamp: number;
}

class SystemHealthChecker {
  private checks: Array<() => Promise<HealthCheckResult>> = [];

  constructor() {
    this.registerDefaultChecks();
  }

  private registerDefaultChecks() {
    // 环境变量检查
    this.addCheck(async () => {
      const requiredEnvVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY'
      ];

      const missing = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missing.length > 0) {
        return {
          component: 'Environment Variables',
          status: 'error',
          message: `Missing required environment variables: ${missing.join(', ')}`,
          details: { missing },
          timestamp: Date.now()
        };
      }

      return {
        component: 'Environment Variables',
        status: 'healthy',
        message: 'All required environment variables are present',
        timestamp: Date.now()
      };
    });

    // 浏览器API检查
    this.addCheck(async () => {
      if (typeof window === 'undefined') {
        return {
          component: 'Browser APIs',
          status: 'healthy',
          message: 'Running in server environment',
          timestamp: Date.now()
        };
      }

      const issues: string[] = [];
      
      if (!window.localStorage) {
        issues.push('localStorage not available');
      }
      
      if (!window.sessionStorage) {
        issues.push('sessionStorage not available');
      }

      if (issues.length > 0) {
        return {
          component: 'Browser APIs',
          status: 'warning',
          message: `Some browser APIs are not available: ${issues.join(', ')}`,
          details: { issues },
          timestamp: Date.now()
        };
      }

      return {
        component: 'Browser APIs',
        status: 'healthy',
        message: 'All required browser APIs are available',
        timestamp: Date.now()
      };
    });

    // 内存使用检查
    this.addCheck(async () => {
      if (typeof window === 'undefined' || !('performance' in window) || !('memory' in (window.performance as any))) {
        return {
          component: 'Memory Usage',
          status: 'healthy',
          message: 'Memory monitoring not available in this environment',
          timestamp: Date.now()
        };
      }

      const memory = (window.performance as any).memory;
      const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      const usagePercent = (usedMB / limitMB) * 100;

      if (usagePercent > 90) {
        return {
          component: 'Memory Usage',
          status: 'error',
          message: `High memory usage: ${usedMB}MB (${usagePercent.toFixed(1)}%)`,
          details: { usedMB, limitMB, usagePercent },
          timestamp: Date.now()
        };
      }

      if (usagePercent > 70) {
        return {
          component: 'Memory Usage',
          status: 'warning',
          message: `Moderate memory usage: ${usedMB}MB (${usagePercent.toFixed(1)}%)`,
          details: { usedMB, limitMB, usagePercent },
          timestamp: Date.now()
        };
      }

      return {
        component: 'Memory Usage',
        status: 'healthy',
        message: `Normal memory usage: ${usedMB}MB (${usagePercent.toFixed(1)}%)`,
        details: { usedMB, limitMB, usagePercent },
        timestamp: Date.now()
      };
    });
  }

  addCheck(check: () => Promise<HealthCheckResult>) {
    this.checks.push(check);
  }

  async runHealthCheck(): Promise<SystemHealthReport> {
    const results: HealthCheckResult[] = [];
    
    for (const check of this.checks) {
      try {
        const result = await check();
        results.push(result);
      } catch (error) {
        results.push({
          component: 'Unknown',
          status: 'error',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: { error },
          timestamp: Date.now()
        });
      }
    }

    const summary = {
      total: results.length,
      healthy: results.filter(r => r.status === 'healthy').length,
      warnings: results.filter(r => r.status === 'warning').length,
      errors: results.filter(r => r.status === 'error').length
    };

    const overall = summary.errors > 0 ? 'error' : 
                   summary.warnings > 0 ? 'warning' : 'healthy';

    return {
      overall,
      checks: results,
      summary,
      timestamp: Date.now()
    };
  }
}

// 全局健康检查器实例
export const systemHealthChecker = new SystemHealthChecker();

// 便捷函数
export const runSystemHealthCheck = () => systemHealthChecker.runHealthCheck();

// 自动健康检查（在开发环境中）
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // 延迟执行，避免阻塞初始化
  setTimeout(async () => {
    try {
      const report = await runSystemHealthCheck();
      if (report.overall !== 'healthy') {
        console.warn('🏥 System Health Check:', report);
      } else {
        console.log('✅ System Health Check: All systems healthy');
      }
    } catch (error) {
      console.error('❌ System Health Check failed:', error);
    }
  }, 2000);
}
