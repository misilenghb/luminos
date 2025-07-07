'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Sparkles, 
  ChevronRight,
  Info,
  Star,
  Zap
} from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import useAdaptiveInterface from '@/hooks/useAdaptiveInterface';

interface ContentAggregatorProps {
  profile?: UserProfileDataOutput;
  currentPage: 'dashboard' | 'exploration' | 'calendar';
  className?: string;
}

interface ContentItem {
  id: string;
  type: 'insight' | 'recommendation' | 'action' | 'tip';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  actionLabel?: string;
  actionUrl?: string;
  icon: React.ReactNode;
}

const ContentAggregator: React.FC<ContentAggregatorProps> = ({
  profile,
  currentPage,
  className = ''
}) => {
  const [isClient, setIsClient] = useState(false);
  const adaptiveState = useAdaptiveInterface(profile);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 生成个性化内容
  const personalizedContent = useMemo((): ContentItem[] => {
    if (!isClient) return []; // 避免水合错误

    const content: ContentItem[] = [];

    // 基于用户等级生成内容
    if (adaptiveState.userLevel === 'beginner') {
      content.push({
        id: 'welcome',
        type: 'tip',
        title: '欢迎开始您的能量探索之旅',
        description: '建议先完成个性化评估，了解您的能量特质',
        priority: 'high',
        category: '入门指导',
        actionLabel: '开始评估',
        actionUrl: '/energy-exploration',
        icon: <Star className="h-4 w-4" />
      });

      if (adaptiveState.shouldShowOnboarding) {
        content.push({
          id: 'onboarding',
          type: 'tip',
          title: '界面导航提示',
          description: '点击左侧菜单可以切换不同功能页面',
          priority: 'medium',
          category: '使用技巧',
          icon: <Info className="h-4 w-4" />
        });
      }
    }

    // 基于档案状态生成内容
    if (profile) {
      if (profile.mbtiLikeType && profile.inferredZodiac) {
        content.push({
          id: 'profile_complete',
          type: 'insight',
          title: `您的能量类型：${profile.mbtiLikeType}`,
          description: `作为${profile.inferredZodiac}座的${profile.mbtiLikeType}类型，您具有独特的能量特质`,
          priority: 'high',
          category: '个性洞察',
          icon: <Lightbulb className="h-4 w-4" />
        });
      }

      if (profile.coreEnergyInsights) {
        content.push({
          id: 'energy_insight',
          type: 'insight',
          title: '核心能量洞察',
          description: profile.coreEnergyInsights.slice(0, 100) + '...',
          priority: 'medium',
          category: '能量分析',
          actionLabel: '查看详情',
          actionUrl: '/energy-exploration',
          icon: <Zap className="h-4 w-4" />
        });
      }
    }

    // 基于当前页面生成内容
    switch (currentPage) {
      case 'dashboard':
        content.push({
          id: 'daily_focus',
          type: 'recommendation',
          title: '今日能量焦点',
          description: '建议进行15分钟的水晶冥想来平衡能量',
          priority: 'high',
          category: '日常建议',
          actionLabel: '开始冥想',
          actionUrl: '/daily-focus',
          icon: <Target className="h-4 w-4" />
        });
        break;

      case 'exploration':
        if (adaptiveState.userLevel !== 'beginner') {
          content.push({
            id: 'advanced_analysis',
            type: 'action',
            title: '深度能量分析',
            description: '尝试八维能量评估获得更全面的个性洞察',
            priority: 'medium',
            category: '功能推荐',
            actionLabel: '开始评估',
            icon: <TrendingUp className="h-4 w-4" />
          });
        }
        break;

      case 'calendar':
        content.push({
          id: 'meditation_streak',
          type: 'recommendation',
          title: '冥想连续记录',
          description: '您已连续冥想3天，继续保持这个好习惯！',
          priority: 'medium',
          category: '习惯追踪',
          icon: <Sparkles className="h-4 w-4" />
        });
        break;
    }

    // 基于推荐操作生成内容
    adaptiveState.recommendedActions.forEach((action, index) => {
      content.push({
        id: `recommended_${index}`,
        type: 'action',
        title: action,
        description: '根据您的使用情况为您推荐',
        priority: 'medium',
        category: '个性化推荐',
        icon: <ChevronRight className="h-4 w-4" />
      });
    });

    // 根据优先级和用户偏好排序
    return content
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, adaptiveState.preferences.contentDensity === 'high' ? 6 :
                adaptiveState.preferences.contentDensity === 'medium' ? 4 : 3);
  }, [isClient, profile, currentPage, adaptiveState]);

  // 渲染内容项
  const renderContentItem = (item: ContentItem) => {
    const priorityColors = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-blue-500 bg-blue-50',
      low: 'border-l-gray-500 bg-gray-50'
    };

    return (
      <div
        key={item.id}
        className={`border-l-4 rounded-lg p-4 ${priorityColors[item.priority]} transition-all hover:shadow-md`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="mt-1">{item.icon}</div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-sm">{item.title}</h4>
                <Badge variant="outline" className="text-xs">
                  {item.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {item.description}
              </p>
              {item.actionLabel && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs"
                  onClick={() => {
                    adaptiveState.trackFeatureUsage(`content_action_${item.id}`);
                    if (item.actionUrl) {
                      window.location.href = item.actionUrl;
                    }
                  }}
                >
                  {item.actionLabel}
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 在客户端渲染之前显示加载状态
  if (!isClient) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 根据用户偏好决定是否显示
  if (adaptiveState.preferences.contentDensity === 'low' && personalizedContent.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg">
          <Lightbulb className="mr-2 h-5 w-5" />
          个性化推荐
          {adaptiveState.userLevel === 'beginner' && (
            <Badge variant="secondary" className="ml-2 text-xs">
              新手指导
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {personalizedContent.length > 0 ? (
          <div className="space-y-3">
            {personalizedContent.map(renderContentItem)}
          </div>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              暂无个性化推荐。完成更多评估后，我们将为您提供更精准的建议。
            </AlertDescription>
          </Alert>
        )}

        {/* 用户等级指示器 */}
        {adaptiveState.preferences.showAdvancedFeatures && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                当前等级: {adaptiveState.userLevel === 'beginner' ? '新手' : 
                          adaptiveState.userLevel === 'intermediate' ? '进阶' : '专家'}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => adaptiveState.trackFeatureUsage('view_progress')}
              >
                查看进度
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContentAggregator;
