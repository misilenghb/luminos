'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, Target, Zap, AlertTriangle } from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

interface EnergyData {
  date: string;
  energyLevel: number;
  mood?: string;
  activities?: string[];
  sleepHours?: number;
  stressLevel?: number;
  productivity?: number;
  notes?: string;
}

interface EnergyPattern {
  type: 'morning_peak' | 'afternoon_peak' | 'evening_peak' | 'consistent' | 'irregular';
  confidence: number;
  description: string;
}

interface EnergyInsight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  recommendation: string;
}

interface ExtendedProfile extends UserProfileDataOutput {
  energyPattern?: string;
}

interface SimpleEnergyChartProps {
  profile?: ExtendedProfile;
  className?: string;
}

// 生成增强的模拟数据
const generateEnhancedMockData = (profile?: ExtendedProfile): EnergyData[] => {
  const data: EnergyData[] = [];
  const today = new Date();

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();

    // 基于MBTI和时间模式生成更真实的数据
    let baseEnergy = 3;

    // 基于星期几调整
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      baseEnergy += profile?.mbtiLikeType?.includes('I') ? 0.5 : -0.2;
    }

    // 基于个人能量模式
    if (profile?.energyPattern === 'morning_peak') {
      baseEnergy += i < 7 ? 0.5 : -0.3;
    }

    // 添加一些变化
    const variation = (Math.sin(i * 0.5) + Math.cos(i * 0.3)) * 0.4;
    const finalEnergy = Math.max(1, Math.min(5, baseEnergy + variation));

    // 使用确定性的方式生成心情，避免随机性导致的水合错误
    const moodIndex = (i + dayOfWeek) % 7;
    const moods = ['平静', '愉悦', '充满活力', '专注', '放松', '疲惫', '兴奋'];

    data.push({
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      energyLevel: Math.round(finalEnergy * 10) / 10,
      mood: moods[moodIndex],
      activities: generateDeterministicActivities(i),
      sleepHours: 6 + ((i * 0.3) % 3),
      stressLevel: Math.floor(((i * 0.7) % 5)) + 1,
      productivity: Math.floor(((i * 0.9) % 5)) + 1,
      notes: i === 0 ? '今天感觉很好！' : undefined
    });
  }

  return data;
};

const generateDeterministicActivities = (dayIndex: number): string[] => {
  const activities = ['工作', '运动', '冥想', '阅读', '社交', '创作', '学习', '休息'];
  const count = (dayIndex % 3) + 1;
  const startIndex = dayIndex % activities.length;

  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(activities[(startIndex + i) % activities.length]);
  }

  return result;
};

const SimpleEnergyChart: React.FC<SimpleEnergyChartProps> = ({ profile, className }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [selectedDataPoint, setSelectedDataPoint] = useState<EnergyData | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const allData = useMemo(() => generateEnhancedMockData(profile), [profile]);
  const data = useMemo(() => {
    return viewMode === 'week' ? allData.slice(-7) : allData;
  }, [allData, viewMode]);

  const maxValue = 5;
  const minValue = 1;

  // 计算趋势和统计
  const currentEnergy = data[data.length - 1]?.energyLevel || 3;
  const previousEnergy = data[data.length - 2]?.energyLevel || 3;
  const trend = currentEnergy - previousEnergy;
  const averageEnergy = data.reduce((sum, item) => sum + item.energyLevel, 0) / data.length;
  const maxEnergy = Math.max(...data.map(d => d.energyLevel));
  const minEnergy = Math.min(...data.map(d => d.energyLevel));

  // 分析能量模式
  const energyPattern = useMemo((): EnergyPattern => {
    const variance = data.reduce((sum, d) => sum + Math.pow(d.energyLevel - averageEnergy, 2), 0) / data.length;

    if (variance < 0.3) {
      return { type: 'consistent', confidence: 85, description: '能量水平相对稳定' };
    } else {
      return { type: 'morning_peak', confidence: 78, description: '早晨能量最佳' };
    }
  }, [data, averageEnergy]);

  // 生成洞察
  const insights = useMemo((): EnergyInsight[] => {
    const results: EnergyInsight[] = [];

    if (trend > 0.5) {
      results.push({
        type: 'positive',
        title: '能量上升趋势',
        description: '你的能量水平正在改善',
        recommendation: '保持当前的生活方式和习惯'
      });
    } else if (trend < -0.5) {
      results.push({
        type: 'warning',
        title: '能量下降趋势',
        description: '最近能量水平有所下降',
        recommendation: '考虑调整作息或减少压力源'
      });
    }

    if (averageEnergy < 2.5) {
      results.push({
        type: 'warning',
        title: '整体能量偏低',
        description: '平均能量水平低于理想状态',
        recommendation: '增加休息时间，关注睡眠质量'
      });
    } else if (averageEnergy > 4) {
      results.push({
        type: 'positive',
        title: '能量状态优秀',
        description: '你的能量管理做得很好',
        recommendation: '继续保持良好的生活节奏'
      });
    }

    return results;
  }, [trend, averageEnergy]);

  // 防止水合错误，在客户端渲染完成前显示加载状态
  if (!isClient) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            能量分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">加载中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-primary" />
            能量分析
          </span>
          <div className="flex items-center space-x-2">
            <Badge variant={trend > 0 ? 'default' : trend < 0 ? 'destructive' : 'secondary'}>
              {trend > 0 ? (
                <><TrendingUp className="mr-1 h-3 w-3" />上升</>
              ) : trend < 0 ? (
                <><TrendingDown className="mr-1 h-3 w-3" />下降</>
              ) : (
                <>稳定</>
              )}
            </Badge>
            <div className="flex">
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                周视图
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="ml-1"
              >
                月视图
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart">图表</TabsTrigger>
            <TabsTrigger value="insights">洞察</TabsTrigger>
            <TabsTrigger value="details">详情</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <div className="space-y-2">
              {data.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-pointer ${
                    selectedDataPoint === item ? 'bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedDataPoint(selectedDataPoint === item ? null : item)}
                >
                  <div className="w-12 text-xs text-muted-foreground">
                    {item.date}
                  </div>
                  <div className="flex-1 relative">
                    <div className="h-8 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          item.energyLevel >= 4 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                          item.energyLevel >= 3 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                          item.energyLevel >= 2 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          'bg-gradient-to-r from-red-400 to-pink-500'
                        }`}
                        style={{
                          width: `${((item.energyLevel - minValue) / (maxValue - minValue)) * 100}%`
                        }}
                      />
                    </div>
                    <div className="absolute inset-y-0 right-2 flex items-center">
                      <span className="text-sm font-medium text-foreground">
                        {item.energyLevel}/5
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.mood && (
                      <Badge variant="outline" className="text-xs">
                        {item.mood}
                      </Badge>
                    )}
                    {item.stressLevel && item.stressLevel > 3 && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedDataPoint && (
              <Card className="bg-muted/30">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{selectedDataPoint.date} 详情</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">能量等级:</span>
                      <span className="ml-2 font-medium">{selectedDataPoint.energyLevel}/5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">心情:</span>
                      <span className="ml-2">{selectedDataPoint.mood}</span>
                    </div>
                    {selectedDataPoint.sleepHours && (
                      <div>
                        <span className="text-muted-foreground">睡眠:</span>
                        <span className="ml-2">{selectedDataPoint.sleepHours.toFixed(1)}小时</span>
                      </div>
                    )}
                    {selectedDataPoint.stressLevel && (
                      <div>
                        <span className="text-muted-foreground">压力:</span>
                        <span className="ml-2">{selectedDataPoint.stressLevel}/5</span>
                      </div>
                    )}
                    {selectedDataPoint.activities && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">活动:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {selectedDataPoint.activities.map((activity, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Target className="mr-2 h-4 w-4" />
                  能量模式分析
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">模式类型:</span>
                    <Badge variant="outline">{energyPattern.description}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">置信度:</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={energyPattern.confidence} className="w-20" />
                      <span className="text-sm">{energyPattern.confidence}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {insights.map((insight, index) => (
                <Card key={index} className={`border-l-4 ${
                  insight.type === 'positive' ? 'border-l-green-500 bg-green-50/50' :
                  insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50/50' :
                  'border-l-blue-500 bg-blue-50/50'
                }`}>
                  <CardContent className="p-4">
                    <h5 className="font-medium text-sm mb-1">{insight.title}</h5>
                    <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                    <div className="flex items-center text-xs text-primary">
                      <Zap className="mr-1 h-3 w-3" />
                      {insight.recommendation}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{currentEnergy}/5</div>
                  <div className="text-xs text-muted-foreground">当前能量</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{averageEnergy.toFixed(1)}/5</div>
                  <div className="text-xs text-muted-foreground">平均能量</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{maxEnergy}/5</div>
                  <div className="text-xs text-muted-foreground">最高能量</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{minEnergy}/5</div>
                  <div className="text-xs text-muted-foreground">最低能量</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SimpleEnergyChart;