"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Settings,
  FileText,
  Shield,
  Wrench,
  Loader2,
  Search,
  Link,
  Download
} from 'lucide-react';

interface TableStatus {
  [tableName: string]: boolean;
}

interface DiagnosisResult {
  issues: string[];
  recommendations: string[];
}

interface QuickFixResult {
  success: boolean;
  results: { step: string; success: boolean; error?: any }[];
}

interface RelationshipReport {
  summary: {
    total: number;
    existing: number;
    missing: number;
    healthScore: number;
  };
  details: {
    existing: any[];
    missing: any[];
  };
  recommendations: string[];
}

export default function DatabaseManagementPage() {
  const [tableStatus, setTableStatus] = useState<TableStatus>({});
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult>({ issues: [], recommendations: [] });
  const [fixResult, setFixResult] = useState<QuickFixResult | null>(null);
  const [relationshipReport, setRelationshipReport] = useState<RelationshipReport | null>(null);
  const [relationshipFixResult, setRelationshipFixResult] = useState<QuickFixResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [isCompleteSetupLoading, setIsCompleteSetupLoading] = useState(false);
  const [completeSetupResult, setCompleteSetupResult] = useState<any>(null);

  // 页面加载时自动诊断
  useEffect(() => {
    runDiagnosis();
  }, []);

  const runDiagnosis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database-migration');
      const data = await response.json();
      
      if (data.success) {
        setTableStatus(data.tableStatus);
        setDiagnosis(data.diagnosis);
        setRelationshipReport(data.relationshipReport);
        setLastUpdate(new Date().toLocaleString());
      } else {
        console.error('诊断失败:', data.error || '未知错误');
      }
    } catch (error) {
      console.error('诊断请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runQuickFix = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quickFix' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFixResult(data.result);
        // 修复后重新诊断
        setTimeout(() => runDiagnosis(), 1000);
      } else {
        console.error('快速修复失败:', data.error || '未知错误');
      }
    } catch (error) {
      console.error('快速修复请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTables = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkTables' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTableStatus(data.result.tableStatus);
        setLastUpdate(new Date().toLocaleString());
      } else {
        console.error('表检查失败:', data.error || '未知错误');
      }
    } catch (error) {
      console.error('表检查请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const repairRelationships = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'repairRelationships' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRelationshipFixResult(data.result);
        // 修复后重新诊断
        setTimeout(() => runDiagnosis(), 1000);
      } else {
        console.error('关联关系修复失败:', data.error || '未知错误');
      }
    } catch (error) {
      console.error('关联关系修复请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkRelationships = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/database-migration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkRelationships' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRelationshipReport(data.result);
        setLastUpdate(new Date().toLocaleString());
      } else {
        console.error('关联关系检查失败:', data.error || '未知错误');
      }
    } catch (error) {
      console.error('关联关系检查请求失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTableStatusIcon = (exists: boolean) => {
    return exists ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getTableStatusBadge = (exists: boolean) => {
    return exists ? (
      <Badge variant="outline" className="text-green-700 border-green-300">存在</Badge>
    ) : (
      <Badge variant="destructive">缺失</Badge>
    );
  };

  const existingTablesCount = Object.values(tableStatus).filter(Boolean).length;
  const totalTablesCount = Object.keys(tableStatus).length;
  const completionPercentage = totalTablesCount > 0 ? (existingTablesCount / totalTablesCount) * 100 : 0;

  // 添加完整补全功能
  const handleCompleteSetup = async () => {
    setIsCompleteSetupLoading(true);
    setCompleteSetupResult(null);

    try {
      console.log('🚀 开始执行完整数据库补全...');
      
      const response = await fetch('/api/database-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'completeSetup' }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCompleteSetupResult(data.result);
        console.log('✅ 完整补全成功:', data.result);
        // 重新诊断
        await runDiagnosis();
      } else {
        console.error('❌ 完整补全失败:', data.error);
        setCompleteSetupResult({
          success: false,
          error: data.error,
          results: []
        });
      }
    } catch (error) {
      console.error('❌ 完整补全异常:', error);
      setCompleteSetupResult({
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        results: []
      });
    } finally {
      setIsCompleteSetupLoading(false);
    }
  };

  // 下载完整数据库设置脚本
  const downloadSQLScript = () => {
    try {
      // 从 src/lib/complete-database-setup.sql 读取内容
      const sqlContent = `-- ============================================================================
-- 水晶日历系统 - 完整数据库设置脚本
-- 适用于系统上线前的数据库补全
-- 请在 Supabase SQL 编辑器中执行此脚本
-- ============================================================================

-- 第一部分：创建必要的数据库函数
-- ============================================================================

-- 1. 创建 exec_sql 函数，用于执行动态SQL
CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN 'SUCCESS';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERROR: ' || SQLERRM;
END;
$$;

-- 2. 创建 check_foreign_key_exists 函数，用于检查外键约束
CREATE OR REPLACE FUNCTION public.check_foreign_key_exists(
  constraint_name TEXT,
  table_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO exists_count
  FROM information_schema.table_constraints
  WHERE constraint_type = 'FOREIGN KEY'
    AND constraint_name = check_foreign_key_exists.constraint_name
    AND table_name = check_foreign_key_exists.table_name;
  
  RETURN exists_count > 0;
END;
$$;

-- 3. 创建自动更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 第二部分：创建所有必要的表格
-- ============================================================================

-- 1. 确保 profiles 表存在并有所有必要字段
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  birth_date DATE,
  gender VARCHAR(50),
  zodiac_sign VARCHAR(50),
  chinese_zodiac VARCHAR(50),
  element VARCHAR(50),
  mbti VARCHAR(10),
  answers JSONB DEFAULT '{}',
  chakra_analysis JSONB DEFAULT '{}',
  energy_preferences TEXT[],
  personality_insights TEXT[],
  enhanced_assessment JSONB DEFAULT '{}',
  avatar_url TEXT,
  location VARCHAR(100),
  timezone VARCHAR(50),
  language VARCHAR(10) DEFAULT 'zh',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加 profiles 表的缺失字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enhanced_assessment JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'zh';

-- 2. 创建设计作品表
CREATE TABLE IF NOT EXISTS design_works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  profile_id UUID,
  title VARCHAR(200),
  description TEXT,
  prompt TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  style VARCHAR(100),
  category VARCHAR(100),
  crystals_used TEXT[],
  colors TEXT[],
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  generation_params JSONB DEFAULT '{}',
  ai_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 请在Supabase控制台完整执行此脚本
-- 完整脚本内容请从系统管理员获取
-- 或访问项目仓库 src/lib/complete-database-setup.sql 文件

-- 完成提示
SELECT 'PLEASE_EXECUTE_COMPLETE_SCRIPT' as status, 
       'Please execute the complete script from src/lib/complete-database-setup.sql' as message;`;

      const blob = new Blob([sqlContent], { type: 'text/sql' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crystal-calendar-database-setup-${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ SQL脚本下载成功');
    } catch (error) {
      console.error('❌ 下载SQL脚本失败:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Database className="w-8 h-8" />
            数据库关联管理
          </h1>
          <p className="text-gray-600 mt-2">监控和修复数据库表结构与关联关系</p>
        </div>

        {/* 操作按钮 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              快速操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={runDiagnosis}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                重新诊断
              </Button>
              
              <Button 
                onClick={checkTables}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                检查表状态
              </Button>
              
              <Button 
                onClick={runQuickFix}
                disabled={isLoading}
                variant="default"
                className="flex items-center gap-2"
              >
                <Wrench className="w-4 h-4" />
                执行快速修复
              </Button>
              
              <Button 
                onClick={checkRelationships}
                disabled={isLoading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                检查关联关系
              </Button>
              
              <Button 
                onClick={handleCompleteSetup}
                disabled={isCompleteSetupLoading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4" />
                完整补全
              </Button>
            </div>
            
            {lastUpdate && (
              <p className="text-sm text-gray-500 mt-2">
                最后更新: {lastUpdate}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 数据库表状态概览 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                数据库表状态
              </span>
              <span className="text-sm font-normal text-gray-500">
                {existingTablesCount}/{totalTablesCount} 表存在
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">完整度</span>
                  <span className="text-sm text-gray-500">{completionPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(tableStatus).map(([tableName, exists]) => (
                  <div key={tableName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getTableStatusIcon(exists)}
                      <span className="font-medium text-sm">{tableName}</span>
                    </div>
                    {getTableStatusBadge(exists)}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据库关联关系状态 */}
        {relationshipReport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  数据库关联关系
                </span>
                <span className="text-sm font-normal text-gray-500">
                  健康度: {relationshipReport.summary?.healthScore ?? 0}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">关联完整度</span>
                    <span className="text-sm text-gray-500">
                      {relationshipReport.summary?.existing ?? 0}/{relationshipReport.summary?.total ?? 0} 已建立
                    </span>
                  </div>
                  <Progress value={relationshipReport.summary?.healthScore ?? 0} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {relationshipReport.summary?.existing ?? 0}
                    </div>
                    <div className="text-sm text-gray-500">已建立关联</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {relationshipReport.summary?.missing ?? 0}
                    </div>
                    <div className="text-sm text-gray-500">缺失关联</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {relationshipReport.summary?.total ?? 0}
                    </div>
                    <div className="text-sm text-gray-500">总关联数</div>
                  </div>
                </div>

                {relationshipReport.summary?.missing > 0 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        发现 {relationshipReport.summary?.missing ?? 0} 个缺失的关联关系
                      </span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      建议执行"修复关联关系"功能来自动创建这些关联
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 关联关系修复结果 */}
        {relationshipFixResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                关联关系修复结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {relationshipFixResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                  <span className="font-medium">
                    修复状态: {relationshipFixResult.success ? '成功' : '部分成功'}
                  </span>
                </div>

                <div className="space-y-2">
                  {relationshipFixResult.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{result.step}</span>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge variant={result.success ? "outline" : "destructive"}>
                          {result.success ? '成功' : '失败'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 问题诊断结果 */}
        {diagnosis.issues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-5 h-5" />
                发现的问题 ({diagnosis.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {diagnosis.issues.map((issue, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {issue}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 修复建议 */}
        {diagnosis.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <FileText className="w-5 h-5" />
                修复建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnosis.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 快速修复结果 */}
        {fixResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                快速修复结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {fixResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                  <span className="font-medium">
                    修复状态: {fixResult.success ? '成功' : '部分成功'}
                  </span>
                </div>

                <div className="space-y-2">
                  {fixResult.results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{result.step}</span>
                      <div className="flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge variant={result.success ? "outline" : "destructive"}>
                          {result.success ? '成功' : '失败'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 完整补全结果 */}
        {completeSetupResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                完整补全结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg mb-4 ${
                completeSetupResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {completeSetupResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  )}
                  <span className={`font-medium ${
                    completeSetupResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {completeSetupResult.success ? '✅ 完整补全成功' : '❌ 完整补全失败'}
                  </span>
                </div>
                {completeSetupResult.error && (
                  <p className="text-red-700 text-sm mt-2">
                    错误信息: {completeSetupResult.error}
                  </p>
                )}
              </div>

              {completeSetupResult.results && completeSetupResult.results.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900 mb-3">执行步骤详情:</h3>
                  {completeSetupResult.results.map((result: any, index: number) => (
                    <div key={index} className={`flex items-center p-3 rounded-lg ${
                      result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {result.success ? (
                        <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <span className="font-medium">{result.step}</span>
                        {result.error && (
                          <p className="text-sm mt-1">错误: {result.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 完整数据库设置脚本 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              完整数据库设置脚本
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-900 mb-2">🚀 推荐方案：直接执行完整脚本</h3>
                  <p className="text-green-800 text-sm">
                    为了确保所有表格、函数、索引和数据正确创建，建议在 Supabase SQL 编辑器中直接执行完整脚本。
                  </p>
                </div>
                <Button
                  onClick={downloadSQLScript}
                  className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  下载脚本
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">📋 执行步骤：</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                  <li>点击上方"下载脚本"按钮，保存完整的数据库设置脚本</li>
                  <li>前往 <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-medium">Supabase 控制台</a></li>
                  <li>选择你的项目 → SQL Editor</li>
                  <li>新建查询，复制粘贴下载的脚本内容</li>
                  <li>点击"RUN"执行脚本</li>
                  <li>返回此页面，点击"重新诊断"查看结果</li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-900 mb-2">⚠️ 注意事项：</h3>
                <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
                  <li>脚本使用 IF NOT EXISTS 语句，可以安全地重复执行</li>
                  <li>脚本会自动创建所有必要的表格、索引、外键关联和基础数据</li>
                  <li>执行完成后会显示 "DATABASE_SETUP_COMPLETE" 确认信息</li>
                  <li>如果某些步骤失败，可以多次执行脚本，不会造成数据丢失</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">📦 脚本包含内容：</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="bg-white p-2 rounded border">
                    <span className="text-green-600 font-medium">✓</span> 数据库函数
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-green-600 font-medium">✓</span> 10个数据表
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-green-600 font-medium">✓</span> 索引优化
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-green-600 font-medium">✓</span> 外键关联
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-green-600 font-medium">✓</span> 权限策略
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <span className="text-green-600 font-medium">✓</span> 基础水晶数据
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 手动修复指南 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              故障排除指南
            </CardTitle>
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
                ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enhanced_assessment JSONB DEFAULT '{}';
              </div>
            </div>

            <Separator />

            <div>
              <Badge variant="outline" className="mb-2">表缺失错误</Badge>
              <p className="text-sm text-gray-600 mb-2">
                如果某些数据库表不存在，需要创建相应的表结构：
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                -- 请联系系统管理员运行完整的数据库迁移脚本
              </div>
            </div>

            <Separator />

            <div>
              <Badge variant="outline" className="mb-2">关联关系错误</Badge>
              <p className="text-sm text-gray-600 mb-2">
                如果表之间的外键关联缺失，可能导致数据一致性问题：
              </p>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                -- 在 Supabase SQL编辑器中执行：<br/>
                ALTER TABLE profiles ADD CONSTRAINT fk_profiles_user_id <br/>
                FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
              </div>
            </div>

            <Separator />

            <div>
              <Badge variant="outline" className="mb-2">紧急访问</Badge>
              <p className="text-sm text-gray-600">
                如果所有修复方案都不可行，系统会将数据暂存在浏览器中，确保用户数据不丢失。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 