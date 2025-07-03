'use client';

import React, { useState, useMemo } from 'react';
import { format, addHours, startOfDay, setHours, setMinutes, differenceInMinutes, isAfter, isBefore } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Zap, Target, Heart, Brain, Sparkles, Sun, Moon, Coffee, Briefcase, Users, Home, Dumbbell, Book, Palette, Music, Flower, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

// 活动类型定义
interface ActivityType {
  id: string;
  name: string;
  icon: React.ElementType;
  category: 'work' | 'social' | 'creative' | 'health' | 'spiritual' | 'rest';
  energyRequirement: 'low' | 'medium' | 'high';
  duration: number; // 分钟
  description: string;
  benefits: string[];
  recommendedChakras: string[];
  mbtiSuitable: string[];
}

// 活动库
const ACTIVITY_TYPES: ActivityType[] = [
  {
    id: 'morning-meditation',
    name: '晨间冥想',
    icon: Sparkles,
    category: 'spiritual',
    energyRequirement: 'low',
    duration: 20,
    description: '开启一天的宁静时光',
    benefits: ['提升专注力', '平衡情绪', '增强直觉'],
    recommendedChakras: ['crown', 'thirdEye'],
    mbtiSuitable: ['I', 'N', 'F']
  },
  {
    id: 'creative-work',
    name: '创意工作',
    icon: Palette,
    category: 'creative',
    energyRequirement: 'medium',
    duration: 90,
    description: '发挥想象力的最佳时段',
    benefits: ['激发灵感', '增强创造力', '表达自我'],
    recommendedChakras: ['throat', 'thirdEye'],
    mbtiSuitable: ['N', 'F', 'P']
  },
  {
    id: 'focused-study',
    name: '专注学习',
    icon: Book,
    category: 'work',
    energyRequirement: 'high',
    duration: 60,
    description: '深度学习和思考的时间',
    benefits: ['提升认知', '增强记忆', '系统思考'],
    recommendedChakras: ['thirdEye', 'crown'],
    mbtiSuitable: ['I', 'N', 'T', 'J']
  },
  {
    id: 'social-interaction',
    name: '社交互动',
    icon: Users,
    category: 'social',
    energyRequirement: 'medium',
    duration: 120,
    description: '与他人连接和交流',
    benefits: ['增进感情', '拓展人脉', '情感支持'],
    recommendedChakras: ['heart', 'throat'],
    mbtiSuitable: ['E', 'F']
  },
  {
    id: 'physical-exercise',
    name: '体能锻炼',
    icon: Dumbbell,
    category: 'health',
    energyRequirement: 'high',
    duration: 45,
    description: '强化身体，释放压力',
    benefits: ['增强体质', '释放压力', '提升活力'],
    recommendedChakras: ['root', 'sacral'],
    mbtiSuitable: ['E', 'S']
  },
  {
    id: 'rest-relaxation',
    name: '休息放松',
    icon: Home,
    category: 'rest',
    energyRequirement: 'low',
    duration: 30,
    description: '让身心得到充分恢复',
    benefits: ['恢复能量', '减轻疲劳', '内心平静'],
    recommendedChakras: ['heart', 'root'],
    mbtiSuitable: ['I', 'F']
  },
  {
    id: 'nature-walk',
    name: '自然漫步',
    icon: Flower,
    category: 'health',
    energyRequirement: 'low',
    duration: 40,
    description: '在自然中寻找灵感和平静',
    benefits: ['接地气', '清理思绪', '增强直觉'],
    recommendedChakras: ['root', 'heart'],
    mbtiSuitable: ['I', 'N', 'F', 'P']
  },
  {
    id: 'music-therapy',
    name: '音乐疗愈',
    icon: Music,
    category: 'spiritual',
    energyRequirement: 'low',
    duration: 25,
    description: '通过音乐平衡脉轮能量',
    benefits: ['情感释放', '能量平衡', '心灵净化'],
    recommendedChakras: ['heart', 'throat', 'thirdEye'],
    mbtiSuitable: ['F', 'P']
  }
];

// 时间段定义
interface TimeSlot {
  start: number; // 小时 (0-23)
  end: number;
  label: string;
  energyLevel: 'low' | 'medium' | 'high';
  description: string;
}

// 日程建议类型
interface ScheduleSuggestion {
  timeSlot: TimeSlot;
  activity: ActivityType;
  matchScore: number;
  reason: string;
  crystalSuggestion: string;
}

// 基于MBTI的时间偏好
const getMBTITimePreferences = (mbtiType?: string) => {
  const preferences = {
    'E': { 
      peakHours: [9, 10, 11, 14, 15, 16], // 外向者的高能量时段
      socialHours: [10, 11, 14, 15, 16, 19, 20],
      description: '外向者在上午和下午的社交时段表现最佳'
    },
    'I': { 
      peakHours: [6, 7, 8, 21, 22], // 内向者的安静时段
      socialHours: [10, 11, 15, 16],
      description: '内向者在清晨和晚间的独处时光中最为高效'
    },
    'N': { 
      creativeHours: [6, 7, 8, 9, 22, 23], // 直觉者的创意时段
      description: '直觉型偏好在安静的时段进行深度思考'
    },
    'S': { 
      focusHours: [9, 10, 11, 14, 15, 16], // 感觉者的专注时段
      description: '感觉型在常规工作时间内专注力最强'
    },
    'T': { 
      analysisHours: [9, 10, 11, 14, 15], // 思考者的分析时段
      description: '思考型在逻辑思维要求高的时段表现出色'
    },
    'F': { 
      emotionalHours: [7, 8, 18, 19, 20], // 情感者的情感处理时段
      description: '情感型在处理人际关系和情感事务时更有效'
    },
    'J': { 
      planningHours: [7, 8, 9, 10], // 判断者的计划时段
      description: '判断型在早上制定计划和安排日程最为有效'
    },
    'P': { 
      flexibleHours: [11, 12, 15, 16, 19, 20], // 知觉者的灵活时段
      description: '知觉型在较为自由的时段能够发挥最佳状态'
    }
  };

  if (!mbtiType) return {};

  const result: any = {};
  for (const char of mbtiType) {
    if (preferences[char as keyof typeof preferences]) {
      Object.assign(result, preferences[char as keyof typeof preferences]);
    }
  }

  return result;
};

// 基于元素的活动偏好
const getElementPreferences = (element?: string) => {
  const preferences = {
    'fire': {
      preferredActivities: ['physical-exercise', 'social-interaction', 'creative-work'],
      avoidActivities: ['rest-relaxation'],
      bestTimes: [9, 10, 11, 14, 15]
    },
    'water': {
      preferredActivities: ['morning-meditation', 'music-therapy', 'rest-relaxation'],
      avoidActivities: ['physical-exercise'],
      bestTimes: [6, 7, 18, 19, 20]
    },
    'earth': {
      preferredActivities: ['focused-study', 'nature-walk', 'physical-exercise'],
      avoidActivities: ['social-interaction'],
      bestTimes: [8, 9, 10, 15, 16]
    },
    'air': {
      preferredActivities: ['creative-work', 'social-interaction', 'focused-study'],
      avoidActivities: ['rest-relaxation'],
      bestTimes: [10, 11, 14, 15, 16]
    },
    'ether': {
      preferredActivities: ['morning-meditation', 'creative-work', 'music-therapy'],
      avoidActivities: ['physical-exercise'],
      bestTimes: [6, 7, 22, 23]
    }
  };

  return preferences[element as keyof typeof preferences] || preferences.ether;
};

// 生成时间段
const generateTimeSlots = (): TimeSlot[] => [
  { start: 6, end: 8, label: '清晨时光', energyLevel: 'medium', description: '一天的开始，适合冥想和计划' },
  { start: 8, end: 10, label: '晨间活力', energyLevel: 'high', description: '精力充沛，适合重要任务' },
  { start: 10, end: 12, label: '上午专注', energyLevel: 'high', description: '专注力最强的时段' },
  { start: 12, end: 14, label: '午休时分', energyLevel: 'medium', description: '适合轻松活动和社交' },
  { start: 14, end: 16, label: '下午高效', energyLevel: 'high', description: '第二个高效时段' },
  { start: 16, end: 18, label: '傍晚过渡', energyLevel: 'medium', description: '从工作模式过渡到休息' },
  { start: 18, end: 20, label: '黄昏社交', energyLevel: 'medium', description: '适合社交和情感连接' },
  { start: 20, end: 22, label: '夜晚安静', energyLevel: 'low', description: '内省和放松的时间' },
  { start: 22, end: 24, label: '深夜冥思', energyLevel: 'low', description: '深度思考和精神探索' }
];

interface PersonalizedScheduleSuggestionProps {
  profile?: UserProfileDataOutput;
  selectedDate?: Date;
  className?: string;
}

const PersonalizedScheduleSuggestion: React.FC<PersonalizedScheduleSuggestionProps> = ({ 
  profile, 
  selectedDate = new Date(), 
  className 
}) => {
  const [activeTab, setActiveTab] = useState('schedule');
  
  // 解析用户特征
  const mbtiType = profile?.mbtiLikeType?.match(/\b([IE][NS][TF][JP])\b/)?.[0];
  const element = profile?.inferredElement?.toLowerCase();
  const zodiac = profile?.inferredZodiac;
  
  // 获取个性化偏好
  const mbtiPrefs = getMBTITimePreferences(mbtiType);
  const elementPrefs = getElementPreferences(element);
  
  // 生成个性化日程建议
  const scheduleSuggestions = useMemo((): ScheduleSuggestion[] => {
    const timeSlots = generateTimeSlots();
    const suggestions: ScheduleSuggestion[] = [];
    
    for (const timeSlot of timeSlots) {
      for (const activity of ACTIVITY_TYPES) {
        let matchScore = 50; // 基础分数
        let reasons: string[] = [];
        
        // MBTI匹配度
        if (mbtiType) {
          const mbtiChars = mbtiType.split('');
          const mbtiMatches = activity.mbtiSuitable.filter(char => mbtiChars.includes(char));
          matchScore += mbtiMatches.length * 15;
          if (mbtiMatches.length > 0) {
            reasons.push(`适合${mbtiType}类型`);
          }
        }
        
        // 时间段和能量要求匹配
        const energyMatch = {
          'low': { 'low': 20, 'medium': 0, 'high': -10 },
          'medium': { 'low': 10, 'medium': 20, 'high': 10 },
          'high': { 'low': -5, 'medium': 10, 'high': 20 }
        };
        matchScore += energyMatch[timeSlot.energyLevel][activity.energyRequirement];
        
        // MBTI时间偏好
        if (mbtiPrefs.peakHours && mbtiPrefs.peakHours.includes(timeSlot.start)) {
          matchScore += 10;
          reasons.push('个人高效时段');
        }
        
        // 元素偏好
        if (elementPrefs.preferredActivities.includes(activity.id)) {
          matchScore += 15;
          reasons.push(`${element}元素偏好`);
        }
        if (elementPrefs.avoidActivities.includes(activity.id)) {
          matchScore -= 15;
        }
        if (elementPrefs.bestTimes.includes(timeSlot.start)) {
          matchScore += 10;
          reasons.push('元素最佳时段');
        }
        
        // 活动类型的时间适配
        const timeBasedBonus = {
          'spiritual': timeSlot.start <= 8 || timeSlot.start >= 20 ? 15 : 0,
          'work': timeSlot.start >= 9 && timeSlot.start <= 17 ? 15 : -5,
          'creative': timeSlot.start <= 10 || timeSlot.start >= 20 ? 10 : 0,
          'social': timeSlot.start >= 11 && timeSlot.start <= 20 ? 10 : -5,
          'health': timeSlot.start >= 7 && timeSlot.start <= 11 || timeSlot.start >= 17 && timeSlot.start <= 19 ? 10 : 0,
          'rest': timeSlot.start >= 20 || timeSlot.start <= 8 ? 15 : -10
        };
        matchScore += timeBasedBonus[activity.category];
        
        // 脉轮推荐的水晶
        const crystalMap: Record<string, string> = {
          'root': '红碧玉',
          'sacral': '橙色玛瑙',
          'solarPlexus': '黄水晶',
          'heart': '粉水晶',
          'throat': '蓝晶石',
          'thirdEye': '紫水晶',
          'crown': '白水晶'
        };
        
        const mainChakra = activity.recommendedChakras[0] || 'heart';
        const crystalSuggestion = crystalMap[mainChakra] || '白水晶';
        
        // 只保留分数较高的建议
        if (matchScore >= 60) {
          suggestions.push({
            timeSlot,
            activity,
            matchScore,
            reason: reasons.join(' · ') || '基础推荐',
            crystalSuggestion
          });
        }
      }
    }
    
    // 按匹配分数排序
    return suggestions.sort((a, b) => b.matchScore - a.matchScore);
  }, [profile, mbtiType, element, mbtiPrefs, elementPrefs]);
  
  // 按时间段分组
  const suggestionsByTime = useMemo(() => {
    const grouped: Record<string, ScheduleSuggestion[]> = {};
    
    for (const suggestion of scheduleSuggestions) {
      const key = suggestion.timeSlot.label;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(suggestion);
    }
    
    // 每个时间段只保留最佳的2个建议
    Object.keys(grouped).forEach(key => {
      grouped[key] = grouped[key].slice(0, 2);
    });
    
    return grouped;
  }, [scheduleSuggestions]);
  
  // 获取活动图标颜色
  const getActivityColor = (category: string) => {
    const colors = {
      'work': 'text-blue-500',
      'social': 'text-green-500',
      'creative': 'text-purple-500',
      'health': 'text-red-500',
      'spiritual': 'text-indigo-500',
      'rest': 'text-gray-500'
    };
    return colors[category as keyof typeof colors] || 'text-gray-500';
  };
  
  // 获取能量等级颜色
  const getEnergyColor = (level: string) => {
    const colors = {
      'low': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'high': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[level as keyof typeof colors] || colors.medium;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* 个性化概述 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            个性化日程建议
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-medium text-sm">性格类型</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {mbtiType || '待分析'}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
              <Sparkles className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <h3 className="font-medium text-sm">元素属性</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {element || '待分析'}
              </p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-medium text-sm">星座</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {zodiac || '待分析'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">日程安排</TabsTrigger>
          <TabsTrigger value="insights">深度洞察</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule" className="space-y-4">
          {/* 时间轴式日程展示 */}
          <div className="space-y-4">
            {Object.entries(suggestionsByTime).map(([timeLabel, suggestions]) => {
              const timeSlot = suggestions[0]?.timeSlot;
              if (!timeSlot) return null;
              
              return (
                <Card key={timeLabel} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* 时间轴 */}
                      <div className="w-24 bg-gradient-to-b from-primary/10 to-primary/5 p-4 text-center">
                        <div className="text-lg font-bold">
                          {String(timeSlot.start).padStart(2, '0')}:00
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {String(timeSlot.end).padStart(2, '0')}:00
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("mt-2 text-xs", getEnergyColor(timeSlot.energyLevel))}
                        >
                          {timeSlot.energyLevel === 'high' ? '高能' : 
                           timeSlot.energyLevel === 'medium' ? '中能' : '低能'}
                        </Badge>
                      </div>
                      
                      {/* 活动建议 */}
                      <div className="flex-1 p-4">
                        <h3 className="font-medium mb-2">{timeLabel}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{timeSlot.description}</p>
                        
                        <div className="space-y-3">
                          {suggestions.map((suggestion, index) => {
                            const Icon = suggestion.activity.icon;
                            return (
                              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                                <div className={cn("flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm", getActivityColor(suggestion.activity.category))}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-sm">{suggestion.activity.name}</h4>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {suggestion.activity.duration}分钟
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        匹配 {suggestion.matchScore}%
                                      </Badge>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {suggestion.activity.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {suggestion.reason}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      <Sparkles className="h-3 w-3 text-purple-500" />
                                      <span className="text-xs text-purple-600">
                                        推荐 {suggestion.crystalSuggestion}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-4">
          {/* 深度洞察 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                个性化洞察
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* MBTI洞察 */}
              {mbtiType && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    性格类型洞察 ({mbtiType})
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {mbtiPrefs.description || '根据您的性格类型，建议在合适的时段安排相应的活动。'}
                  </p>
                  {mbtiPrefs.peakHours && (
                    <div className="mt-2">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        最佳时段: {mbtiPrefs.peakHours.map((h: number) => `${h}:00`).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* 元素洞察 */}
              {element && (
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                    元素属性洞察 ({element})
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-green-700 dark:text-green-300">推荐活动: </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {elementPrefs.preferredActivities.map(id => 
                          ACTIVITY_TYPES.find(a => a.id === id)?.name
                        ).filter(Boolean).join(', ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-green-700 dark:text-green-300">最佳时段: </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {elementPrefs.bestTimes.map(h => `${h}:00`).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 脉轮洞察 */}
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
                  脉轮能量建议
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['morning-meditation', 'heart-healing', 'creative-work', 'nature-walk'].map(activityId => {
                    const activity = ACTIVITY_TYPES.find(a => a.id === activityId);
                    if (!activity) return null;
                    
                    return (
                      <div key={activityId} className="flex items-center space-x-2">
                        <activity.icon className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-purple-700 dark:text-purple-300">
                          {activity.name}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {activity.recommendedChakras[0]}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PersonalizedScheduleSuggestion; 