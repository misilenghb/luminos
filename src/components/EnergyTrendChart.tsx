'use client';

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { format, addDays, startOfToday, isSameDay, getDay, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, Sparkles, Activity, Moon, Sun, Zap, Target, Heart, Eye, Crown, Mountain, Droplets, Flame, Wind } from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

// 简单动态导入所有需要的图表组件
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

// 图表加载占位符组件
const ChartLoading = () => (
  <div className="h-64 flex items-center justify-center">
    <p className="text-muted-foreground">加载图表中...</p>
  </div>
);

// 脉轮图标映射
const chakraIcons = {
  root: Mountain,
  sacral: Droplets,
  solarPlexus: Sun,
  heart: Heart,
  throat: Sparkles,
  thirdEye: Eye,
  crown: Crown
};

// 脉轮颜色映射
const chakraColors = {
  root: '#dc2626',
  sacral: '#ea580c',
  solarPlexus: '#eab308',
  heart: '#16a34a',
  throat: '#2563eb',
  thirdEye: '#7c3aed',
  crown: '#9333ea'
};

// 能量等级颜色
const energyLevelColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

// 生成能量数据的函数
const generateEnergyData = (profile?: UserProfileDataOutput | null, days: number = 30) => {
  const today = startOfToday();
  const data = [];
  
  for (let i = -days + 1; i <= 7; i++) {
    const date = addDays(today, i);
    const dayOfWeek = getDay(date);
    const dayOfMonth = date.getDate();
    
    // 安全地获取 MBTI 类型
    let mbtiType: string | undefined;
    try {
      if (profile && profile.mbtiLikeType) {
        const match = profile.mbtiLikeType.match(/\b([IE][NS][TF][JP])\b/);
        if (match && match[0]) {
          mbtiType = match[0];
        }
      }
    } catch (e) {
      console.error("Error extracting MBTI type:", e);
    }
    
    const isIntrovert = mbtiType?.startsWith('I');
    
    // 基础能量计算
    let baseEnergy = 3;
    
    // 根据性格类型调整周期性能量
    if (isIntrovert) {
      baseEnergy += dayOfWeek === 0 || dayOfWeek === 6 ? 1 : -0.5; // 内向者周末能量高
    } else {
      baseEnergy += dayOfWeek >= 1 && dayOfWeek <= 5 ? 0.5 : -0.5; // 外向者工作日能量高
    }
    
    // 月度周期影响
    const monthProgress = dayOfMonth / 30;
    baseEnergy += Math.sin(monthProgress * Math.PI * 2) * 0.5;
    
    // 添加确定性波动 (基于日期，而不是随机数)
    // 使用日期的各个部分生成一个确定性的波动值
    const deterministicVariation = 
      Math.sin((dayOfMonth + dayOfWeek) * 0.5) * 0.4 + 
      Math.cos(dayOfMonth * 0.3) * 0.3;
    baseEnergy += deterministicVariation;
    
    // 限制在1-5范围内
    const energyLevel = Math.max(1, Math.min(5, Math.round(baseEnergy * 10) / 10));
    
    // 主导脉轮
    const chakras = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'];
    const dominantChakra = chakras[dayOfMonth % 7];
    
    // 推荐水晶
    const crystalMap: Record<string, string[]> = {
      root: ['红碧玉', '黑曜石', '赤铁矿'],
      sacral: ['橙色玛瑙', '太阳石', '红玉髓'],
      solarPlexus: ['黄水晶', '虎眼石', '琥珀'],
      heart: ['绿幽灵', '粉水晶', '东陵玉'],
      throat: ['蓝晶石', '青金石', '海蓝宝'],
      thirdEye: ['紫水晶', '萤石', '拉长石'],
      crown: ['白水晶', '月光石', '紫锂辉']
    };
    
    const recommendedCrystal = crystalMap[dominantChakra]?.[dayOfMonth % 3] || '白水晶';
    
    data.push({
      date: format(date, 'MM/dd', { locale: zhCN }),
      fullDate: date,
      energyLevel,
      dominantChakra,
      recommendedCrystal,
      isToday: isSameDay(date, today),
      isPast: date < today,
      isFuture: date > today,
      dayName: format(date, 'EEEE', { locale: zhCN })
    });
  }
  
  return data;
};

// 能量低谷预警分析
const analyzeEnergyTrends = (data: any[]) => {
  const futureData = data.filter(d => !d.isPast);
  const lowEnergyDays = futureData.filter(d => d.energyLevel < 2.5);
  
  // 连续低能量天数检测
  const consecutiveLowDays = [];
  let currentStreak = [];
  
  for (const day of futureData) {
    if (day.energyLevel < 2.5) {
      currentStreak.push(day);
    } else {
      if (currentStreak.length >= 2) {
        consecutiveLowDays.push([...currentStreak]);
      }
      currentStreak = [];
    }
  }
  
  if (currentStreak.length >= 2) {
    consecutiveLowDays.push(currentStreak);
  }
  
  return {
    lowEnergyDays,
    consecutiveLowDays,
    averageEnergy: futureData.reduce((sum, d) => sum + d.energyLevel, 0) / futureData.length,
    energyTrend: futureData.length > 1 ? 
      (futureData[futureData.length - 1].energyLevel - futureData[0].energyLevel) / futureData.length : 0
  };
};

// 脉轮分布分析
const analyzeChakraDistribution = (data: any[]) => {
  const chakraCounts = data.reduce((acc, day) => {
    acc[day.dominantChakra] = (acc[day.dominantChakra] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(chakraCounts).map(([chakra, count]) => ({
    chakra,
    count: count as number,
    percentage: ((count as number) / data.length * 100).toFixed(1),
    color: chakraColors[chakra as keyof typeof chakraColors]
  }));
};

interface EnergyTrendChartProps {
  profile?: UserProfileDataOutput | null;
  className?: string;
}

const EnergyTrendChart: React.FC<EnergyTrendChartProps> = ({ profile, className }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d'>('7d');
  const [isClient, setIsClient] = useState(false);
  
  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const data = useMemo(() => {
    return generateEnergyData(profile, selectedPeriod === '7d' ? 7 : 30);
  }, [profile, selectedPeriod, isClient]);
  
  const trendAnalysis = useMemo(() => analyzeEnergyTrends(data), [data]);
  const chakraDistribution = useMemo(() => analyzeChakraDistribution(data), [data]);
  
  const formatTooltip = (value: any, name: string) => {
    if (name === 'energyLevel') {
      return [`${value}/5`, '能量等级'];
    }
    return [value, name];
  };

  // 在客户端渲染之前显示加载状态
  if (!isClient) {
    return (
      <div className={cn("space-y-6", className)}>
        <ChartLoading />
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 趋势概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 平均能量 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">平均能量</p>
                <p className="text-2xl font-bold">{trendAnalysis.averageEnergy.toFixed(1)}/5</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
            <Progress 
              value={trendAnalysis.averageEnergy * 20} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        {/* 能量趋势 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">能量趋势</p>
                <p className="text-2xl font-bold flex items-center">
                  {trendAnalysis.energyTrend > 0 ? (
                    <>
                      <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                      上升
                    </>
                  ) : trendAnalysis.energyTrend < 0 ? (
                    <>
                      <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
                      下降
                    </>
                  ) : (
                    <>
                      <Target className="h-5 w-5 text-gray-500 mr-1" />
                      稳定
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 低能量预警 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">低能量天数</p>
                <p className="text-2xl font-bold text-orange-500">
                  {trendAnalysis.lowEnergyDays.length}天
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要图表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              能量趋势分析
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={selectedPeriod === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('7d')}
              >
                7天
              </Button>
              <Button
                variant={selectedPeriod === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod('30d')}
              >
                30天
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="line">趋势线</TabsTrigger>
              <TabsTrigger value="area">区域图</TabsTrigger>
              <TabsTrigger value="bar">柱状图</TabsTrigger>
            </TabsList>
            
            <TabsContent value="line" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[1, 5]}
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    formatter={formatTooltip}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energyLevel" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="area" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[1, 5]}
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Area 
                    type="monotone" 
                    dataKey="energyLevel" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="bar" className="mt-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[1, 5]}
                    fontSize={12}
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip formatter={formatTooltip} />
                  <Bar 
                    dataKey="energyLevel" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 脉轮分布分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5" />
              脉轮能量分布
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chakraDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="count"
                >
                  {chakraDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {chakraDistribution.map((item) => {
                const Icon = chakraIcons[item.chakra as keyof typeof chakraIcons];
                return (
                  <div key={item.chakra} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" style={{ color: item.color }} />
                      <span className="text-sm">
                        {item.chakra === 'heart' ? '心轮' : 
                         item.chakra === 'throat' ? '喉轮' : 
                         item.chakra === 'crown' ? '顶轮' : 
                         item.chakra === 'root' ? '根轮' : 
                         item.chakra === 'sacral' ? '脐轮' : 
                         item.chakra === 'solarPlexus' ? '太阳神经丛' : 
                         item.chakra === 'thirdEye' ? '眉心轮' : '脉轮'}
                      </span>
                    </div>
                    <Badge variant="outline">{item.percentage}%</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 能量预警和建议 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              能量预警与建议
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendAnalysis.consecutiveLowDays.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  检测到连续低能量期：
                  {trendAnalysis.consecutiveLowDays.map((streak, i) => (
                    <span key={i} className="block mt-1">
                      {format(streak[0].fullDate, 'MM/dd')} - {format(streak[streak.length - 1].fullDate, 'MM/dd')}
                      （{streak.length}天）
                    </span>
                  ))}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <h4 className="font-medium">个性化建议：</h4>
              
              {trendAnalysis.averageEnergy < 3 && (
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    🔄 您的整体能量偏低，建议：
                  </p>
                  <ul className="text-xs text-orange-700 dark:text-orange-300 mt-1 space-y-1">
                    <li>• 增加户外阳光照射时间</li>
                    <li>• 使用红色系水晶（如红碧玉）激活根轮</li>
                    <li>• 保证充足睡眠，规律作息</li>
                  </ul>
                </div>
              )}
              
              {trendAnalysis.energyTrend > 0.1 && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    ✨ 能量呈上升趋势！继续保持：
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-300 mt-1 space-y-1">
                    <li>• 继续现有的积极习惯</li>
                    <li>• 可适当增加挑战性活动</li>
                    <li>• 分享正能量给他人</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnergyTrendChart; 