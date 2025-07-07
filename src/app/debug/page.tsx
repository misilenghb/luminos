"use client";

import { useState } from 'react';
import { testSupabaseConnection, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SystemHealthDashboard from '@/components/SystemHealthDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DebugPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setTestResult('');
    
    // 捕获控制台输出
    const originalLog = console.log;
    const originalError = console.error;
    let logs: string[] = [];
    
    console.log = (...args) => {
      logs.push(`[LOG] ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' ')}`);
      originalLog(...args);
    };
    
    console.error = (...args) => {
      logs.push(`[ERROR] ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' ')}`);
      originalError(...args);
    };
    
    try {
      const result = await testSupabaseConnection();
      logs.push(`[RESULT] 连接测试${result ? '成功' : '失败'}`);
    } catch (error) {
      logs.push(`[EXCEPTION] ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      // 恢复原始的控制台函数
      console.log = originalLog;
      console.error = originalError;
      
      setTestResult(logs.join('\n'));
      setIsLoading(false);
    }
  };

  const handleEnvironmentCheck = () => {
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 50)}...` : 
        '未设置',
      ANON_KEY_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      URL_VALID: !!process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://'),
      KEY_STARTS_WITH: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) || '无',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '服务端',
      location: typeof window !== 'undefined' ? window.location.href : '服务端'
    };

    setTestResult(`环境变量检查:\n${JSON.stringify(envInfo, null, 2)}`);
  };

  const handleQuickCheck = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    let logs: string[] = [];
    logs.push('🔍 快速环境检查:');
    logs.push(`📍 URL设置: ${supabaseUrl ? '✅ 已配置' : '❌ 未配置'}`);
    logs.push(`🔑 密钥设置: ${supabaseAnonKey ? '✅ 已配置' : '❌ 未配置'}`);
    
    if (supabaseUrl) {
      logs.push(`📍 URL值: ${supabaseUrl}`);
      logs.push(`📍 URL格式: ${supabaseUrl.startsWith('https://') ? '✅ 正确' : '❌ 错误'}`);
    }
    
    if (supabaseAnonKey) {
      logs.push(`🔑 密钥长度: ${supabaseAnonKey.length} 字符`);
      logs.push(`🔑 密钥开头: ${supabaseAnonKey.substring(0, 20)}...`);
      logs.push(`🔑 密钥格式: ${supabaseAnonKey.includes('.') ? '✅ JWT格式' : '❌ 格式错误'}`);
    }
    
    setTestResult(logs.join('\n'));
  };

  const handleManualTest = async () => {
    setIsLoading(true);
    setTestResult('');
    
    try {
      // 手动读取环境变量并创建客户端
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      let logs: string[] = [];
      logs.push(`[MANUAL] URL: ${supabaseUrl || '未设置'}`);
      logs.push(`[MANUAL] Key: ${supabaseAnonKey ? `${supabaseAnonKey.substring(0, 50)}...` : '未设置'}`);
      
      if (!supabaseUrl || !supabaseAnonKey) {
        logs.push('[MANUAL] ❌ 环境变量未设置');
        setTestResult(logs.join('\n'));
        return;
      }

      // 使用共享的 Supabase 客户端
      logs.push('[MANUAL] ✅ 使用共享客户端');

      // 测试认证
      const { data: authData, error: authError } = await supabase.auth.getSession();
      if (authError) {
        logs.push(`[MANUAL] ❌ 认证失败: ${JSON.stringify(authError)}`);
      } else {
        logs.push('[MANUAL] ✅ 认证服务正常');
      }

      // 测试数据库查询
      const { data, error } = await supabase
        .from('user_energy_records')
        .select('id')
        .limit(1);
      
      if (error) {
        logs.push(`[MANUAL] ❌ 数据库查询失败: ${JSON.stringify(error)}`);
      } else {
        logs.push(`[MANUAL] ✅ 数据库查询成功: 找到 ${data?.length || 0} 条记录`);
      }

      setTestResult(logs.join('\n'));
    } catch (error) {
      setTestResult(`[MANUAL] 💥 异常: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔧 系统诊断与健康监控</CardTitle>
          <CardDescription>
            全面的系统健康监控和问题诊断工具
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="health" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="health">系统健康状态</TabsTrigger>
              <TabsTrigger value="debug">手动调试工具</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="mt-6">
              <SystemHealthDashboard />
            </TabsContent>

            <TabsContent value="debug" className="mt-6 space-y-4">
              <div className="flex gap-4 flex-wrap">
                <Button 
                  onClick={handleQuickCheck}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  ⚡ 快速检查
                </Button>
                
                <Button 
                  onClick={handleTest} 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? '测试中...' : '🔍 开始连接测试'}
                </Button>
                
                <Button 
                  onClick={handleEnvironmentCheck}
                  variant="outline"
                >
                  📋 检查环境变量
                </Button>

                <Button 
                  onClick={handleManualTest}
                  disabled={isLoading}
                  variant="secondary"
                >
                  🛠️ 手动测试连接
                </Button>
              </div>

              {testResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">📊 测试结果</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                      {testResult}
                    </pre>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💡 常见问题解决方案</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold">1. 环境变量未配置</h4>
                    <p className="text-sm text-gray-600">
                      确保 .env.local 文件存在并包含正确的 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">2. 网络连接问题</h4>
                    <p className="text-sm text-gray-600">
                      检查网络连接，确保可以访问 Supabase 服务
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">3. RLS (Row Level Security) 权限问题</h4>
                    <p className="text-sm text-gray-600">
                      某些表可能启用了行级安全策略，需要正确的权限才能访问
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold">4. 项目暂停或删除</h4>
                    <p className="text-sm text-gray-600">
                      检查 Supabase 项目状态，确保项目处于活跃状态
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">5. 环境变量加载问题</h4>
                    <p className="text-sm text-gray-600">
                      从 Turbopack 切换到标准 Webpack 可能导致环境变量加载方式不同
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 