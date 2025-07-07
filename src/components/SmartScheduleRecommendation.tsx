'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Moon,
  Sun,
  Sunset,
  Star
} from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

interface TimeSlot {
  time: string;
  period: 'morning' | 'afternoon' | 'evening' | 'night';
  energyLevel: number;
  suitability: number;
  activities: ActivityRecommendation[];
}

interface ActivityRecommendation {
  name: string;
  type: 'work' | 'creative' | 'social' | 'rest' | 'exercise' | 'learning' | 'routine' | 'reflection' | 'relaxation';
  priority: 'high' | 'medium' | 'low';
  duration: number; // 分钟
  energyRequired: number; // 1-5
  description: string;
  benefits: string[];
}

interface ExtendedProfile extends UserProfileDataOutput {
  energyPattern?: string;
}

interface SmartScheduleRecommendationProps {
  profile?: ExtendedProfile;
  currentEnergy?: number;
  className?: string;
}

const SmartScheduleRecommendation: React.FC<SmartScheduleRecommendationProps> = ({
  profile,
  currentEnergy = 3,
  className
}) => {
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'today' | 'week'>('today');

  // 客户端挂载检查
  useEffect(() => {
    setMounted(true);
  }, []);

  // 使用 useState 替代 useMemo 来避免水合错误
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // 在客户端挂载后生成时间段推荐
  useEffect(() => {
    if (!mounted) return;

    const generateTimeSlots = (): TimeSlot[] => {
      return [
        {
          time: '06:00-09:00',
          period: 'morning',
          energyLevel: 4,
          suitability: 85,
          activities: [
            {
              name: '深度工作',
              type: 'work',
              priority: 'high',
              duration: 120,
              energyRequired: 4,
              description: '处理最重要和复杂的任务',
              benefits: ['高效完成重要工作', '利用最佳精神状态']
            },
            {
              name: '创意工作',
              type: 'creative',
              priority: 'medium',
              duration: 90,
              energyRequired: 4,
              description: '进行需要创造力的项目',
              benefits: ['激发创新思维', '产出高质量作品']
            }
          ]
        },
        {
          time: '09:00-12:00',
          period: 'morning',
          energyLevel: 4.5,
          suitability: 90,
          activities: [
            {
              name: '重要会议',
              type: 'work',
              priority: 'high',
              duration: 60,
              energyRequired: 3,
              description: '参与重要的工作会议',
              benefits: ['推进项目进展', '团队协作']
            },
            {
              name: '学习新技能',
              type: 'learning',
              priority: 'medium',
              duration: 45,
              energyRequired: 3,
              description: '学习新知识或技能',
              benefits: ['扩展知识面', '提升个人能力']
            }
          ]
        },
        {
          time: '12:00-14:00',
          period: 'afternoon',
          energyLevel: 3.5,
          suitability: 70,
          activities: [
            {
              name: '午餐休息',
              type: 'rest',
              priority: 'high',
              duration: 60,
              energyRequired: 1,
              description: '享用午餐并适当休息',
              benefits: ['恢复体力', '放松心情']
            },
            {
              name: '轻松阅读',
              type: 'learning',
              priority: 'low',
              duration: 30,
              energyRequired: 2,
              description: '阅读轻松的内容',
              benefits: ['放松大脑', '获取信息']
            }
          ]
        },
        {
          time: '14:00-17:00',
          period: 'afternoon',
          energyLevel: 4,
          suitability: 80,
          activities: [
            {
              name: '日常事务',
              type: 'routine',
              priority: 'medium',
              duration: 90,
              energyRequired: 2,
              description: '处理邮件和日常任务',
              benefits: ['保持工作流程', '清理待办事项']
            },
            {
              name: '团队协作',
              type: 'social',
              priority: 'medium',
              duration: 60,
              energyRequired: 3,
              description: '与团队成员协作',
              benefits: ['促进团队合作', '分享想法']
            }
          ]
        }
      ];
    };

    setTimeSlots(generateTimeSlots());
  }, [mounted, profile?.mbtiLikeType, profile?.energyPattern]);

  const getPeriodIcon = (period: string) => {
    switch (period) {
      case 'morning': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'afternoon': return <Sunset className="h-4 w-4 text-orange-500" />;
      case 'evening': return <Moon className="h-4 w-4 text-blue-500" />;
      default: return <Star className="h-4 w-4 text-purple-500" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'work': return 'bg-blue-100 text-blue-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'social': return 'bg-green-100 text-green-800';
      case 'rest': return 'bg-gray-100 text-gray-800';
      case 'exercise': return 'bg-red-100 text-red-800';
      case 'learning': return 'bg-yellow-100 text-yellow-800';
      case 'routine': return 'bg-indigo-100 text-indigo-800';
      case 'reflection': return 'bg-pink-100 text-pink-800';
      case 'relaxation': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // 在客户端挂载前不渲染
  if (!mounted) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" />
            智能日程推荐
          </span>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('today')}
            >
              今日
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              本周
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">推荐日程</TabsTrigger>
            <TabsTrigger value="optimization">优化建议</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            {timeSlots.map((slot, index) => (
              <Card key={index} className="border-l-4 border-l-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getPeriodIcon(slot.period)}
                      <span className="font-medium">{slot.time}</span>
                      <Badge variant="outline">
                        能量 {slot.energyLevel}/5
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">适宜度:</span>
                      <Progress value={slot.suitability} className="w-16" />
                      <span className="text-sm">{slot.suitability}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {slot.activities.map((activity, actIndex) => (
                      <div
                        key={actIndex}
                        className={`p-3 rounded-lg border ${getPriorityColor(activity.priority)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{activity.name}</span>
                              <Badge className={getActivityTypeColor(activity.type)}>
                                {activity.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {activity.duration}分钟
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {activity.benefits.map((benefit, bIndex) => (
                                <span key={bIndex} className="text-xs bg-white/50 px-2 py-1 rounded">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xs text-muted-foreground">需要能量</div>
                            <div className="font-medium">{activity.energyRequired}/5</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SmartScheduleRecommendation;