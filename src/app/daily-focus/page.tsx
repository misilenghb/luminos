"use client";

import { useState, useEffect } from 'react';
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

// 类型定义
interface DailyGuidanceResult {
  guidance: string;
  meditationPrompt: string;
  date: string;
  language: string;
}

// 能量状态类型定义
interface DailyEnergyState {
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
const generateEnergyPrediction = (date: Date, profile?: UserProfileDataOutput): DailyEnergyState => {
  const dayOfWeek = getDay(date);
  const dayOfMonth = date.getDate();
  
  // 基于用户画像的个性化逻辑
  const mbtiType = profile?.mbtiLikeType?.match(/\b([IE][NS][TF][JP])\b/)?.[0];
  const element = profile?.inferredElement?.toLowerCase();
  const zodiac = profile?.inferredZodiac?.toLowerCase();
  
  // 根据星期和个人特质计算能量水平
  let energyLevel = 3;
  if (mbtiType?.startsWith('E')) {
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
  
  const mbtiChar = mbtiType?.[dayOfMonth % 4] || 'E';
  const mbtiMood = mbtiMoods[mbtiChar]?.[dayOfMonth % 3] || '平衡状态';
  
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
    <Card className="w-full">
      <CardContent className="pb-6">
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
  profile?: UserProfileDataOutput;
}) => {
    const { t } = useLanguage();
  const ChakraIcon = chakraIcons[energyState.dominantChakra as keyof typeof chakraIcons] || Sun;
  const userElement = profile?.inferredElement?.toLowerCase() || 'earth';
  const ElementIcon = elementIcons[userElement as keyof typeof elementIcons] || Mountain;
  
            return (
    <div className="space-y-6">
      {/* 日期和总体状态 */}
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{format(energyState.date, 'yyyy年MM月dd日', { locale: zhCN })}</span>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i < energyState.energyLevel ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </CardTitle>
          <CardDescription>
            能量水平：{energyState.energyLevel}/5 | 整体状态：{energyState.elementBalance}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 主要能量信息 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 主导脉轮 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ChakraIcon className="mr-3 h-6 w-6" />
              今日主导脉轮
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
              chakraColors[energyState.dominantChakra as keyof typeof chakraColors]
            )}>
              <ChakraIcon className="mr-2 h-4 w-4" />
              {energyState.dominantChakra === 'root' ? '海底轮' :
               energyState.dominantChakra === 'sacral' ? '脐轮' :
               energyState.dominantChakra === 'solarPlexus' ? '太阳神经丛轮' :
               energyState.dominantChakra === 'heart' ? '心轮' :
               energyState.dominantChakra === 'throat' ? '喉轮' :
               energyState.dominantChakra === 'thirdEye' ? '眉心轮' : '顶轮'}
                </div>
            <p className="text-sm text-muted-foreground mt-3">
              今日重点关注{energyState.dominantChakra === 'heart' ? '情感表达与爱的流动' : '对应的能量中心平衡'}
            </p>
          </CardContent>
        </Card>

        {/* 推荐水晶 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Gem className="mr-3 h-6 w-6 text-primary" />
              今日水晶伙伴
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                <Gem className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">{energyState.recommendedCrystal}</div>
                <div className="text-sm text-muted-foreground">与您的{energyState.dominantChakra}能量共振</div>
                                            </div>
                                        </div>
          </CardContent>
        </Card>
                                        </div>

      {/* 个性化指导 */}
      {guidance && (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wind className="mr-3 h-6 w-6 text-blue-500" />
                冥想引导
              </CardTitle>
            </CardHeader>
                       <CardContent>
             <p className="text-muted-foreground leading-relaxed">
               {guidance.meditationPrompt}
             </p>
           </CardContent>
         </Card>

         <Card>
           <CardHeader>
             <CardTitle className="flex items-center">
               <Lightbulb className="mr-3 h-6 w-6 text-yellow-500" />
               能量洞察
             </CardTitle>
                              </CardHeader>
           <CardContent>
             <p className="text-muted-foreground leading-relaxed">
               {guidance.guidance}
             </p>
           </CardContent>
                            </Card>
                        </div>
      )}

      {/* 个人特质提醒 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-3 h-6 w-6 text-purple-500" />
            个性化提醒
          </CardTitle>
                              </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">MBTI状态倾向</div>
            <Badge variant="outline">{energyState.mbtiMood}</Badge>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground mb-2">元素平衡状态</div>
            <div className="flex items-center gap-2">
              <ElementIcon className="h-4 w-4" />
              <span className="text-sm">{energyState.elementBalance}</span>
            </div>
          </div>
        </CardContent>
                            </Card>
                        </div>
  );
};

// 能量趋势组件
const EnergyTrendView = ({ profile }: { profile?: UserProfileDataOutput }) => {
  const today = startOfToday();
  const weekData = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(today, i - 2);
    const energy = generateEnergyPrediction(date, profile);
    return {
      date: format(date, 'MM/dd'),
      weekday: format(date, 'EEEEEE'),
      level: energy.energyLevel,
      chakra: energy.dominantChakra,
      isToday: isSameDay(date, today)
    };
  });

  return (
    <div className="space-y-3">
      {weekData.map((day, index) => (
        <div key={index} className={cn(
          "flex items-center justify-between p-3 rounded-lg border transition-colors",
          day.isToday ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-border/30"
        )}>
          <div className="flex items-center space-x-3">
            <div className="text-center min-w-[40px]">
              <div className={cn(
                "text-xs font-medium",
                day.isToday ? "text-primary" : "text-muted-foreground"
              )}>
                {day.weekday}
              </div>
              <div className={cn(
                "text-sm font-semibold",
                day.isToday ? "text-primary" : "text-foreground"
              )}>
                {day.date.split('/')[1]}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-colors",
                      i < day.level 
                        ? day.isToday ? "bg-primary" : "bg-primary/70"
                        : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              
              <Badge 
                variant={day.isToday ? "default" : "outline"} 
                className="text-xs px-2 py-0.5"
              >
                {day.chakra === 'heart' ? '心轮' : 
                 day.chakra === 'throat' ? '喉轮' : 
                 day.chakra === 'crown' ? '顶轮' : 
                 day.chakra === 'root' ? '海底轮' :
                 day.chakra === 'sacral' ? '脐轮' :
                 day.chakra === 'solar' ? '太阳轮' :
                 day.chakra === 'third_eye' ? '眉心轮' : '脉轮'}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function CrystalCalendarPage() {
    const { t, language } = useLanguage();
    const { user, isAuthenticated, isAuthLoading } = useAuth();
    
    const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
    const [guidance, setGuidance] = useState<DailyGuidanceResult | null>(null);
    const [isLoadingGuidance, setIsLoadingGuidance] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfileDataOutput | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    
    useEffect(() => {
        if (!isAuthLoading && isAuthenticated && user) {
            setIsProfileLoading(true);
            getUserProfile(user.email)
                .then(profile => {
                    setUserProfile(profile);
                })
                .catch(err => {
                    console.error("Failed to load user profile", err);
                    setUserProfile(null);
                })
                .finally(() => {
                    setIsProfileLoading(false);
                });
        } else if (!isAuthLoading) {
            setIsProfileLoading(false);
            setUserProfile(null);
        }
    }, [user, isAuthenticated, isAuthLoading]);

    useEffect(() => {
        const fetchGuidanceForDate = async (targetDate: Date) => {
            if (!isAuthenticated || !user || !userProfile) {
                setIsLoadingGuidance(false);
                return;
            }

            // 只为今天及未来日期生成指导
            if (isBefore(startOfDay(targetDate), startOfToday())) {
                setGuidance(null);
                setError(null);
                setIsLoadingGuidance(false);
                return;
            }

            setIsLoadingGuidance(true);
            setError(null);
            setGuidance(null);

            try {
                const formattedDate = format(targetDate, "yyyy-MM-dd");
                 const result = await getDailyGuidance({ 
                     userProfile: userProfile, 
                     language, 
                     targetDate: formattedDate
                 });
                setGuidance(result);
            } catch (err) {
                console.error("Error fetching daily guidance:", err);
                setError(err instanceof Error ? err.message : '获取指导失败');
            } finally {
                setIsLoadingGuidance(false);
            }
        };

        if (!isAuthLoading && !isProfileLoading && selectedDate) {
            fetchGuidanceForDate(selectedDate);
        } else if (!isAuthLoading && !isProfileLoading) {
            setIsLoadingGuidance(false);
        }
    }, [selectedDate, isAuthenticated, user, isAuthLoading, language, userProfile, isProfileLoading]);

    if (isAuthLoading || isProfileLoading) {
        return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-4 text-lg">正在加载您的能量画像...</span>
                </div>
            </div>
        );
        }

        if (!isAuthenticated) {
            return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="text-center py-16">
                    <Card className="max-w-md mx-auto shadow-xl">
                    <CardHeader>
                            <CardTitle className="flex items-center justify-center">
                                <LogIn className="mr-2"/>
                                登录查看水晶日历
                            </CardTitle>
                    </CardHeader>
                        <CardContent>
                            <p>个性化的能量指导需要您先登录并创建能量画像</p>
                        </CardContent>
                    <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/login">立即登录</Link>
                            </Button>
                    </CardFooter>
                </Card>
                </div>
                </div>
            );
        }

    if (!userProfile && !isProfileLoading) {
            return (
            <div className="container mx-auto p-4 md:p-8">
                <div className="text-center py-16">
                    <Card className="max-w-md mx-auto shadow-xl">
                 <CardHeader>
                            <CardTitle className="flex items-center justify-center">
                                <FileText className="mr-2"/>
                                创建您的能量画像
                            </CardTitle>
                 </CardHeader>
                        <CardContent>
                            <p>要使用个性化的水晶日历，请先完成能量画像测评</p>
                        </CardContent>
                 <CardFooter>
                            <Button asChild className="w-full">
                                <Link href="/energy-exploration">开始测评</Link>
                            </Button>
                 </CardFooter>
               </Card>
                </div>
            </div>
        );
    }

    const energyState = generateEnergyPrediction(selectedDate, userProfile || undefined);
    
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            {/* 页面标题 */}
            <header className="text-center">
                <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text halo-effect flex items-center justify-center">
                    <Sparkles className="mr-3 h-10 w-10" />
                    水晶日历
                </h1>
                <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                    基于您独特的能量画像，为每一天提供个性化的水晶指导与能量洞察
                </p>
            </header>

            {/* 个人能量画像概览 - 5维图谱简化版 */}
            {userProfile && (
                <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-xl p-6 border border-primary/10">
                    <div className="flex flex-row gap-6 items-stretch">
                        <div style={{ minWidth: 260, flex: '0 0 260px' }}>
                            <ProfileSummaryCard profile={userProfile} />
                        </div>
                        <div className="flex-1">
                            <Card className="bg-background/50 backdrop-blur h-full flex flex-col justify-center">
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        {/* 简化的5维能量显示 */}
                                        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800">
                                            <Brain className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                                            <p className="text-xs font-medium text-blue-800 dark:text-blue-200">心智能量</p>
                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">85%</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-800">
                                            <Heart className="h-5 w-5 mx-auto mb-1 text-green-600" />
                                            <p className="text-xs font-medium text-green-800 dark:text-green-200">情感能量</p>
                                            <p className="text-sm font-bold text-green-600 dark:text-green-400">78%</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-800">
                                            <Sparkles className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                                            <p className="text-xs font-medium text-purple-800 dark:text-purple-200">灵性能量</p>
                                            <p className="text-sm font-bold text-purple-600 dark:text-purple-400">72%</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-950 border border-orange-100 dark:border-orange-800">
                                            <Mountain className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                                            <p className="text-xs font-medium text-orange-800 dark:text-orange-200">身体能量</p>
                                            <p className="text-sm font-bold text-orange-600 dark:text-orange-400">80%</p>
                                        </div>
                                        <div className="text-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-800">
                                            <Users className="h-5 w-5 mx-auto mb-1 text-indigo-600" />
                                            <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200">社交能量</p>
                                            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">75%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}

            {/* 主要功能标签页 */}
            <Tabs defaultValue="calendar" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="calendar" className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">日历</span>
                    </TabsTrigger>
                    <TabsTrigger value="trends" className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4" />
                        <span className="hidden sm:inline">趋势</span>
                    </TabsTrigger>
                    <TabsTrigger value="meditation" className="flex items-center space-x-2">
                        <Gem className="h-4 w-4" />
                        <span className="hidden sm:inline">冥想</span>
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="flex items-center space-x-2">
                        <Target className="h-4 w-4" />
                        <span className="hidden sm:inline">日程</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-6 mt-6">
                    <div className="grid lg:grid-cols-12 gap-6">
                        {/* 左侧：融合的日历和趋势板块 */}
                        <div className="lg:col-span-6">
                            <Card className="h-full">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center justify-between">
                                        <span className="flex items-center">
                                            <CalendarIcon className="mr-2 h-5 w-5" />
                                            个性化水晶日历
                                        </span>
                                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                            <TrendingUp className="h-4 w-4" />
                                            <span>能量趋势</span>
                                        </div>
                                    </CardTitle>
                                    <CardDescription>
                                        基于您的能量画像预测每日水晶指导和能量状态
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* 日历部分 */}
                                    <div className="calendar-container">
                                        <PersonalizedCalendar
                                            profile={userProfile || undefined}
                                            selectedDate={selectedDate}
                                            onDateSelect={setSelectedDate}
                                        />
                                    </div>
                                    
                                    {/* 分隔线 */}
                                    <div className="border-t border-border/50 my-4"></div>
                                    
                                    {/* 简化的能量趋势 */}
                                    <div className="trend-summary">
                                        <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
                                            <TrendingUp className="mr-2 h-4 w-4" />
                                            近期能量趋势
                                        </h4>
                                        <EnergyTrendView profile={userProfile || undefined} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 右侧：当日详细信息 */}
                        <div className="lg:col-span-6">
                            {isLoadingGuidance ? (
                                <div className="space-y-6">
                                    <Skeleton className="h-32 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                    <Skeleton className="h-24 w-full" />
                                </div>
                            ) : (
                                <EnergyInsightDisplay
                                    guidance={guidance || undefined}
                                    energyState={energyState}
                                    profile={userProfile || undefined}
                                />
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="trends" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* 基于用户画像的能量洞察 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Brain className="mr-2 h-5 w-5" />
                                    今日能量洞察
                                </CardTitle>
                                <CardDescription>
                                    基于您的个人特质为今天提供能量指导
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                                        <Zap className="mr-2 h-4 w-4" />
                                        主导能量特质
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {userProfile?.mbtiLikeType ? 
                                            `${userProfile.mbtiLikeType} 类型今天适合${energyState.mbtiMood}` :
                                            '根据五行元素，今天适合保持内在平衡'
                                        }
                                    </p>
                                </div>
                                
                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg border border-green-100 dark:border-green-800">
                                    <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                                        <Target className="mr-2 h-4 w-4" />
                                        能量建议
                                    </h3>
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        {energyState.mbtiMood} - {energyState.elementBalance}。
                                        建议今日多关注内在平衡，保持能量的和谐流动。
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 能量数值与状态 */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <BarChart3 className="mr-2 h-5 w-5" />
                                    能量状态监测
                                </CardTitle>
                                <CardDescription>
                                    实时显示您的多维度能量水平
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* 今日能量等级 */}
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                                    <span className="font-medium">今日能量等级</span>
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-4 w-4 ${
                                                        i < energyState.energyLevel 
                                                            ? 'text-yellow-500 fill-yellow-500' 
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <Badge variant="secondary">
                                            {energyState.energyLevel}/5
                                        </Badge>
                                    </div>
                                </div>

                                {/* 选择的日期 */}
                                <div className="text-center p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground mb-1">当前选择日期</p>
                                    <p className="text-lg font-medium">
                                        {format(selectedDate, 'yyyy年MM月dd日', { locale: zhCN })}
                                    </p>
                                    {format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') && (
                                        <Badge className="mt-2" variant="default">今天</Badge>
                                    )}
                                </div>

                                {/* 能量提醒 */}
                                <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-100 dark:border-purple-800">
                                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">
                                        💫 今日能量提醒
                                    </h4>
                                    <p className="text-xs text-purple-700 dark:text-purple-300">
                                        根据您的个人特质分析，今天是{energyState.energyLevel >= 4 ? '高能量' : energyState.energyLevel >= 3 ? '中等能量' : '低能量'}日，
                                        建议{energyState.energyLevel >= 4 ? '积极行动，把握机会' : energyState.energyLevel >= 3 ? '保持平衡，稳步前进' : '温和调养，积蓄力量'}。
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 详细能量图谱入口 */}
                    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center text-xl">
                                <Orbit className="mr-3 h-6 w-6 text-primary" />
                                完整能量图谱分析
                            </CardTitle>
                            <CardDescription className="text-base">
                                想要查看您的五维/八维完整能量分析？
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-4">
                                完整的能量图谱分析已整合到"能量探索"页面，提供更专业详细的多维度分析报告
                            </p>
                            <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                                <Link href="/energy-exploration">
                                    <Orbit className="mr-2 h-4 w-4" />
                                    前往能量探索页面
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 快速链接 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <CalendarIcon className="h-8 w-8 mx-auto mb-3 text-primary" />
                                <h3 className="font-semibold mb-2">回到日历</h3>
                                <p className="text-sm text-muted-foreground">查看每日水晶指导</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Gem className="h-8 w-8 mx-auto mb-3 text-primary" />
                                <h3 className="font-semibold mb-2">水晶冥想</h3>
                                <p className="text-sm text-muted-foreground">开启冥想练习</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                            <CardContent className="p-6 text-center">
                                <Target className="h-8 w-8 mx-auto mb-3 text-primary" />
                                <h3 className="font-semibold mb-2">制定计划</h3>
                                <p className="text-sm text-muted-foreground">基于能量安排日程</p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="meditation" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Gem className="mr-2 h-5 w-5" />
                                水晶冥想指导
                            </CardTitle>
                            <CardDescription>
                                基于今日推荐水晶的冥想练习
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 rounded-lg">
                                    <h3 className="font-medium mb-2">今日推荐水晶: {energyState.recommendedCrystal}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        将{energyState.recommendedCrystal}握在手中，闭上眼睛，深呼吸，感受水晶的能量与您的{energyState.dominantChakra}脉轮共振。
                                    </p>
                                </div>
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">冥想功能正在开发中...</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="mr-2 h-5 w-5" />
                                个性化日程建议
                            </CardTitle>
                            <CardDescription>
                                基于能量状态的日程安排建议
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-lg">
                                    <h3 className="font-medium mb-2">今日建议活动</h3>
                                    <p className="text-sm text-muted-foreground">
                                        根据您{energyState.energyLevel}/5的能量水平，建议
                                        {energyState.energyLevel >= 4 ? '安排重要会议或创意工作' : 
                                         energyState.energyLevel >= 3 ? '进行日常工作和社交活动' : 
                                         '专注于休息和内省活动'}。
                                    </p>
                                </div>
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">智能日程功能正在开发中...</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>
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
