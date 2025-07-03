'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  BarChart3, 
  Users, 
  Target, 
  DollarSign,
  Clock,
  Activity,
  Zap,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface Phase3Metrics {
  enabled: boolean;
  status: string;
  overallHealth: number;
  machineLearning: any;
  dynamicPricing: any;
  abTesting: any;
  aiOptimization: any;
  metrics: any;
  recommendations: string[];
}

interface SystemData {
  phase3?: Phase3Metrics;
  [key: string]: any;
}

export default function AdvancedAnalyticsPage() {
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // 获取系统数据
  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/system-optimization');
      if (!response.ok) {
        throw new Error('获取系统数据失败');
      }
      const data = await response.json();
      setSystemData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
    // 每5分钟自动刷新数据
    const interval = setInterval(fetchSystemData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'good': return <CheckCircle className="w-4 h-4" />;
      case 'needs_improvement': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>加载高级分析数据中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4" 
              onClick={fetchSystemData}
            >
              重试
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!systemData?.phase3?.enabled) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-yellow-200 bg-yellow-50">
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            第三阶段（机器学习集成）尚未启用。请联系系统管理员启用高级分析功能。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const phase3 = systemData.phase3;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">高级分析仪表板</h1>
          <p className="text-gray-600 mt-1">
            机器学习驱动的深度业务洞察与优化分析
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge className={getStatusColor(phase3.status)}>
            {getStatusIcon(phase3.status)}
            <span className="ml-1">
              {phase3.status === 'excellent' ? '卓越' : 
               phase3.status === 'good' ? '良好' : '需要改进'}
            </span>
          </Badge>
          <Button variant="outline" onClick={fetchSystemData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </Button>
        </div>
      </div>

      {/* 最后更新时间 */}
      <div className="text-sm text-gray-500 flex items-center">
        <Clock className="w-4 h-4 mr-1" />
        最后更新: {lastUpdated.toLocaleString()}
      </div>

      {/* 总体健康度 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            第三阶段总体健康度
          </CardTitle>
          <CardDescription>
            机器学习、动态定价和A/B测试的综合表现评估
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{phase3.overallHealth}%</span>
              <Badge className={getStatusColor(phase3.status)}>
                {phase3.status === 'excellent' ? '卓越表现' : 
                 phase3.status === 'good' ? '良好运行' : '需要优化'}
              </Badge>
            </div>
            <Progress value={phase3.overallHealth} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-blue-600">
                  {phase3.machineLearning.health}%
                </div>
                <div className="text-sm text-gray-600">机器学习</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-green-600">
                  {phase3.dynamicPricing.health}%
                </div>
                <div className="text-sm text-gray-600">动态定价</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-purple-600">
                  {phase3.abTesting.health}%
                </div>
                <div className="text-sm text-gray-600">A/B测试</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI优化效果概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            AI优化效果
          </CardTitle>
          <CardDescription>
            人工智能驱动的业务指标提升情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                +{phase3.aiOptimization.userEngagementIncrease}%
              </div>
              <div className="text-sm text-gray-600">用户参与度提升</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                +{phase3.aiOptimization.conversionRateImprovement}%
              </div>
              <div className="text-sm text-gray-600">转化率改善</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                +{phase3.aiOptimization.averageOrderValueIncrease}%
              </div>
              <div className="text-sm text-gray-600">客单价提升</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {phase3.aiOptimization.personalizedRecommendationAccuracy}%
              </div>
              <div className="text-sm text-gray-600">推荐准确率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                -{phase3.aiOptimization.pricingOptimizationSavings}%
              </div>
              <div className="text-sm text-gray-600">定价成本节省</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {phase3.aiOptimization.experimentalInsightsGenerated}
              </div>
              <div className="text-sm text-gray-600">实验洞察生成</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 详细分析标签页 */}
      <Tabs defaultValue="ml" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ml" className="flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            机器学习
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            动态定价
          </TabsTrigger>
          <TabsTrigger value="abtesting" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            A/B测试
          </TabsTrigger>
        </TabsList>

        {/* 机器学习标签页 */}
        <TabsContent value="ml" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2" />
                  预测模型状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>模型准确率</span>
                  <span className="font-semibold">{phase3.machineLearning.modelAccuracy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>活跃用户数</span>
                  <span className="font-semibold">{phase3.machineLearning.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>缓存预测数</span>
                  <span className="font-semibold">{phase3.machineLearning.cachedPredictions}</span>
                </div>
                <div className="mt-4">
                  <Badge className={getStatusColor(phase3.machineLearning.status)}>
                    {getStatusIcon(phase3.machineLearning.status)}
                    <span className="ml-1">
                      {phase3.machineLearning.status === 'excellent' ? '卓越' : 
                       phase3.machineLearning.status === 'good' ? '良好' : '需要改进'}
                    </span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  预测性能指标
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>预测准确度</span>
                    <span>{Math.round(phase3.metrics.predictiveAccuracy * 100)}%</span>
                  </div>
                  <Progress value={phase3.metrics.predictiveAccuracy * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>用户个性化覆盖</span>
                    <span>{Math.round(phase3.metrics.userPersonalization * 100)}%</span>
                  </div>
                  <Progress value={phase3.metrics.userPersonalization * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>收入优化</span>
                    <span>{Math.round(phase3.metrics.revenueOptimization * 100)}%</span>
                  </div>
                  <Progress value={phase3.metrics.revenueOptimization * 100} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 动态定价标签页 */}
        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  定价规则状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>活跃规则数</span>
                  <span className="font-semibold">{phase3.dynamicPricing.activeRules}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>市场数据项</span>
                  <span className="font-semibold">{phase3.dynamicPricing.marketItems}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>平均折扣</span>
                  <span className="font-semibold">{phase3.dynamicPricing.averageDiscount}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>总定价请求</span>
                  <span className="font-semibold">{phase3.dynamicPricing.totalRequests}</span>
                </div>
                <div className="mt-4">
                  <Badge className={getStatusColor(phase3.dynamicPricing.status)}>
                    {getStatusIcon(phase3.dynamicPricing.status)}
                    <span className="ml-1">
                      {phase3.dynamicPricing.status === 'excellent' ? '卓越' : 
                       phase3.dynamicPricing.status === 'good' ? '良好' : '需要改进'}
                    </span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  定价优化效果
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>定价优化率</span>
                    <span>{Math.round(phase3.metrics.pricingOptimization * 100)}%</span>
                  </div>
                  <Progress value={phase3.metrics.pricingOptimization * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>收入优化</span>
                    <span>+{Math.round(phase3.metrics.revenueOptimization * 100)}%</span>
                  </div>
                  <Progress value={phase3.metrics.revenueOptimization * 100} />
                </div>
                <div className="text-sm text-gray-600 mt-4">
                  通过智能定价策略，平均为用户节省了 {phase3.dynamicPricing.averageDiscount}% 的成本，
                  同时提升了 {Math.round(phase3.metrics.revenueOptimization * 100)}% 的收入效率。
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* A/B测试标签页 */}
        <TabsContent value="abtesting" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  实验运行状态
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>活跃实验数</span>
                  <span className="font-semibold">{phase3.abTesting.activeExperiments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>总实验数</span>
                  <span className="font-semibold">{phase3.abTesting.totalExperiments}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>参与用户数</span>
                  <span className="font-semibold">{phase3.abTesting.totalParticipants}</span>
                </div>
                <div className="mt-4">
                  <Badge className={getStatusColor(phase3.abTesting.status)}>
                    {getStatusIcon(phase3.abTesting.status)}
                    <span className="ml-1">
                      {phase3.abTesting.status === 'excellent' ? '卓越' : 
                       phase3.abTesting.status === 'good' ? '良好' : '需要改进'}
                    </span>
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  实验成功指标
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>实验成功率</span>
                    <span>{Math.round(phase3.metrics.experimentSuccess * 100)}%</span>
                  </div>
                  <Progress value={phase3.metrics.experimentSuccess * 100} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>转化率改善</span>
                    <span>+{Math.round(phase3.metrics.conversionImprovement * 100)}%</span>
                  </div>
                  <Progress value={phase3.metrics.conversionImprovement * 100} />
                </div>
                <div className="text-sm text-gray-600 mt-4">
                  当前运行 {phase3.abTesting.activeExperiments} 个活跃实验，
                  已有 {phase3.abTesting.totalParticipants} 名用户参与测试。
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 智能推荐 */}
      {phase3.recommendations && phase3.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              智能推荐
            </CardTitle>
            <CardDescription>
              基于系统分析的优化建议
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {phase3.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 