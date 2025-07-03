"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, Database, Cloud, Cpu } from 'lucide-react';

interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: string;
}

interface HealthSummary {
  overall: 'healthy' | 'warning' | 'error';
  total: number;
  healthy: number;
  warning: number;
  error: number;
  timestamp: string;
  recommendations: string[];
}

interface HealthData {
  summary: HealthSummary;
  results: HealthCheckResult[];
}

export default function SystemHealthDashboard() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchHealthData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/system-health');
      if (response.ok) {
        const data: HealthData = await response.json();
        setHealthData(data);
        setLastChecked(new Date());
      } else {
        console.error('健康检查API调用失败:', response.status);
      }
    } catch (error) {
      console.error('健康检查请求异常:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    // 每30秒自动刷新一次
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive'
    } as const;
    
    const labels = {
      healthy: '正常',
      warning: '警告',
      error: '错误'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getCategoryIcon = (component: string) => {
    if (component.includes('数据库')) return <Database className="h-4 w-4" />;
    if (component.includes('API') || component.includes('服务')) return <Cloud className="h-4 w-4" />;
    if (component.includes('系统资源')) return <Cpu className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  if (!healthData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            系统健康状态
          </CardTitle>
          <CardDescription>正在加载系统健康检查数据...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { summary, results } = healthData;

  // 按类别分组
  const groupedResults = results.reduce((acc, result) => {
    let category = '其他';
    if (result.component.includes('数据库')) category = '数据库';
    else if (result.component.includes('API') || result.component.includes('服务')) category = '外部服务';
    else if (result.component.includes('环境变量')) category = '配置';
    else if (result.component.includes('认证')) category = '认证';
    else if (result.component.includes('系统资源')) category = '系统资源';

    if (!acc[category]) acc[category] = [];
    acc[category].push(result);
    return acc;
  }, {} as Record<string, HealthCheckResult[]>);

  return (
    <div className="space-y-6">
      {/* 总览卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(summary.overall)}
            系统健康状态总览
            <Button
              onClick={fetchHealthData}
              disabled={isLoading}
              size="sm"
              variant="outline"
              className="ml-auto"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </CardTitle>
          <CardDescription>
            最后检查时间: {lastChecked?.toLocaleString('zh-CN') || '未知'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.healthy}</div>
              <div className="text-sm text-muted-foreground">正常</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
              <div className="text-sm text-muted-foreground">警告</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.error}</div>
              <div className="text-sm text-muted-foreground">错误</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.total}</div>
              <div className="text-sm text-muted-foreground">总计</div>
            </div>
          </div>

          {/* 建议 */}
          {summary.recommendations.length > 0 && (
            <Alert className={summary.overall === 'error' ? 'border-red-200' : summary.overall === 'warning' ? 'border-yellow-200' : 'border-green-200'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>系统建议</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1 mt-2">
                  {summary.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 详细检查结果 */}
      <Card>
        <CardHeader>
          <CardTitle>详细检查结果</CardTitle>
          <CardDescription>按组件类别分类的详细健康检查结果</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(groupedResults)[0]} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
              {Object.keys(groupedResults).map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(groupedResults).map(([category, categoryResults]) => (
              <TabsContent key={category} value={category}>
                <div className="space-y-3">
                  {categoryResults.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(result.component)}
                            <h4 className="font-semibold">{result.component}</h4>
                          </div>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                        <div className="text-xs text-muted-foreground">
                          检查时间: {new Date(result.timestamp).toLocaleString('zh-CN')}
                        </div>
                        
                        {result.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                              查看详细信息
                            </summary>
                            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                              {typeof result.details === 'string' 
                                ? result.details 
                                : JSON.stringify(result.details, null, 2)
                              }
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 