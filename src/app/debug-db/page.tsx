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
    addResult('🧪 测试增强评估字段...');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      const { testEnhancedAssessmentSaving } = await import('@/lib/database-fix');
      
      const result = await testEnhancedAssessmentSaving(testEmail);
      
      if (result.success) {
        addResult(`✅ 增强评估字段测试成功: ${result.message}`);
        addResult(`✓ 字段存在: ${result.hasField}`);
        addResult(`✓ 可以更新: ${result.canUpdate}`);
      } else {
        addResult(`❌ 增强评估字段测试失败: ${result.message}`);
        addResult(`✓ 字段存在: ${result.hasField}`);
        addResult(`✗ 可以更新: ${result.canUpdate}`);
        
        if (!result.hasField) {
          addResult(`
            📋 需要添加字段，请在SQL编辑器中执行:
            ALTER TABLE profiles ADD COLUMN enhanced_assessment JSONB DEFAULT '{}';
          `);
        }
      }
    } catch (error) {
      addResult(`❌ 测试增强评估字段异常: ${error}`);
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

  const addEnhancedAssessmentColumn = async () => {
    setIsLoading(true);
    addResult('🔧 正在添加enhanced_assessment字段到profiles表...');
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // 执行SQL添加字段
      const { error } = await supabase.rpc('exec_sql', { 
        sql: `
          -- 检查字段是否已存在
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'profiles' 
              AND column_name = 'enhanced_assessment'
            ) THEN
              -- 添加字段
              ALTER TABLE profiles ADD COLUMN enhanced_assessment JSONB DEFAULT '{}';
              RAISE NOTICE 'enhanced_assessment字段已添加';
            ELSE
              RAISE NOTICE 'enhanced_assessment字段已存在';
            END IF;
          END
          $$;
        `
      });
      
      if (error) {
        addResult(`❌ 添加字段失败: ${error.message}`);
      } else {
        addResult('✅ enhanced_assessment字段已成功添加或已存在');
      }
    } catch (error) {
      addResult(`❌ 添加字段异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLocalStorage = () => {
    setIsLoading(true);
    addResult('🧪 测试本地存储功能...');
    
    try {
      // 测试写入
      const testData = {
        test: true,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('debug_test_data', JSON.stringify(testData));
      addResult('✅ 本地存储写入成功');
      
      // 测试读取
      const readData = localStorage.getItem('debug_test_data');
      if (readData) {
        const parsedData = JSON.parse(readData);
        addResult(`✅ 本地存储读取成功: ${JSON.stringify(parsedData)}`);
      } else {
        addResult('❌ 本地存储读取失败: 未找到数据');
      }
      
      // 测试删除
      localStorage.removeItem('debug_test_data');
      const checkDeleted = localStorage.getItem('debug_test_data');
      if (!checkDeleted) {
        addResult('✅ 本地存储删除成功');
      } else {
        addResult('❌ 本地存储删除失败');
      }
      
      // 测试大数据存储
      try {
        const largeData = { data: Array(1000).fill('测试数据').join('') };
        localStorage.setItem('large_test_data', JSON.stringify(largeData));
        localStorage.removeItem('large_test_data');
        addResult('✅ 大数据存储测试成功');
      } catch (error) {
        addResult(`❌ 大数据存储测试失败: ${error}`);
      }
      
      addResult('✅ 本地存储功能测试完成');
    } catch (error) {
      addResult(`❌ 本地存储测试异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkQuestionnaireData = () => {
    setIsLoading(true);
    addResult('🔍 检查问卷数据保存状态...');
    
    try {
      // 检查基础问卷数据
      const basicData = localStorage.getItem('questionnaire_form_data');
      if (basicData) {
        try {
          const parsedData = JSON.parse(basicData);
          addResult('✅ 发现基础问卷数据:');
          addResult(`📋 数据大小: ${basicData.length} 字节`);
          addResult(`📋 数据字段: ${Object.keys(parsedData).join(', ')}`);
        } catch (error) {
          addResult(`❌ 基础问卷数据解析失败: ${error}`);
        }
      } else {
        addResult('ℹ️ 未找到基础问卷数据');
      }
      
      // 检查增强问卷数据
      const enhancedQuestionnaireData = localStorage.getItem('enhanced_questionnaire_data');
      if (enhancedQuestionnaireData) {
        try {
          const parsedData = JSON.parse(enhancedQuestionnaireData);
          addResult('✅ 发现增强问卷数据:');
          addResult(`📋 数据大小: ${enhancedQuestionnaireData.length} 字节`);
          addResult(`📋 数据字段: ${Object.keys(parsedData).join(', ')}`);
        } catch (error) {
          addResult(`❌ 增强问卷数据解析失败: ${error}`);
        }
      } else {
        addResult('ℹ️ 未找到增强问卷数据');
      }
      
      // 检查增强评估结果数据
      const enhancedAssessmentData = localStorage.getItem('enhanced_assessment_data');
      if (enhancedAssessmentData) {
        try {
          const parsedData = JSON.parse(enhancedAssessmentData);
          addResult('✅ 发现增强评估结果数据:');
          addResult(`📋 数据大小: ${enhancedAssessmentData.length} 字节`);
          // 如果是对象，显示键名；如果是数组，显示长度
          if (Array.isArray(parsedData)) {
            addResult(`📋 数组长度: ${parsedData.length}`);
          } else {
            addResult(`📋 数据字段: ${Object.keys(parsedData).join(', ')}`);
          }
        } catch (error) {
          addResult(`❌ 增强评估结果数据解析失败: ${error}`);
        }
      } else {
        addResult('ℹ️ 未找到增强评估结果数据');
      }
      
      addResult('✅ 问卷数据检查完成');
    } catch (error) {
      addResult(`❌ 检查问卷数据异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearQuestionnaireData = () => {
    setIsLoading(true);
    addResult('🧹 开始清除本地问卷数据...');
    
    try {
      // 清除基础问卷数据
      const basicData = localStorage.getItem('questionnaire_form_data');
      if (basicData) {
        localStorage.removeItem('questionnaire_form_data');
        addResult('✅ 已清除基础问卷数据');
      } else {
        addResult('ℹ️ 未找到基础问卷数据');
      }
      
      // 清除增强问卷数据
      const enhancedQuestionnaireData = localStorage.getItem('enhanced_questionnaire_data');
      if (enhancedQuestionnaireData) {
        localStorage.removeItem('enhanced_questionnaire_data');
        addResult('✅ 已清除增强问卷数据');
      } else {
        addResult('ℹ️ 未找到增强问卷数据');
      }
      
      // 清除增强评估结果数据
      const enhancedAssessmentData = localStorage.getItem('enhanced_assessment_data');
      if (enhancedAssessmentData) {
        localStorage.removeItem('enhanced_assessment_data');
        addResult('✅ 已清除增强评估结果数据');
      } else {
        addResult('ℹ️ 未找到增强评估结果数据');
      }
      
      addResult('✅ 所有问卷数据已清除');
    } catch (error) {
      addResult(`❌ 清除问卷数据异常: ${error}`);
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
    
    await testLocalStorage();
    
    await checkQuestionnaireData();
    
    addResult('🏁 所有测试完成');
  };

  const fixDatabaseIssues = async () => {
    setIsLoading(true);
    addResult('🔧 开始修复数据库问题...');
    
    try {
      const { 
        ensureEnhancedAssessmentColumn, 
        fixProfilesRLS, 
        fixDesignWorksRLS 
      } = await import('@/lib/database-fix');
      
      // 1. 确保enhanced_assessment字段存在
      addResult('1️⃣ 检查并添加enhanced_assessment字段...');
      const columnResult = await ensureEnhancedAssessmentColumn();
      addResult(columnResult ? '✅ enhanced_assessment字段检查完成' : '❌ enhanced_assessment字段检查失败');
      
      // 2. 修复profiles表的RLS策略
      addResult('2️⃣ 修复profiles表的RLS策略...');
      const profilesRLSResult = await fixProfilesRLS();
      addResult(profilesRLSResult ? '✅ profiles表RLS策略修复完成' : '❌ profiles表RLS策略修复失败');
      
      // 3. 修复design_works表的RLS策略
      addResult('3️⃣ 修复design_works表的RLS策略...');
      const designRLSResult = await fixDesignWorksRLS();
      addResult(designRLSResult ? '✅ design_works表RLS策略修复完成' : '❌ design_works表RLS策略修复失败');
      
      // 4. 测试enhanced_assessment字段
      addResult('4️⃣ 测试enhanced_assessment字段...');
      const { testEnhancedAssessmentSaving } = await import('@/lib/database-fix');
      const testResult = await testEnhancedAssessmentSaving(testEmail);
      
      if (testResult.success) {
        addResult('✅ enhanced_assessment字段测试成功');
      } else {
        addResult(`❌ enhanced_assessment字段测试失败: ${testResult.message}`);
      }
      
      // 总结
      addResult('📋 数据库修复总结:');
      addResult(`- enhanced_assessment字段: ${columnResult ? '✓' : '✗'}`);
      addResult(`- profiles表RLS策略: ${profilesRLSResult ? '✓' : '✗'}`);
      addResult(`- design_works表RLS策略: ${designRLSResult ? '✓' : '✗'}`);
      addResult(`- 字段测试: ${testResult.success ? '✓' : '✗'}`);
      
    } catch (error) {
      addResult(`❌ 修复数据库异常: ${error}`);
    } finally {
      setIsLoading(false);
    }
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
                🧪 测试字段
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
                onClick={addEnhancedAssessmentColumn}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                🔧 添加字段
              </Button>
              
              <Button 
                onClick={testLocalStorage}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                🧪 测试本地存储
              </Button>
              
              <Button 
                onClick={checkQuestionnaireData}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                🔍 检查问卷数据
              </Button>
              
              <Button 
                onClick={clearQuestionnaireData}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                🧹 清除问卷数据
              </Button>
              
              <Button 
                onClick={runAllTests}
                disabled={isLoading}
                variant="default"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                🚀 运行所有测试
              </Button>
              
              <Button 
                onClick={fixDatabaseIssues}
                disabled={isLoading}
                variant="default"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                🛠️ 全面修复
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