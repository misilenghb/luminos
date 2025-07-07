"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Database, User, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DebugProfilePage() {
  const { isAuthenticated, user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadProfileData = async () => {
    if (!isAuthenticated || !user?.email) {
      setError('用户未登录');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { profileService } = await import('@/lib/supabase');
      const profile = await profileService.getUserProfileByEmail(user.email);
      
      setProfileData(profile);
      setLastUpdated(new Date().toLocaleString());
      
      if (!profile) {
        setError('未找到用户档案数据');
      }
    } catch (err) {
      console.error('加载档案数据失败:', err);
      setError('加载档案数据失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfileData();
    }
  }, [isAuthenticated, user]);

  const renderValue = (value: any, key: string) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">null</span>;
    }
    
    if (typeof value === 'object') {
      return (
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
            查看对象 ({Object.keys(value).length} 个属性)
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(value, null, 2)}
          </pre>
        </details>
      );
    }
    
    if (typeof value === 'string' && value.length > 100) {
      return (
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
            查看长文本 ({value.length} 字符)
          </summary>
          <div className="mt-2 p-2 bg-muted rounded text-sm max-h-40 overflow-auto">
            {value}
          </div>
        </details>
      );
    }
    
    return <span className="font-mono">{String(value)}</span>;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">用户档案数据调试</h1>
        <p className="text-muted-foreground">
          检查用户档案数据的存储和读取情况，确保问卷答案正确对应到仪表板显示
        </p>
      </div>

      {/* 用户状态 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            用户状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium">登录状态:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"} className="ml-2">
                {isAuthenticated ? "已登录" : "未登录"}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium">用户邮箱:</span>
              <span className="ml-2 font-mono">{user?.email || '无'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 操作按钮 */}
      <div className="mb-6 flex gap-3">
        <Button 
          onClick={loadProfileData} 
          disabled={loading || !isAuthenticated}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          重新加载数据
        </Button>
        
        {lastUpdated && (
          <Badge variant="outline">
            最后更新: {lastUpdated}
          </Badge>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">错误:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 档案数据 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            数据库中的档案数据
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>加载中...</p>
            </div>
          ) : profileData ? (
            <div className="space-y-4">
              {/* 基本信息 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  基本信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    'id', 'user_id', 'email', 'name', 'birth_date', 'gender',
                    'created_at', 'updated_at'
                  ].map(key => (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-muted-foreground">{key}:</span>
                      {renderValue(profileData[key], key)}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 分析结果 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  分析结果
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {[
                    'zodiac_sign', 'chinese_zodiac', 'element', 'mbti'
                  ].map(key => (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-muted-foreground">{key}:</span>
                      {renderValue(profileData[key], key)}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 复杂数据 */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  复杂数据
                </h3>
                <div className="space-y-4 text-sm">
                  {[
                    'answers', 'chakra_analysis', 'energy_preferences', 
                    'personality_insights', 'enhanced_assessment'
                  ].map(key => (
                    <div key={key} className="flex flex-col">
                      <span className="font-medium text-muted-foreground">{key}:</span>
                      {renderValue(profileData[key], key)}
                    </div>
                  ))}
                </div>
              </div>

              {/* 数据完整性检查 */}
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">数据完整性检查</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'name', label: '姓名' },
                    { key: 'mbti', label: 'MBTI' },
                    { key: 'zodiac_sign', label: '星座' },
                    { key: 'element', label: '元素' },
                    { key: 'answers', label: '问卷答案' },
                    { key: 'chakra_analysis', label: '脉轮分析' },
                    { key: 'personality_insights', label: '个性洞察' },
                    { key: 'energy_preferences', label: '能量偏好' }
                  ].map(({ key, label }) => (
                    <Badge 
                      key={key}
                      variant={profileData[key] ? "default" : "secondary"}
                      className="justify-center"
                    >
                      {label}: {profileData[key] ? "✓" : "✗"}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isAuthenticated ? '暂无档案数据' : '请先登录'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
