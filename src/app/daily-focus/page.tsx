"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDailyGuidance } from '@/ai/flows/daily-guidance-flow';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import type { DesignWithId, ProfileWithId, EnergyReadingWithId } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, Gem, Wind, Lightbulb, LogIn, FileText, Calendar as CalendarIcon, History, ImageIcon, User as UserIcon, ScanSearch, Star, Sun, Moon, Sparkles, Zap, Target, TrendingUp, Heart, Brain, Eye, Crown, Compass, Flame, Droplets, CloudLightning, Mountain, Palette, Orbit, BarChart3, Users } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, isBefore, startOfToday, parseISO, isEqual, startOfDay, addDays, isSameMonth, isSameDay, getDay } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserProfileDisplay from '@/components/UserProfileDisplay';
import EnergyReadingDisplay from '@/components/EnergyReadingDisplay';
import ProfileSummaryCard from '@/components/ProfileSummaryCard';
import EnergyTrendChart from '@/components/EnergyTrendChart';
import CrystalMeditationReminder from '@/components/CrystalMeditationReminder';
import PersonalizedScheduleSuggestion from '@/components/PersonalizedScheduleSuggestion';
import { pollinationsDesignSuggestions } from '@/ai/pollinations';
import { v4 as uuidv4 } from 'uuid';
import { getUserProfile, getUserProfiles, UserProfileWithMeta } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { zhCN } from 'date-fns/locale';
import CrystalMeditation from '@/components/CrystalMeditation';
import '@/styles/crystal-calendar.css';

// 添加缺少的图标
const Crystal = Gem; // 使用 Gem 图标代替 Crystal
const Lotus = Wind; // 使用 Wind 图标代替 Lotus

// 类型定义
interface DailyGuidanceResult {
  guidance: string;
  meditationPrompt: string;
  date: string;
  language: string;
}

// 能量状态类型定义
export interface DailyEnergyState {
  date: Date;
  energyLevel: number; // 1-5
  dominantChakra: string;
  recommendedCrystal: string;
  energyColor: string;
  mbtiMood: string;
  elementBalance: string;
  isSpecialDay?: boolean;
  specialType?: 'birthday' | 'zodiac' | 'chakra' | 'element';
}

interface ChakraDay {
  chakra: string;
  color: string;
  energy: number;
  crystal: string;
  icon: React.ElementType;
}

// 脉轮与图标映射
const chakraIcons = {
  root: Mountain,
  sacral: Droplets,
  solarPlexus: Sun,
  heart: Heart,
  throat: Sparkles,
  thirdEye: Eye,
  crown: Crown
};

// 元素与图标映射
const elementIcons = {
  fire: Flame,
  water: Droplets,
  air: Wind,
  earth: Mountain,
  ether: Sparkles
};

// 元素颜色映射
const elementColors = {
  fire: 'text-red-500 bg-red-50',
  water: 'text-blue-500 bg-blue-50',
  air: 'text-yellow-500 bg-yellow-50',
  earth: 'text-green-500 bg-green-50',
  ether: 'text-purple-500 bg-purple-50'
};

// 脉轮颜色映射
const chakraColors = {
  root: 'text-red-600 bg-red-50',
  sacral: 'text-orange-500 bg-orange-50',
  solarPlexus: 'text-yellow-500 bg-yellow-50',
  heart: 'text-green-500 bg-green-50',
  throat: 'text-blue-500 bg-blue-50',
  thirdEye: 'text-indigo-500 bg-indigo-50',
  crown: 'text-purple-500 bg-purple-50'
};

// 生成个性化能量预测
const generateEnergyPrediction = (date: Date, profile?: UserProfileDataOutput | null): DailyEnergyState => {
  const dayOfWeek = getDay(date);
  const dayOfMonth = date.getDate();
  
  // 默认值
  const defaultMbtiType = 'ENFP';
  const defaultElement = 'fire';
  const defaultZodiac = 'aries';
  
  // 安全地获取 MBTI 类型，确保即使 profile 为 undefined 也能正常工作
  let mbtiType = defaultMbtiType;
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
  
  // 安全地获取元素和星座
  const element = profile?.inferredElement?.toLowerCase() || defaultElement;
  const zodiac = profile?.inferredZodiac?.toLowerCase() || defaultZodiac;
  
  // 根据星期和个人特质计算能量水平
  let energyLevel = 3;
  if (mbtiType.startsWith('E')) {
    energyLevel += dayOfWeek === 1 || dayOfWeek === 5 ? 1 : 0; // 外向者周一周五更有活力
  } else {
    energyLevel += dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0; // 内向者周末更有活力
  }
  
  // 根据日期循环选择主导脉轮
  const chakras = ['root', 'sacral', 'solarPlexus', 'heart', 'throat', 'thirdEye', 'crown'];
  const dominantChakra = chakras[dayOfMonth % 7];
  
  // 基于脉轮和元素选择水晶
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
  
  // 生成能量颜色
  const energyColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];
  const energyColor = energyColors[Math.min(energyLevel - 1, 4)];
  
  // MBTI相关的日常情绪倾向
  const mbtiMoods: Record<string, string[]> = {
    'E': ['社交活跃', '表达欲强', '寻求刺激'],
    'I': ['内省深思', '独处充电', '专注内心'],
    'S': ['注重细节', '实用导向', '当下体验'],
    'N': ['灵感涌现', '未来思考', '概念探索'],
    'T': ['逻辑分析', '客观判断', '效率优先'],
    'F': ['情感丰富', '人际和谐', '价值导向'],
    'J': ['计划明确', '秩序稳定', '决策果断'],
    'P': ['灵活适应', '探索新奇', '开放变化']
  };
  
  // 安全地获取 MBTI 心情
  let mbtiMood = '平衡状态';
  try {
    if (mbtiType && mbtiType.length > 0) {
      const mbtiChar = mbtiType[dayOfMonth % 4];
      if (mbtiChar && mbtiMoods[mbtiChar]) {
        mbtiMood = mbtiMoods[mbtiChar][dayOfMonth % 3];
      }
    }
  } catch (e) {
    console.error("Error determining MBTI mood:", e);
  }
  
  // 五行元素的日常平衡
  const elementBalance = element === 'fire' ? '活力充沛' :
                       element === 'water' ? '流动平和' :
                       element === 'earth' ? '稳定踏实' :
                       element === 'air' ? '灵动轻盈' : '和谐平衡';
  
  return {
    date,
    energyLevel: Math.max(1, Math.min(5, energyLevel)),
    dominantChakra,
    recommendedCrystal,
    energyColor,
    mbtiMood,
    elementBalance
  };
};

// 个性化日历组件
const PersonalizedCalendar = ({ 
  profile, 
  selectedDate, 
  onDateSelect 
}: { 
  profile?: UserProfileDataOutput;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
}) => {
  const today = startOfToday();
  
  // 生成一个月的能量预测
  const monthEnergyStates = Array.from({ length: 31 }, (_, i) => {
    const date = addDays(today, i - 15); // 前后15天
    return generateEnergyPrediction(date, profile);
  });
  
  const renderDay = (date: Date) => {
    const energyState = monthEnergyStates.find(state => 
      isSameDay(state.date, date)
    );
    
    if (!energyState) return null;
    
    const isToday = isSameDay(date, today);
    const isSelected = selectedDate && isSameDay(date, selectedDate);

    return (
      <div className="relative p-1.5">
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center text-sm font-medium rounded-full cursor-pointer transition-all hover:scale-105",
            isToday && "ring-2 ring-primary font-bold bg-primary/10",
            isSelected && "bg-primary text-primary-foreground shadow-lg",
            !isSelected && !isToday && "hover:bg-muted/80"
          )}
          onClick={() => onDateSelect(date)}
        >
          {date.getDate()}
        </div>
        
        {/* 优化的能量指示器 */}
        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all",
                i < energyState.energyLevel 
                  ? "bg-gradient-to-r from-primary to-accent" 
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>
        
        {/* 特殊日期标记 */}
        {energyState.isSpecialDay && (
          <Star className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
        )}
      </div>
    );
  };

  return (
    <Card className="crystal-calendar-widget">
      <CardContent className="p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          locale={zhCN}
          className="rounded-lg border-0 w-full"
          classNames={{
            months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
            month: "space-y-4 w-full flex-1",
            table: "w-full h-full",
            head_row: "",
            head_cell: "text-muted-foreground font-normal text-sm w-12 h-8",
            row: "w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
            day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100",
            day_range_end: "day-range-end",
            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
            day_today: "bg-accent text-accent-foreground",
            day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
            day_disabled: "text-muted-foreground opacity-50",
            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
          components={{
            Day: ({ date }) => renderDay(date)
          }}
        />
      </CardContent>
    </Card>
  );
};

// 能量详情显示组件
const EnergyInsightDisplay = ({ 
  guidance, 
  energyState, 
  profile 
}: { 
  guidance?: DailyGuidanceResult;
  energyState: DailyEnergyState;
  profile?: UserProfileDataOutput | null;
}) => {
  if (!guidance) {
    return (
      <div className="energy-insight-placeholder">
        <div className="text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-primary opacity-50" />
          <h3 className="text-lg font-medium">能量洞察尚未生成</h3>
          <p className="text-muted-foreground">请先完成个人能量档案评估，或稍后再试。</p>
        </div>
      </div>
    );
  }
  
  // 安全地获取用户名，确保不会出现空值错误
  const userName = profile?.name || '能量探索者';
  
  // 将指导内容分段显示
  const paragraphs = guidance.guidance.split('\n\n').filter(p => p.trim().length > 0);
  
  return (
    <div className="energy-insight-display">
      <div className="space-y-6">
        <div className="energy-greeting">
          <h3 className="text-xl font-medium">
            {userName}，{format(new Date(), 'EEEE', { locale: zhCN })}好
          </h3>
          <p className="text-muted-foreground">
            今天是{format(new Date(), 'yyyy年MM月dd日')}，以下是您的个性化能量洞察
          </p>
        </div>
        
        <Separator />
        
        <div className="energy-guidance prose">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        
        <div className="energy-focus-areas">
          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            今日能量焦点
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="energy-focus-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Crystal className="h-4 w-4 text-purple-500" />
                  推荐水晶
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{energyState.recommendedCrystal}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  这种水晶能帮助平衡您今天的能量场
                </p>
              </CardContent>
            </Card>
            
            <Card className="energy-focus-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  心智状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{energyState.mbtiMood}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  今天您的思维模式和决策倾向
                </p>
              </CardContent>
            </Card>
            
            <Card className="energy-focus-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  元素平衡
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{energyState.elementBalance}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  您今天的五行元素状态
                </p>
              </CardContent>
            </Card>
            
            <Card className="energy-focus-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Lotus className="h-4 w-4 text-pink-500" />
                  冥想主题
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{guidance.meditationPrompt}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  今日推荐的冥想焦点
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// 能量趋势组件
const EnergyTrendView = ({ profile }: { profile?: UserProfileDataOutput | null }) => {
  // 如果没有用户档案，显示占位符
  if (!profile) {
    return (
      <Card className="trend-card">
        <CardHeader>
          <CardTitle className="text-lg">能量趋势</CardTitle>
          <CardDescription>完成个人档案评估后查看能量趋势</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-center">
            <Sparkles className="h-10 w-10 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-sm text-muted-foreground">需要更多数据来生成趋势图</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="trend-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">能量趋势</CardTitle>
        <CardDescription>过去7天的能量变化</CardDescription>
      </CardHeader>
      <CardContent>
        <EnergyTrendChart profile={profile} />
      </CardContent>
    </Card>
  );
};

export default function CrystalCalendarPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [profile, setProfile] = useState<UserProfileDataOutput>({
    name: '默认用户',
    mbtiLikeType: 'ENFP',
    inferredZodiac: 'Aries',
    inferredChineseZodiac: 'Dragon',
    inferredElement: 'Fire',
    inferredPlanet: 'Mars',
    chakraAnalysis: '心轮平衡',
    coreEnergyInsights: '能量平衡'
  });
  const [guidance, setGuidance] = useState<DailyGuidanceResult | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [energyState, setEnergyState] = useState<DailyEnergyState>({
    date: new Date(),
    energyLevel: 3,
    dominantChakra: 'heart',
    recommendedCrystal: '白水晶',
    energyColor: '#3b82f6',
    mbtiMood: '平衡状态',
    elementBalance: '和谐平衡'
  });

  // 获取用户档案
  useEffect(() => {
    const loadUserProfile = async () => {
      setProfileLoading(true);
      try {
        // 如果用户已登录，获取其真实档案
      if (user) {
          const userProfile = await getUserProfile(user.email);
          if (userProfile) {
            setProfile(userProfile);
            // 用户档案加载后更新能量状态
            setEnergyState(generateEnergyPrediction(selectedDate, userProfile));
            setProfileLoading(false);
            return;
          }
        }
        
        // 如果用户未登录或没有档案，使用默认档案
        console.log('👤 使用默认用户档案');
        const defaultProfile: UserProfileDataOutput = {
          name: '默认用户',
          mbtiLikeType: 'ENFP',
          inferredZodiac: 'Aries',
          inferredChineseZodiac: 'Dragon',
          inferredElement: 'Fire',
          inferredPlanet: 'Mars',
          chakraAnalysis: '心轮平衡',
          coreEnergyInsights: '能量平衡'
        };
        setProfile(defaultProfile);
        setEnergyState(generateEnergyPrediction(selectedDate, defaultProfile));
      } catch (error) {
          console.error("Error loading user profile:", error);
        // 发生错误时也使用默认档案
        const fallbackProfile: UserProfileDataOutput = {
          name: '临时用户',
          mbtiLikeType: 'ENFP',
          inferredZodiac: 'Aries',
          inferredChineseZodiac: 'Dragon',
          inferredElement: 'Fire',
          inferredPlanet: 'Mars',
          chakraAnalysis: '心轮平衡',
          coreEnergyInsights: '能量平衡'
        };
        setProfile(fallbackProfile);
        setEnergyState(generateEnergyPrediction(selectedDate, fallbackProfile));
      } finally {
        setProfileLoading(false);
      }
    };
    
    loadUserProfile();
  }, [user, selectedDate]);
  
  // 日期变更时更新能量状态
  useEffect(() => {
    if (profile) {
      setEnergyState(generateEnergyPrediction(selectedDate, profile));
    }
  }, [selectedDate, profile]);
  
  // 获取日常指导
  useEffect(() => {
    if (profile) {
      fetchGuidanceForDate(selectedDate);
    }
  }, [selectedDate, profile]);
  
  const fetchGuidanceForDate = async (targetDate: Date) => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const result = await getDailyGuidance({
        userProfile: profile,
        targetDate: format(targetDate, 'yyyy-MM-dd'),
        language: 'zh'
      });
      
      setGuidance({
        guidance: result.guidance,
        meditationPrompt: result.meditationPrompt,
        date: format(targetDate, 'yyyy-MM-dd'),
        language: 'zh'
      });
    } catch (error) {
      console.error("Error fetching guidance:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="crystal-calendar-container">
      <h1 className="crystal-calendar-title">水晶能量日历</h1>
      
      <div className="crystal-calendar-content">
        {/* 左侧边栏 */}
        <div className="crystal-calendar-sidebar">
          <PersonalizedCalendar
            profile={profile}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
          
          <Card className="energy-prediction-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-4 w-4 mr-2 text-primary" />
                今日能量预测
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">总体能量</span>
                  <div className="energy-indicator">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "energy-indicator-dot",
                          i < energyState.energyLevel ? "active" : "inactive"
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {chakraIcons[energyState.dominantChakra as keyof typeof chakraIcons] && 
                      React.createElement(
                        chakraIcons[energyState.dominantChakra as keyof typeof chakraIcons],
                        { className: `h-4 w-4 ${chakraColors[energyState.dominantChakra as keyof typeof chakraColors].split(' ')[0]}` }
                      )
                    }
                    <span className="text-sm">主导脉轮: {
                      energyState.dominantChakra === 'root' ? '海底轮' :
                      energyState.dominantChakra === 'sacral' ? '脐轮' :
                      energyState.dominantChakra === 'solarPlexus' ? '太阳神经丛轮' :
                      energyState.dominantChakra === 'heart' ? '心轮' :
                      energyState.dominantChakra === 'throat' ? '喉轮' :
                      energyState.dominantChakra === 'thirdEye' ? '眉心轮' : '顶轮'
                    }</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-primary" />
                    <span className="text-sm">推荐水晶: {energyState.recommendedCrystal}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">情绪倾向: {energyState.mbtiMood}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 主内容区域 */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="guidance" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="guidance" className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    <span>今日指引</span>
                  </TabsTrigger>
                  <TabsTrigger value="meditation" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>水晶冥想</span>
                  </TabsTrigger>
                  <TabsTrigger value="schedule" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>能量日程</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="guidance" className="crystal-calendar-tab-content">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p>正在连接宇宙能量...</p>
                    </div>
                  ) : (
                    <EnergyInsightDisplay 
                      guidance={guidance} 
                      energyState={energyState} 
                      profile={profile} 
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="meditation" className="crystal-calendar-tab-content">
                  <CrystalMeditation profile={profile} energyState={energyState} />
                </TabsContent>
                
                <TabsContent value="schedule" className="crystal-calendar-tab-content">
                  <PersonalizedScheduleSuggestion profile={profile} initialDate={selectedDate} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="crystal-card-grid">
            <EnergyTrendView profile={profile} />
            {profileLoading ? (
              <ProfileSummaryCard.Skeleton />
            ) : (
              <ProfileSummaryCard 
                key="profile-loaded" 
                profile={profile} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// mock 数据
const mockProfile = { name: '测试用户', gender: 'female', birthDate: '1990-01-01' };
const mockDesigns = [
  { id: '1', prompt: '简约风格水晶手链', imageUrl: '/test1.png', createdAt: '2024-01-01' },
  { id: '2', prompt: '波西米亚风格水晶项链', imageUrl: '/test2.png', createdAt: '2024-01-02' },
];
const mockEnergyReadings = [
  { id: '1', createdAt: '2024-01-01', data: { energy: 80 } },
];
