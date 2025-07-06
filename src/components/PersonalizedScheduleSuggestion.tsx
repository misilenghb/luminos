'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CalendarClock, Sparkles, RefreshCw, Clock, CheckCircle2, Calendar as CalendarIcon, BarChart3, User, Shield, Zap, Wind, Users } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface TimeBlock {
  id: string;
  time: string;
  activity: string;
  category: 'work' | 'rest' | 'personal' | 'energy' | 'social' | 'other';
  energyImpact: 'high' | 'medium' | 'low' | 'neutral' | 'restorative';
  completed: boolean;
}

interface DaySchedule {
  date: Date;
  energyForecast: {
    morning: number;
    afternoon: number;
    evening: number;
    overall: number;
  };
  blocks: TimeBlock[];
  notes: string;
}

interface PersonalizedScheduleSuggestionProps {
  profile?: UserProfileDataOutput;
  initialDate?: Date;
  className?: string;
}

const defaultEnergyForecast = {
  morning: 7,
  afternoon: 6,
  evening: 5,
  overall: 6
};

// 生成默认日程
const generateDefaultSchedule = (date: Date, profile?: UserProfileDataOutput): DaySchedule => {
  const isWeekend = [0, 6].includes(date.getDay());
  const defaultBlocks: TimeBlock[] = [];
  
  // 工作日日程
  if (!isWeekend) {
    defaultBlocks.push(
      {
        id: `${date.toISOString()}-1`,
        time: '07:00 - 07:30',
        activity: '晨间冥想与能量激活',
        category: 'energy',
        energyImpact: 'restorative',
        completed: false
  },
  {
        id: `${date.toISOString()}-2`,
        time: '07:30 - 08:30',
        activity: '早餐与准备',
        category: 'personal',
        energyImpact: 'neutral',
        completed: false
      },
      {
        id: `${date.toISOString()}-3`,
        time: '09:00 - 12:00',
        activity: '高专注度工作时段',
        category: 'work',
        energyImpact: 'high',
        completed: false
      },
      {
        id: `${date.toISOString()}-4`,
        time: '12:00 - 13:00',
        activity: '午餐与短暂休息',
        category: 'rest',
        energyImpact: 'restorative',
        completed: false
  },
  {
        id: `${date.toISOString()}-5`,
        time: '13:00 - 16:00',
        activity: '创意工作与会议',
    category: 'work',
        energyImpact: 'medium',
        completed: false
  },
  {
        id: `${date.toISOString()}-6`,
        time: '16:00 - 16:30',
        activity: '能量恢复休息',
        category: 'energy',
        energyImpact: 'restorative',
        completed: false
  },
  {
        id: `${date.toISOString()}-7`,
        time: '16:30 - 18:00',
        activity: '处理邮件与收尾工作',
        category: 'work',
        energyImpact: 'low',
        completed: false
  },
  {
        id: `${date.toISOString()}-8`,
        time: '18:30 - 19:30',
        activity: '晚餐与放松',
        category: 'personal',
        energyImpact: 'neutral',
        completed: false
  },
  {
        id: `${date.toISOString()}-9`,
        time: '20:00 - 21:30',
        activity: '个人时间/爱好',
        category: 'personal',
        energyImpact: 'medium',
        completed: false
  },
  {
        id: `${date.toISOString()}-10`,
        time: '21:30 - 22:00',
        activity: '睡前冥想与能量平衡',
        category: 'energy',
        energyImpact: 'restorative',
        completed: false
      }
    );
  } else {
    // 周末日程
    defaultBlocks.push(
      {
        id: `${date.toISOString()}-1`,
        time: '08:00 - 08:30',
        activity: '晨间冥想与能量激活',
        category: 'energy',
        energyImpact: 'restorative',
        completed: false
      },
      {
        id: `${date.toISOString()}-2`,
        time: '08:30 - 09:30',
        activity: '悠闲早餐',
        category: 'personal',
        energyImpact: 'neutral',
        completed: false
      },
      {
        id: `${date.toISOString()}-3`,
        time: '10:00 - 12:00',
        activity: '户外活动/运动',
        category: 'personal',
        energyImpact: 'high',
        completed: false
      },
      {
        id: `${date.toISOString()}-4`,
        time: '12:30 - 14:00',
        activity: '午餐与休息',
        category: 'rest',
        energyImpact: 'restorative',
        completed: false
      },
      {
        id: `${date.toISOString()}-5`,
        time: '14:00 - 16:00',
        activity: '创意时间/爱好',
        category: 'personal',
        energyImpact: 'medium',
        completed: false
      },
      {
        id: `${date.toISOString()}-6`,
        time: '16:00 - 18:00',
        activity: '社交活动/家庭时间',
        category: 'social',
        energyImpact: 'medium',
        completed: false
      },
      {
        id: `${date.toISOString()}-7`,
        time: '18:30 - 20:00',
        activity: '晚餐与放松',
        category: 'personal',
        energyImpact: 'neutral',
        completed: false
      },
      {
        id: `${date.toISOString()}-8`,
        time: '20:00 - 21:30',
        activity: '轻松娱乐时间',
        category: 'rest',
        energyImpact: 'low',
        completed: false
      },
      {
        id: `${date.toISOString()}-9`,
        time: '21:30 - 22:00',
        activity: '睡前冥想与能量平衡',
        category: 'energy',
        energyImpact: 'restorative',
        completed: false
      }
    );
  }

  return {
    date,
    energyForecast: defaultEnergyForecast,
    blocks: defaultBlocks,
    notes: '这是一个基于你的能量状态和个人偏好生成的日程建议。'
  };
};

// 根据用户能量状态和个人资料生成个性化日程
const generatePersonalizedSchedule = (date: Date, profile?: UserProfileDataOutput): DaySchedule => {
  // 这里可以添加更复杂的逻辑，根据用户能量状态和个人资料调整日程
  // 例如，如果用户是内向型，可以减少社交活动；如果能量低，可以增加休息时间
  const schedule = generateDefaultSchedule(date, profile);
  
  if (profile) {
    // 根据MBTI类型调整日程
    if (profile.mbti?.includes('I')) {
      // 内向型：减少社交活动，增加独处时间
      schedule.blocks = schedule.blocks.map(block => {
        if (block.category === 'social') {
          return {
            ...block,
            activity: block.activity.replace('社交活动', '安静的个人时间'),
            category: 'personal'
          };
        }
        return block;
      });
      
      schedule.notes = '根据你的内向性格特点，日程中增加了更多独处和自我恢复的时间。';
    }
    
    // 根据能量元素调整日程
    if (profile.element) {
      let elementActivity = '';
      switch (profile.element.toLowerCase()) {
        case 'fire':
        case '火':
          elementActivity = '充满活力的运动或创意活动';
          break;
        case 'water':
        case '水':
          elementActivity = '冥想或情感探索活动';
          break;
        case 'earth':
        case '土':
          elementActivity = '接地练习或整理空间';
          break;
        case 'air':
        case '风':
        case '气':
          elementActivity = '思考或学习新知识';
          break;
        case 'wood':
        case '木':
          elementActivity = '自然探索或成长活动';
          break;
        case 'metal':
        case '金':
          elementActivity = '结构化活动或精确任务';
          break;
        }
      
      if (elementActivity) {
        // 添加一个与元素相关的活动
        const middleIndex = Math.floor(schedule.blocks.length / 2);
        schedule.blocks.splice(middleIndex, 0, {
          id: `${date.toISOString()}-element`,
          time: '15:00 - 16:00',
          activity: `元素平衡: ${elementActivity}`,
          category: 'energy',
          energyImpact: 'restorative',
          completed: false
          });
        }
      }
    }
    
  return schedule;
};

const PersonalizedScheduleSuggestion: React.FC<PersonalizedScheduleSuggestionProps> = ({ profile, initialDate, className }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const { toast } = useToast();
  
  // 初始化日程
  useEffect(() => {
    if (selectedDate) {
      const newSchedule = generatePersonalizedSchedule(selectedDate, profile);
      setSchedule(newSchedule);
    }
  }, [selectedDate, profile]);
  
  // 日期选择处理
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };
  
  // 切换任务完成状态
  const toggleTaskCompletion = (taskId: string) => {
    if (!schedule) return;
    
    const updatedBlocks = schedule.blocks.map(block => {
      if (block.id === taskId) {
        return { ...block, completed: !block.completed };
      }
      return block;
    });
    
    setSchedule({
      ...schedule,
      blocks: updatedBlocks
    });
    
    toast({
      title: updatedBlocks.find(b => b.id === taskId)?.completed 
        ? "任务已完成" 
        : "任务已重置",
      description: updatedBlocks.find(b => b.id === taskId)?.activity,
      duration: 2000
    });
  };
  
  // 重新生成日程
  const regenerateSchedule = () => {
    if (selectedDate) {
      const newSchedule = generatePersonalizedSchedule(selectedDate, profile);
      setSchedule(newSchedule);
      
      toast({
        title: "日程已重新生成",
        description: "基于您的能量状态和个人偏好",
        duration: 2000
      });
    }
  };
  
  // 获取能量级别对应的颜色
  const getEnergyColor = (level: number) => {
    const colors = ['bg-red-100 text-red-700', 'bg-orange-100 text-orange-700', 'bg-yellow-100 text-yellow-700', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700'];
    return colors[Math.min(Math.max(0, level - 1), 4)];
  };
  
  // 获取任务类别对应的颜色和图标
  const getCategoryColor = (category: string) => {
    const categoryStyles: Record<string, {color: string, icon: React.ElementType}> = {
      'work': {color: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20', icon: BarChart3},
      'rest': {color: 'border-green-200 bg-green-50 dark:bg-green-900/20', icon: Shield},
      'personal': {color: 'border-purple-200 bg-purple-50 dark:bg-purple-900/20', icon: User},
      'energy': {color: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20', icon: Sparkles},
      'social': {color: 'border-pink-200 bg-pink-50 dark:bg-pink-900/20', icon: Users}
    };
    
    return categoryStyles[category] || {color: 'border-gray-200 bg-gray-50 dark:bg-gray-800/20', icon: CalendarClock};
  };
  
  // 获取能量影响对应的图标
  const getEnergyImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'medium': return <Sparkles className="h-4 w-4 text-blue-500" />;
      case 'low': return <Wind className="h-4 w-4 text-green-500" />;
      case 'restorative': return <RefreshCw className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  
  if (!schedule) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 日期选择和能量预测 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              日期选择
          </CardTitle>
            <CardDescription>
              选择日期查看个性化日程建议
            </CardDescription>
        </CardHeader>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={zhCN}
              className="rounded-md border-0"
            />
        </CardContent>
      </Card>
        
        <Card className="border-0 shadow-md overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-primary" />
              能量预测
            </CardTitle>
            <CardDescription>
              {format(selectedDate, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-muted/50">
                <div className="text-sm font-medium text-muted-foreground mb-1">上午能量</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500" 
                      style={{ width: `${(schedule.energyForecast.morning / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{schedule.energyForecast.morning}</span>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-muted/50">
                <div className="text-sm font-medium text-muted-foreground mb-1">下午能量</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500" 
                      style={{ width: `${(schedule.energyForecast.afternoon / 10) * 100}%` }}
                    />
                        </div>
                  <span className="text-sm font-medium">{schedule.energyForecast.afternoon}</span>
                        </div>
                      </div>
                      
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-muted/50">
                <div className="text-sm font-medium text-muted-foreground mb-1">晚间能量</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-500" 
                      style={{ width: `${(schedule.energyForecast.evening / 10) * 100}%` }}
                    />
                                </div>
                  <span className="text-sm font-medium">{schedule.energyForecast.evening}</span>
                                    </div>
                                  </div>
              
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-muted/50">
                <div className="text-sm font-medium text-muted-foreground mb-1">总体能量</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent" 
                      style={{ width: `${(schedule.energyForecast.overall / 10) * 100}%` }}
                    />
                                    </div>
                  <span className="text-sm font-medium">{schedule.energyForecast.overall}</span>
                                  </div>
                                </div>
                              </div>
            
            <div className="text-center">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={regenerateSchedule}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                重新生成日程
              </Button>
                    </div>
                  </CardContent>
                </Card>
          </div>
      
      {/* 日程表 */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
              <CardTitle className="flex items-center">
            <CalendarClock className="mr-2 h-5 w-5 text-primary" />
            个性化日程建议
              </CardTitle>
          <CardDescription>
            基于您的能量状态和个人偏好生成的日程安排
          </CardDescription>
            </CardHeader>
        <CardContent className="p-6">
          <div className="schedule-timeline">
            {schedule.blocks.map(block => {
              const categoryStyle = getCategoryColor(block.category);
              const CategoryIcon = categoryStyle.icon;
              
              return (
                <div 
                  key={block.id}
                  className={cn(
                    "schedule-item",
                    block.completed && "completed",
                    "border-l-4",
                    categoryStyle.color.split(' ')[0]
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-md",
                        categoryStyle.color
                      )}>
                        <CategoryIcon className="h-4 w-4" />
                </div>
                    <div>
                        <div className="font-medium">{block.activity}</div>
                        <div className="text-sm text-muted-foreground">{block.time}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getEnergyImpactIcon(block.energyImpact)}
                        <span className="text-xs">
                          {block.energyImpact === 'high' ? '高能耗' :
                           block.energyImpact === 'medium' ? '中能耗' :
                           block.energyImpact === 'low' ? '低能耗' :
                           block.energyImpact === 'restorative' ? '恢复能量' : '中性'}
                      </span>
                      </Badge>
                      
                      <Button 
                        size="icon" 
                        variant={block.completed ? "default" : "outline"} 
                        className="h-7 w-7" 
                        onClick={() => toggleTaskCompletion(block.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                      </div>
                    );
                  })}
                </div>
          
          <div className="mt-6 p-4 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">{schedule.notes}</p>
              </div>
            </CardContent>
          </Card>
    </div>
  );
};

export default PersonalizedScheduleSuggestion; 