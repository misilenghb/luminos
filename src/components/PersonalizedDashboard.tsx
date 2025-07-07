'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Brain, 
  Heart, 
  Sparkles, 
  TrendingUp, 
  Calendar,
  Gem,
  Sun,
  Moon,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
// 导入统一的核心组件
import { EnergyAnalysisHub } from '@/components/core/EnergyCore';
import { ProfileDisplayHub } from '@/components/core/ProfileCore';
// 暂时移除智能化组件以解决水合错误
// import ContentAggregator from '@/components/smart/ContentAggregator';
// import useAdaptiveInterface from '@/hooks/useAdaptiveInterface';

interface PersonalizedDashboardProps {
  profile?: UserProfileDataOutput;
  className?: string;
}

interface DashboardInsight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
}

interface EnergyPrediction {
  date: string;
  predictedLevel: number;
  confidence: number;
  factors: string[];
}

const PersonalizedDashboard: React.FC<PersonalizedDashboardProps> = ({
  profile,
  className
}) => {
  const [currentEnergy, setCurrentEnergy] = useState(3);
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [todayRecommendations, setTodayRecommendations] = useState<string[]>([]);
  const [energyPrediction, setEnergyPrediction] = useState<EnergyPrediction[]>([]);

  // 暂时移除自适应界面以解决水合错误
  // const adaptiveState = useAdaptiveInterface(profile);

  // 记录页面访问
  // React.useEffect(() => {
  //   adaptiveState.trackPageVisit('dashboard');
  // }, []);

  // 模拟当前时间的能量状态
  useEffect(() => {
    const hour = new Date().getHours();
    let baseEnergy = 3;
    
    // 根据时间调整基础能量
    if (hour >= 6 && hour <= 10) baseEnergy = 4; // 早晨
    else if (hour >= 11 && hour <= 14) baseEnergy = 4.5; // 上午
    else if (hour >= 15 && hour <= 17) baseEnergy = 3.5; // 下午
    else if (hour >= 18 && hour <= 21) baseEnergy = 3; // 傍晚
    else baseEnergy = 2; // 夜晚

    // 根据MBTI调整
    if (profile?.mbtiLikeType?.includes('E')) {
      baseEnergy += 0.5; // 外向者白天能量更高
    }
    
    setCurrentEnergy(Math.min(5, Math.max(1, baseEnergy)));
  }, [profile]);

  // 生成个性化洞察
  useEffect(() => {
    if (!profile) return;

    const newInsights: DashboardInsight[] = [];
    
    // 基于MBTI的洞察
    if (profile.mbtiLikeType?.includes('I')) {
      newInsights.push({
        type: 'neutral',
        title: '内向者能量管理',
        description: '作为内向者，你需要更多独处时间来恢复能量',
        action: '安排30分钟独处时间',
        icon: <Brain className="h-4 w-4" />
      });
    }

    // 基于当前能量的洞察
    if (currentEnergy >= 4) {
      newInsights.push({
        type: 'positive',
        title: '能量充沛',
        description: '现在是处理重要任务的最佳时机',
        action: '开始重要项目',
        icon: <Zap className="h-4 w-4" />
      });
    } else if (currentEnergy <= 2) {
      newInsights.push({
        type: 'warning',
        title: '能量较低',
        description: '建议进行恢复性活动，避免高强度任务',
        action: '休息或冥想',
        icon: <AlertTriangle className="h-4 w-4" />
      });
    }

    // 基于推断元素的洞察
    if (profile.inferredElement) {
      const elementInsights = {
        fire: '火元素：今天适合积极行动和创新',
        water: '水元素：今天适合情感交流和直觉工作',
        earth: '土元素：今天适合稳定的实际工作',
        air: '风元素：今天适合思考和沟通'
      };
      
      const insight = elementInsights[profile.inferredElement.toLowerCase() as keyof typeof elementInsights];
      if (insight) {
        newInsights.push({
          type: 'neutral',
          title: '元素能量指导',
          description: insight,
          icon: <Sparkles className="h-4 w-4" />
        });
      }
    }

    setInsights(newInsights);
  }, [profile, currentEnergy]);

  // 生成今日推荐
  useEffect(() => {
    const recommendations = [];
    
    if (currentEnergy >= 4) {
      recommendations.push('处理重要决策', '创意工作', '社交活动');
    } else if (currentEnergy >= 3) {
      recommendations.push('日常任务', '轻度运动', '学习新知识');
    } else {
      recommendations.push('冥想放松', '整理环境', '早点休息');
    }

    // 基于MBTI添加推荐
    if (profile?.mbtiLikeType?.includes('E')) {
      recommendations.push('团队协作');
    } else {
      recommendations.push('独立工作');
    }

    setTodayRecommendations(recommendations.slice(0, 4));
  }, [currentEnergy, profile]);

  // 生成能量预测
  useEffect(() => {
    const predictions: EnergyPrediction[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      
      let predictedLevel = currentEnergy;
      const factors = [];
      
      // 基于星期几调整预测
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 周末
        if (profile?.mbtiLikeType?.includes('I')) {
          predictedLevel += 0.5;
          factors.push('周末恢复');
        } else {
          predictedLevel += 0.2;
          factors.push('周末社交');
        }
      } else { // 工作日
        predictedLevel -= 0.3;
        factors.push('工作日压力');
      }
      
      predictions.push({
        date: futureDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        predictedLevel: Math.min(5, Math.max(1, predictedLevel)),
        confidence: 75 + ((i * 7) % 20), // 使用确定性计算替代随机数
        factors
      });
    }
    
    setEnergyPrediction(predictions);
  }, [currentEnergy, profile]);

  const getEnergyColor = (level: number) => {
    if (level >= 4) return 'text-green-600 bg-green-50';
    if (level >= 3) return 'text-blue-600 bg-blue-50';
    if (level >= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 使用统一的用户档案组件 - 横幅模式 */}
      <ProfileDisplayHub
        profile={profile}
        mode="banner"
        showElements={['mbti', 'zodiac', 'element']}
        className="mb-6"
      />

      {/* 使用统一的能量分析组件 - 仪表板模式 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EnergyAnalysisHub
          profile={profile}
          mode="dashboard"
          layout="card"
          compactMode={true}
        />

        <ProfileDisplayHub
          profile={profile}
          mode="card"
          showElements={['mbti', 'element']}
        />
      </div>

      {/* 今日洞察 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            今日洞察
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {insight.icon}
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.action && (
                      <Button variant="outline" size="sm" className="mt-2">
                        {insight.action}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 今日推荐 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            今日推荐活动
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {todayRecommendations.map((rec, index) => (
              <Badge key={index} variant="secondary" className="p-2 justify-center">
                {rec}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 智能内容聚合器 - 暂时移除以解决水合错误 */}
      {/* <ContentAggregator
        profile={profile}
        currentPage="dashboard"
        className="mb-6"
      /> */}

      {/* 今日快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-2 h-5 w-5" />
            快速操作
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-20 flex flex-col"
            >
              <Brain className="h-6 w-6 mb-2" />
              <span className="text-sm">深度分析</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">日程规划</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
            >
              <Sparkles className="h-6 w-6 mb-2" />
              <span className="text-sm">水晶冥想</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col"
            >
              <Target className="h-6 w-6 mb-2" />
              <span className="text-sm">目标追踪</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 简化的每日水晶推荐 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gem className="mr-2 h-5 w-5" />
            今日水晶
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
              <Gem className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">紫水晶</h4>
              <p className="text-sm text-muted-foreground">帮助提升专注力和内在平静</p>
            </div>
            <Button size="sm" variant="outline">
              了解更多
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 今日总结 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            今日总结
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">能量状态</span>
              <Badge variant={currentEnergy >= 4 ? 'default' : currentEnergy >= 3 ? 'secondary' : 'destructive'}>
                {currentEnergy >= 4 ? '充沛' : currentEnergy >= 3 ? '良好' : '需要休息'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">完成任务</span>
              <span className="font-medium">3/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">冥想时间</span>
              <span className="font-medium">15分钟</span>
            </div>
            <Button className="w-full mt-4" variant="outline">
              查看详细分析
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizedDashboard;
