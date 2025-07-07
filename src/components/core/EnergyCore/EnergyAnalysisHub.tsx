'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { EnergyDisplayProps, EnergyData, EnergyMetrics } from './types';

// 生成确定性的能量数据（避免水合错误）
const generateEnergyData = (profile?: any, days: number = 7): EnergyData[] => {
  const data: EnergyData[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // 使用确定性算法生成数据
    const dayIndex = date.getDate();
    const baseEnergy = 3 + (Math.sin(dayIndex * 0.5) + Math.cos(dayIndex * 0.3)) * 0.8;
    const finalEnergy = Math.max(1, Math.min(5, baseEnergy));
    
    const moods = ['平静', '愉悦', '充满活力', '专注', '放松', '疲惫', '兴奋'];
    const moodIndex = (dayIndex + date.getDay()) % moods.length;
    
    data.push({
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      energyLevel: Math.round(finalEnergy * 10) / 10,
      mood: moods[moodIndex],
      activities: ['工作', '运动', '冥想'].slice(0, (dayIndex % 3) + 1),
      sleepHours: 6 + ((dayIndex * 0.3) % 3),
      stressLevel: Math.floor(((dayIndex * 0.7) % 5)) + 1,
      productivity: Math.floor(((dayIndex * 0.9) % 5)) + 1
    });
  }

  return data;
};

const EnergyAnalysisHub: React.FC<EnergyDisplayProps> = ({
  profile,
  mode,
  layout = 'card',
  compactMode = false,
  showAdvanced = false,
  className = ''
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  // 根据模式生成不同的数据
  const energyData = useMemo(() => {
    if (!isClient) return []; // 避免水合错误

    switch (mode) {
      case 'dashboard':
        return generateEnergyData(profile, 3); // 仪表板只显示3天
      case 'exploration':
        return generateEnergyData(profile, 14); // 探索页显示2周
      case 'calendar':
        return generateEnergyData(profile, 30); // 日历页显示1月
      default:
        return generateEnergyData(profile, 7);
    }
  }, [isClient, profile, mode]);

  // 计算能量指标
  const metrics = useMemo((): EnergyMetrics => {
    const current = energyData[energyData.length - 1]?.energyLevel || 3;
    const average = energyData.reduce((sum, item) => sum + item.energyLevel, 0) / energyData.length;
    
    // 计算趋势
    const recent = energyData.slice(-3);
    const older = energyData.slice(-6, -3);
    const recentAvg = recent.reduce((sum, item) => sum + item.energyLevel, 0) / recent.length;
    const olderAvg = older.reduce((sum, item) => sum + item.energyLevel, 0) / older.length;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > olderAvg + 0.2) trend = 'up';
    else if (recentAvg < olderAvg - 0.2) trend = 'down';
    
    return {
      current,
      average: Math.round(average * 10) / 10,
      trend
    };
  }, [energyData]);

  // 根据模式渲染不同的视图
  const renderDashboardView = () => (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Activity className="mr-2 h-5 w-5" />
          能量状态
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{metrics.current}/5</span>
            <div className="flex items-center space-x-1">
              {metrics.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
              {metrics.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
              {metrics.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
              <Badge variant={metrics.current >= 4 ? 'default' : metrics.current >= 3 ? 'secondary' : 'destructive'}>
                {metrics.current >= 4 ? '充沛' : metrics.current >= 3 ? '良好' : '需要休息'}
              </Badge>
            </div>
          </div>
          <Progress value={metrics.current * 20} className="h-2" />
          <div className="text-sm text-muted-foreground">
            平均能量: {metrics.average}/5
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderExplorationView = () => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          详细能量分析
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 能量趋势图 */}
          <div className="space-y-2">
            <h4 className="font-medium">能量趋势 (过去{energyData.length}天)</h4>
            {energyData.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
                <div className="w-12 text-xs text-muted-foreground">{item.date}</div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        item.energyLevel >= 4 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                        item.energyLevel >= 3 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' :
                        'bg-gradient-to-r from-orange-400 to-red-500'
                      }`}
                      style={{ width: `${item.energyLevel * 20}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {item.mood}
                  </Badge>
                  <span className="text-sm font-medium">{item.energyLevel}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.current}</div>
              <div className="text-xs text-muted-foreground">当前能量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{metrics.average}</div>
              <div className="text-xs text-muted-foreground">平均能量</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {metrics.trend === 'up' ? '↗' : metrics.trend === 'down' ? '↘' : '→'}
              </div>
              <div className="text-xs text-muted-foreground">趋势</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCalendarView = () => (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">月度能量概览</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-xs">
          {energyData.slice(-7).map((item, index) => (
            <div key={index} className="text-center p-1">
              <div className="text-muted-foreground">{item.date}</div>
              <div 
                className={`w-6 h-6 mx-auto mt-1 rounded-full flex items-center justify-center text-white text-xs ${
                  item.energyLevel >= 4 ? 'bg-green-500' :
                  item.energyLevel >= 3 ? 'bg-blue-500' :
                  'bg-orange-500'
                }`}
              >
                {item.energyLevel.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // 在客户端渲染之前不显示任何内容，避免水合错误
  if (!isClient) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 根据模式选择渲染方式
  switch (mode) {
    case 'dashboard':
      return renderDashboardView();
    case 'exploration':
      return renderExplorationView();
    case 'calendar':
      return renderCalendarView();
    default:
      return renderDashboardView();
  }
};

export default EnergyAnalysisHub;
