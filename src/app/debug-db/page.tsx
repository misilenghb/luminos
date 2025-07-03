"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { manualDatabaseFix, checkUserProfileIntegrity } from '@/lib/database-fix';
import { profileService } from '@/lib/supabase';

export default function DatabaseDebugPage() {
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail] = useState('344498889@qq.com'); // 测试邮箱

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    addResult('🔌 测试数据库连接...');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // 测试基本连接
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        addResult(`❌ 数据库连接失败: ${error.message}`);
      } else {
        addResult('✅ 数据库连接正常');
      }
    } catch (error) {
      addResult(`❌ 数据库连接异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testProfileAccess = async () => {
    setIsLoading(true);
    addResult('👤 测试用户档案访问权限...');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // 尝试查询profiles表
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', testEmail)
        .limit(1);
      
      if (error) {
        addResult(`❌ 档案查询失败: ${error.message} (代码: ${error.code})`);
        
        if (error.code === '42501') {
          addResult('🔒 检测到行级安全策略(RLS)限制');
          addResult('💡 建议解决方案:');
          addResult('   1. 确保用户已正确登录');
          addResult('   2. 在Supabase控制台临时关闭RLS:');
          addResult('      ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;');
          addResult('   3. 或添加允许所有操作的策略:');
          addResult('      CREATE POLICY "allow_all" ON profiles FOR ALL USING (true);');
        }
      } else {
        addResult(`✅ 档案查询成功，找到 ${data?.length || 0} 条记录`);
      }
    } catch (error) {
      addResult(`❌ 档案访问异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testEnhancedAssessmentField = async () => {
    setIsLoading(true);
    addResult('🧪 测试 enhanced_assessment 字段...');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // 尝试查询enhanced_assessment字段
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, enhanced_assessment')
        .eq('email', testEmail)
        .limit(1);
      
      if (error) {
        addResult(`❌ enhanced_assessment字段查询失败: ${error.message}`);
        
        if (error.message?.includes('column') && error.message?.includes('enhanced_assessment')) {
          addResult('📋 enhanced_assessment字段不存在');
          addResult('💡 请在Supabase控制台执行:');
          addResult('   ALTER TABLE profiles ADD COLUMN enhanced_assessment JSONB;');
        }
      } else {
        addResult('✅ enhanced_assessment字段存在且可查询');
        if (data?.[0]?.enhanced_assessment) {
          addResult('📊 字段已有数据');
        } else {
          addResult('📝 字段为空，可以写入数据');
        }
      }
    } catch (error) {
      addResult(`❌ 字段测试异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testUpdatePermission = async () => {
    setIsLoading(true);
    addResult('✏️ 测试更新权限...');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // 尝试更新enhanced_assessment字段
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: '数据库权限测试'
      };
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          enhanced_assessment: testData,
          updated_at: new Date().toISOString()
        })
        .eq('email', testEmail);
      
      if (error) {
        addResult(`❌ 更新权限测试失败: ${error.message} (代码: ${error.code})`);
        
        if (error.code === '42501') {
          addResult('🚫 行级安全策略阻止更新操作');
        } else if (error.code === 'PGRST116') {
          addResult('❓ 未找到匹配的用户记录');
        }
      } else {
        addResult('✅ 更新权限正常，数据写入成功');
      }
    } catch (error) {
      addResult(`❌ 更新测试异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestProfile = async () => {
    setIsLoading(true);
    addResult('➕ 创建测试用户档案...');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      const testProfile = {
        email: testEmail,
        name: '数据库测试用户',
        birth_date: '1990-01-01',
        gender: 'prefer_not_to_say',
        zodiac_sign: '摩羯座',
        chinese_zodiac: '马',
        element: '土',
        mbti: 'INFP',
        answers: { test: 'data' },
        enhanced_assessment: {
          test: true,
          created: new Date().toISOString()
        }
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert(testProfile, { onConflict: 'email' })
        .select()
        .single();
      
      if (error) {
        addResult(`❌ 创建测试档案失败: ${error.message} (代码: ${error.code})`);
      } else {
        addResult('✅ 测试档案创建成功');
        addResult(`📝 档案ID: ${data.id}`);
      }
    } catch (error) {
      addResult(`❌ 创建测试档案异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    clearResults();
    addResult('🚀 开始运行所有诊断测试...');
    
    await testDatabaseConnection();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testProfileAccess();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testEnhancedAssessmentField();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testUpdatePermission();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    addResult('🏁 所有测试完成');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">数据库诊断工具</h1>
          <p className="text-gray-600 mt-2">诊断和修复增强评估数据保存问题</p>
        </div>

        <Alert>
          <AlertDescription>
            这个页面用于诊断数据库连接和权限问题。如果您遇到"增强评估数据保存失败"错误，请运行这些测试。
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>诊断测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button 
                onClick={testDatabaseConnection}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                🔌 连接测试
              </Button>
              
              <Button 
                onClick={testProfileAccess}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                👤 访问权限
              </Button>
              
              <Button 
                onClick={testEnhancedAssessmentField}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                🧪 字段测试
              </Button>
              
              <Button 
                onClick={testUpdatePermission}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                ✏️ 更新权限
              </Button>
              
              <Button 
                onClick={createTestProfile}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                ➕ 创建测试
              </Button>
              
              <Button 
                onClick={runAllTests}
                disabled={isLoading}
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                🚀 运行所有测试
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>测试结果</CardTitle>
            <Button 
              onClick={clearResults}
              variant="outline"
              size="sm"
            >
              清空日志
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-gray-500 text-center py-4">暂无测试结果</p>
              ) : (
                results.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {result}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>常见问题解决方案</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant="destructive" className="mb-2">RLS 权限错误 (42501)</Badge>
              <p className="text-sm text-gray-600 mb-2">
                如果遇到"row-level security policy"错误，表示数据库的行级安全策略阻止了操作。
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                -- 在 Supabase SQL编辑器中执行：<br/>
                ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
              </div>
            </div>

            <Separator />

            <div>
              <Badge variant="secondary" className="mb-2">字段不存在错误</Badge>
              <p className="text-sm text-gray-600 mb-2">
                如果遇到"enhanced_assessment column does not exist"错误：
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                -- 在 Supabase SQL编辑器中执行：<br/>
                ALTER TABLE profiles ADD COLUMN enhanced_assessment JSONB;
              </div>
            </div>

            <Separator />

            <div>
              <Badge variant="outline" className="mb-2">临时解决方案</Badge>
              <p className="text-sm text-gray-600">
                如果上述方案都不可行，增强评估数据会暂存在浏览器中，下次访问时仍可查看。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 