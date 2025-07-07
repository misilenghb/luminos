'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles,
  Brain,
  Activity,
  Calendar,
  Gem,
  Zap,
  Heart,
  Target,
  Users,
  BookOpen,
  Bell
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  action?: {
    text: string;
    href: string;
  };
}

interface UserOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '欢迎来到水晶日历',
      description: '一个基于科学心理学和古老智慧的个性化能量管理平台',
      icon: <Sparkles className="h-8 w-8 text-purple-500" />,
      features: [
        '基于MBTI性格分析的个性化体验',
        '脉轮能量状态监测和平衡',
        'AI驱动的智能洞察和建议',
        '水晶能量指导和日程优化'
      ]
    },
    {
      id: 'calendar',
      title: '水晶能量日历',
      description: '你的专属能量管理中心，实时了解自己的状态',
      icon: <Activity className="h-8 w-8 text-blue-500" />,
      features: [
        '实时能量水平监控',
        '今日洞察和个性化建议',
        '能量趋势分析和预测',
        '基于你的性格类型的优化提示'
      ],
      action: {
        text: '查看水晶日历',
        href: '/daily-focus'
      }
    },
    {
      id: 'analysis',
      title: 'AI智能分析',
      description: '深度了解你的能量模式和个性特征',
      icon: <Brain className="h-8 w-8 text-green-500" />,
      features: [
        '能量模式识别和分析',
        '个性优势和挑战识别',
        '成长建议和发展方向',
        '风险预警和健康提醒'
      ]
    },
    {
      id: 'schedule',
      title: '智能日程推荐',
      description: '根据你的能量状态和性格特征优化日程安排',
      icon: <Calendar className="h-8 w-8 text-orange-500" />,
      features: [
        '最佳活动时间推荐',
        '基于MBTI的任务分配',
        '能量恢复时间安排',
        '工作与休息的平衡建议'
      ],
      action: {
        text: '开始规划',
        href: '/daily-focus'
      }
    },
    {
      id: 'crystals',
      title: '每日水晶指导',
      description: '基于你的能量状态推荐合适的水晶和使用方法',
      icon: <Gem className="h-8 w-8 text-pink-500" />,
      features: [
        '个性化水晶推荐',
        '详细使用指导',
        '脉轮对应关系',
        '能量平衡建议'
      ]
    },
    {
      id: 'features',
      title: '更多强大功能',
      description: '探索更多帮助你成长的功能',
      icon: <Target className="h-8 w-8 text-indigo-500" />,
      features: [
        '能量探索和深度分析',
        '创意工坊和设计工具',
        '个人成长追踪',
        'PWA离线支持'
      ]
    }
  ];

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      localStorage.setItem('onboarding-completed', 'true');
    }, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(() => {
      onSkip();
      localStorage.setItem('onboarding-skipped', 'true');
    }, 300);
  };

  const currentStepData = onboardingSteps[currentStep];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <Card className="border-2 border-primary/20 shadow-2xl">
          <CardHeader className="relative">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-xs">
                步骤 {currentStep + 1} / {onboardingSteps.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Progress value={progress} className="mb-6" />
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full">
                {currentStepData.icon}
              </div>
              <div>
                <CardTitle className="text-xl mb-2">{currentStepData.title}</CardTitle>
                <p className="text-muted-foreground">{currentStepData.description}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 功能特点 */}
            <div className="grid gap-3">
              {currentStepData.features.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg transition-all duration-200 hover:bg-muted/50"
                >
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* 行动按钮 */}
            {currentStepData.action && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium mb-1">立即体验</h4>
                    <p className="text-sm text-muted-foreground">点击下方按钮开始使用这个功能</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(currentStepData.action!.href, '_blank');
                    }}
                  >
                    {currentStepData.action.text}
                  </Button>
                </div>
              </div>
            )}

            {/* 导航按钮 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>上一步</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  跳过引导
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex items-center space-x-2"
                >
                  <span>
                    {currentStep === onboardingSteps.length - 1 ? '开始使用' : '下一步'}
                  </span>
                  {currentStep === onboardingSteps.length - 1 ? (
                    <Sparkles className="h-4 w-4" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 底部提示 */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            你可以随时在设置中重新查看这个引导
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserOnboarding;
