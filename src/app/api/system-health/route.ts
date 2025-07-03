import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: string;
}

export async function GET() {
  const results: HealthCheckResult[] = [];
  const timestamp = new Date().toISOString();

  // 1. 环境变量检查
  try {
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NODE_ENV: process.env.NODE_ENV,
    };

    if (envCheck.NEXT_PUBLIC_SUPABASE_URL && envCheck.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      results.push({
        component: '环境变量',
        status: 'healthy',
        message: '所有必需的环境变量都已配置',
        details: envCheck,
        timestamp
      });
    } else {
      results.push({
        component: '环境变量',
        status: 'error',
        message: '缺少必需的环境变量',
        details: envCheck,
        timestamp
      });
    }
  } catch (error) {
    results.push({
      component: '环境变量',
      status: 'error',
      message: '环境变量检查失败',
      details: error,
      timestamp
    });
  }

  // 2. Supabase连接检查
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 认证服务检查
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        results.push({
          component: 'Supabase认证',
          status: 'error',
          message: '认证服务连接失败',
          details: authError,
          timestamp
        });
      } else {
        results.push({
          component: 'Supabase认证',
          status: 'healthy',
          message: '认证服务正常',
          timestamp
        });
      }
    } catch (error) {
      results.push({
        component: 'Supabase认证',
        status: 'error',
        message: '认证服务异常',
        details: error,
        timestamp
      });
    }

    // 数据库表检查
    const tablesToCheck = ['profiles', 'images', 'user_energy_records', 'meditation_sessions'];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          if (error.code === '42P01') {
            results.push({
              component: `数据库表-${table}`,
              status: 'error',
              message: `表 ${table} 不存在`,
              details: error,
              timestamp
            });
          } else if (error.code === '42501') {
            results.push({
              component: `数据库表-${table}`,
              status: 'warning',
              message: `表 ${table} 存在但权限受限`,
              details: error,
              timestamp
            });
          } else {
            results.push({
              component: `数据库表-${table}`,
              status: 'error',
              message: `表 ${table} 访问失败`,
              details: error,
              timestamp
            });
          }
        } else {
          results.push({
            component: `数据库表-${table}`,
            status: 'healthy',
            message: `表 ${table} 正常访问`,
            timestamp
          });
        }
      } catch (error) {
        results.push({
          component: `数据库表-${table}`,
          status: 'error',
          message: `表 ${table} 检查异常`,
          details: error,
          timestamp
        });
      }
    }

  } catch (error) {
    results.push({
      component: 'Supabase连接',
      status: 'error',
      message: 'Supabase客户端创建失败',
      details: error,
      timestamp
    });
  }

  // 3. 外部API服务检查
  try {
    const pollinationsResponse = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '测试连接' }],
        model: 'openai',
        temperature: 0.1
      })
    });

    if (pollinationsResponse.ok) {
      results.push({
        component: 'Pollinations API',
        status: 'healthy',
        message: 'AI服务连接正常',
        timestamp
      });
    } else {
      results.push({
        component: 'Pollinations API',
        status: 'warning',
        message: `AI服务响应异常: ${pollinationsResponse.status}`,
        details: { status: pollinationsResponse.status },
        timestamp
      });
    }
  } catch (error) {
    results.push({
      component: 'Pollinations API',
      status: 'error',
      message: 'AI服务连接失败',
      details: error,
      timestamp
    });
  }

  // 4. 图像生成服务检查
  try {
    const imageTestUrl = 'https://image.pollinations.ai/prompt/test?width=100&height=100';
    const imageResponse = await fetch(imageTestUrl, { method: 'HEAD' });
    
    if (imageResponse.ok) {
      results.push({
        component: '图像生成服务',
        status: 'healthy',
        message: '图像生成服务正常',
        timestamp
      });
    } else {
      results.push({
        component: '图像生成服务',
        status: 'warning',
        message: `图像生成服务响应异常: ${imageResponse.status}`,
        timestamp
      });
    }
  } catch (error) {
    results.push({
      component: '图像生成服务',
      status: 'error',
      message: '图像生成服务连接失败',
      details: error,
      timestamp
    });
  }

  // 5. 系统资源检查
  try {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    results.push({
      component: '系统资源',
      status: memoryUsage.heapUsed < 200 * 1024 * 1024 ? 'healthy' : 'warning', // 200MB threshold
      message: `内存使用: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB, 运行时间: ${Math.round(uptime)}秒`,
      details: {
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          external: Math.round(memoryUsage.external / 1024 / 1024)
        },
        uptime: Math.round(uptime),
        nodeVersion: process.version
      },
      timestamp
    });
  } catch (error) {
    results.push({
      component: '系统资源',
      status: 'error',
      message: '系统资源检查失败',
      details: error,
      timestamp
    });
  }

  // 计算总体健康状态
  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const healthyCount = results.filter(r => r.status === 'healthy').length;

  let overallStatus: 'healthy' | 'warning' | 'error';
  if (errorCount > 0) {
    overallStatus = 'error';
  } else if (warningCount > 0) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'healthy';
  }

  const summary = {
    overall: overallStatus,
    total: results.length,
    healthy: healthyCount,
    warning: warningCount,
    error: errorCount,
    timestamp,
    recommendations: generateRecommendations(results)
  };

  return NextResponse.json({
    summary,
    results
  });
}

function generateRecommendations(results: HealthCheckResult[]): string[] {
  const recommendations: string[] = [];
  
  // 检查环境变量问题
  if (results.some(r => r.component === '环境变量' && r.status === 'error')) {
    recommendations.push('检查 .env.local 文件中的 Supabase 配置');
  }

  // 检查数据库表问题
  const tableErrors = results.filter(r => r.component.startsWith('数据库表') && r.status === 'error');
  if (tableErrors.length > 0) {
    recommendations.push('需要创建缺失的数据库表或修复权限配置');
  }

  // 检查权限问题
  const permissionWarnings = results.filter(r => r.component.startsWith('数据库表') && r.status === 'warning');
  if (permissionWarnings.length > 0) {
    recommendations.push('检查数据库表的 RLS（行级安全）策略配置');
  }

  // 检查API服务问题
  if (results.some(r => r.component === 'Pollinations API' && r.status !== 'healthy')) {
    recommendations.push('AI 服务可能暂时不可用，某些功能可能受影响');
  }

  // 检查内存问题
  const memoryCheck = results.find(r => r.component === '系统资源');
  if (memoryCheck && memoryCheck.status === 'warning') {
    recommendations.push('系统内存使用较高，考虑重启开发服务器');
  }

  if (recommendations.length === 0) {
    recommendations.push('系统运行正常，所有组件都健康运行');
  }

  return recommendations;
} 