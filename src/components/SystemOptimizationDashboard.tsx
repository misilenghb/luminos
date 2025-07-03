'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Database, Zap, Users, CheckCircle, AlertCircle, Activity } from 'lucide-react';

interface OptimizationMetrics {
  database: {
    queryPerformance: {
      averageQueryTime: number;
      sampleQuerySuccess: boolean;
      profileSummaryQuerySuccess: boolean;
    };
    dataStats: {
      totalProfiles: number;
      totalEnergyRecords: number;
      totalDesignWorks: number;
      viewsCreated: boolean;
      indexesOptimized: boolean;
    };
    recentActivity: {
      recentProfilesCount: number;
      recentEnergyRecordsCount: number;
    };
  };
  cache: {
    hitRate: number;
    totalItems: number;
    totalHits: number;
    averageCost: number;
    memoryUsage: string;
    cacheHealth: string;
    optimization: {
      enabled: boolean;
      aiCacheEnabled: boolean;
      backgroundRefreshEnabled: boolean;
    };
  };
  api: {
    quotaManagement: {
      enabled: boolean;
      freeUserLimit: number;
      currentUsage: number;
    };
    retryMechanism: {
      enabled: boolean;
      intelligentBackoff: boolean;
      maxRetries: number;
    };
    costOptimization: {
      cachingEnabled: boolean;
      requestDeduplication: boolean;
      quotaEnforcement: boolean;
      estimatedSavings: string;
    };
  };
  users: {
    totalActiveUsers: number;
    activityDistribution: Record<string, number>;
    optimizationImpact: {
      userExperienceImproved: boolean;
      responseTimeReduced: boolean;
      systemStabilityIncreased: boolean;
    };
  };
  optimization: {
    totalImpacts: number;
    impacts: Array<{
      category: string;
      improvement: string;
      estimatedSpeedUp?: string;
      estimatedCostSaving?: string;
      estimatedReliability?: string;
      status: string;
    }>;
    overallStatus: string;
    implementationDate: string;
    nextSteps: string[];
  };
}

export default function SystemOptimizationDashboard() {
  const [metrics, setMetrics] = useState<OptimizationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/system-optimization');
      const data = await response.json();
      
      if (data.success) {
        setMetrics(data.metrics);
        setLastUpdate(new Date());
      } else {
        setError(data.error || '获取监控数据失败');
      }
    } catch (err) {
      setError('网络请求失败，请检查连接');
      console.error('监控数据获取错误:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // 每30秒自动刷新
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>加载系统监控数据...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>监控数据获取失败</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={fetchMetrics} className="ml-2" size="sm">
            重试
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
      case 'healthy':
        return 'bg-green-500';
      case 'optimized':
        return 'bg-blue-500';
      case 'needs-improvement':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 头部信息 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统优化监控面板</h1>
          <p className="text-gray-600 mt-1">
            实时监控系统性能和优化效果
            {lastUpdate && (
              <span className="ml-2 text-sm">
                最后更新: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <Button onClick={fetchMetrics} disabled={isLoading} className="flex items-center space-x-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>刷新数据</span>
        </Button>
      </div>

      {/* 优化概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>优化概览</span>
          </CardTitle>
          <CardDescription>系统优化实施效果总览</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {metrics.optimization.totalImpacts}
              </div>
              <div className="text-sm text-gray-600">已完成优化项目</div>
            </div>
            <div className="text-center">
              <Badge 
                className={`${getStatusColor(metrics.optimization.overallStatus)} text-white`}
              >
                {metrics.optimization.overallStatus === 'optimized' ? '已优化' : '基线状态'}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">
                实施时间: {new Date(metrics.optimization.implementationDate).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            {metrics.optimization.impacts.map((impact, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{impact.category}</span>
                  <span className="text-sm text-gray-600 ml-2">{impact.improvement}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {impact.estimatedSpeedUp && (
                    <Badge variant="outline">提速 {impact.estimatedSpeedUp}</Badge>
                  )}
                  {impact.estimatedCostSaving && (
                    <Badge variant="outline">节省 {impact.estimatedCostSaving}</Badge>
                  )}
                  {impact.estimatedReliability && (
                    <Badge variant="outline">可靠性 {impact.estimatedReliability}</Badge>
                  )}
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 性能指标网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 数据库性能 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Database className="h-4 w-4" />
              <span>数据库性能</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>查询时间</span>
                <span>{metrics.database.queryPerformance.averageQueryTime}ms</span>
              </div>
              <Progress 
                value={Math.max(0, 100 - metrics.database.queryPerformance.averageQueryTime / 10)} 
                className="mt-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold">{metrics.database.dataStats.totalProfiles}</div>
                <div className="text-gray-600">用户档案</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold">{metrics.database.dataStats.totalEnergyRecords}</div>
                <div className="text-gray-600">能量记录</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">索引优化</span>
              {metrics.database.dataStats.indexesOptimized ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* 缓存性能 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Zap className="h-4 w-4" />
              <span>缓存性能</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>命中率</span>
                <span className={getHealthColor(metrics.cache.cacheHealth)}>
                  {(metrics.cache.hitRate * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.cache.hitRate * 100} className="mt-1" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold">{metrics.cache.totalItems}</div>
                <div className="text-gray-600">缓存项目</div>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded">
                <div className="font-bold">{metrics.cache.totalHits}</div>
                <div className="text-gray-600">命中次数</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">智能缓存</span>
              {metrics.cache.optimization.enabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* API性能 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Activity className="h-4 w-4" />
              <span>API性能</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>配额使用</span>
                <span>{metrics.api.quotaManagement.currentUsage}/{metrics.api.quotaManagement.freeUserLimit}</span>
              </div>
              <Progress 
                value={(metrics.api.quotaManagement.currentUsage / metrics.api.quotaManagement.freeUserLimit) * 100} 
                className="mt-1"
              />
            </div>
            
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="text-sm font-medium text-green-600">
                预计节省 {metrics.api.costOptimization.estimatedSavings}
              </div>
              <div className="text-xs text-gray-600">API调用成本</div>
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>配额管理</span>
                {metrics.api.quotaManagement.enabled ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
              </div>
              <div className="flex justify-between">
                <span>智能重试</span>
                {metrics.api.retryMechanism.enabled ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
              </div>
              <div className="flex justify-between">
                <span>请求去重</span>
                {metrics.api.costOptimization.requestDeduplication ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户活跃度 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4" />
              <span>用户活跃度</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.users.totalActiveUsers}
              </div>
              <div className="text-xs text-gray-600">活跃用户</div>
            </div>
            
            <div className="space-y-1">
              {Object.entries(metrics.users.activityDistribution).map(([level, count]) => (
                <div key={level} className="flex justify-between text-xs">
                  <span>{level}</span>
                  <span>{count}人</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>体验改善</span>
                {metrics.users.optimizationImpact.userExperienceImproved ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
              </div>
              <div className="flex justify-between">
                <span>响应时间</span>
                {metrics.users.optimizationImpact.responseTimeReduced ? <CheckCircle className="h-3 w-3 text-green-500" /> : <AlertCircle className="h-3 w-3 text-red-500" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 下一步优化计划 */}
      <Card>
        <CardHeader>
          <CardTitle>下一步优化计划</CardTitle>
          <CardDescription>持续改进系统性能的后续步骤</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.optimization.nextSteps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 