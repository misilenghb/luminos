"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Gem, Sun, Moon, Heart, Brain, Sparkles, Star, Target, TrendingUp,
  CheckCircle, Clock, Zap, Play,
  Activity, AlertTriangle, BarChart3, Users, Eye, Crown, Mountain, Droplets,
  Wind, Flame, Shield
} from 'lucide-react';
import CrystalDayPicker from '@/components/CrystalDayPicker';
import { format, isSameDay, getDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { getDailyGuidance } from '@/ai/flows/daily-guidance-flow';
import { cn } from '@/lib/utils';

// 类型定义
interface DailyGuidanceResult {
  guidance: string;
  meditationPrompt: string;
  date: string;
  language: string;
}

interface EnergyState {
  energyLevel: number;
  dominantChakra: string;
  recommendedCrystal: string;
  mbtiMood: string;
  elementBalance: string;
}

interface DashboardInsight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
}

// 优化的能量预测算法 - 基于多维度分析
const generateEnergyPrediction = (date: Date, profile?: UserProfileDataOutput): EnergyState => {
  const dayOfWeek = getDay(date);
  const dayOfMonth = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  // 基础生物节律计算
  const physicalCycle = Math.sin((2 * Math.PI * (date.getTime() - new Date(year, 0, 1).getTime())) / (23 * 24 * 60 * 60 * 1000));
  const emotionalCycle = Math.sin((2 * Math.PI * (date.getTime() - new Date(year, 0, 1).getTime())) / (28 * 24 * 60 * 60 * 1000));
  const intellectualCycle = Math.sin((2 * Math.PI * (date.getTime() - new Date(year, 0, 1).getTime())) / (33 * 24 * 60 * 60 * 1000));

  // MBTI类型影响因子
  let mbtiEnergyModifier = 1.0;
  if (profile?.mbtiLikeType) {
    const mbti = profile.mbtiLikeType;
    // 外向者在工作日能量更高，内向者在周末能量更高
    if (mbti.includes('E')) {
      mbtiEnergyModifier = dayOfWeek >= 1 && dayOfWeek <= 5 ? 1.2 : 0.9;
    } else if (mbti.includes('I')) {
      mbtiEnergyModifier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.2 : 0.8;
    }

    // 感知者在月末能量波动更大
    if (mbti.includes('P')) {
      mbtiEnergyModifier *= dayOfMonth > 25 ? 0.9 : 1.1;
    }
  }

  // 星座季节性影响
  let zodiacModifier = 1.0;
  if (profile?.inferredZodiac) {
    const zodiacSeasons = {
      'Aries': [2, 3, 4], 'Taurus': [3, 4, 5], 'Gemini': [4, 5, 6],
      'Cancer': [5, 6, 7], 'Leo': [6, 7, 8], 'Virgo': [7, 8, 9],
      'Libra': [8, 9, 10], 'Scorpio': [9, 10, 11], 'Sagittarius': [10, 11, 0],
      'Capricorn': [11, 0, 1], 'Aquarius': [0, 1, 2], 'Pisces': [1, 2, 3]
    };

    const currentSeason = zodiacSeasons[profile.inferredZodiac as keyof typeof zodiacSeasons];
    if (currentSeason && currentSeason.includes(month)) {
      zodiacModifier = 1.15; // 本命季节能量提升
    }
  }

  // 元素影响（基于中医五行理论）
  let elementModifier = 1.0;
  if (profile?.inferredElement) {
    const elementCycles = {
      'Fire': dayOfWeek === 2 ? 1.2 : 1.0, // 火对应周二（火星日）
      'Earth': dayOfWeek === 6 ? 1.2 : 1.0, // 土对应周六（土星日）
      'Metal': dayOfWeek === 5 ? 1.2 : 1.0, // 金对应周五（金星日）
      'Water': dayOfWeek === 3 ? 1.2 : 1.0, // 水对应周三（水星日）
      'Wood': dayOfWeek === 4 ? 1.2 : 1.0   // 木对应周四（木星日）
    };
    elementModifier = elementCycles[profile.inferredElement as keyof typeof elementCycles] || 1.0;
  }

  // 综合能量计算
  const baseEnergy = 3; // 基础能量值
  const biorhythmInfluence = (physicalCycle + emotionalCycle + intellectualCycle) / 3;
  const weekdayInfluence = dayOfWeek === 0 || dayOfWeek === 6 ? 0.9 : 1.1; // 周末稍低

  const finalEnergy = Math.max(1, Math.min(5, Math.round(
    baseEnergy +
    (biorhythmInfluence * 1.5) +
    (mbtiEnergyModifier - 1) * 2 +
    (zodiacModifier - 1) * 1.5 +
    (elementModifier - 1) * 1.2 +
    (weekdayInfluence - 1) * 0.8
  )));

  // 智能脉轮选择 - 基于能量状态和个人特质
  const chakras = ['根轮', '脐轮', '太阳神经丛', '心轮', '喉轮', '眉心轮', '顶轮'];
  let dominantChakra = chakras[dayOfMonth % chakras.length];

  // 根据MBTI调整主导脉轮
  if (profile?.mbtiLikeType) {
    const mbti = profile.mbtiLikeType;
    if (mbti.includes('T')) dominantChakra = '太阳神经丛'; // 思维型偏向意志力中心
    else if (mbti.includes('F')) dominantChakra = '心轮'; // 情感型偏向情感中心
    if (mbti.includes('N')) dominantChakra = '眉心轮'; // 直觉型偏向洞察中心
    if (mbti.includes('E')) dominantChakra = '喉轮'; // 外向型偏向表达中心
  }

  // 智能水晶推荐系统
  const crystalRecommendation = getSmartCrystalRecommendation(finalEnergy, dominantChakra, profile);

  // 智能情绪状态分析
  const moodStates = [
    '深度内省', '创意涌现', '理性清晰', '情感丰富', '直觉敏锐',
    '能量充沛', '平静安详', '专注集中', '灵感迸发', '和谐平衡'
  ];

  let mbtiMood = moodStates[dayOfWeek % moodStates.length];

  // 根据能量水平调整情绪状态
  if (finalEnergy >= 4) {
    mbtiMood = ['能量充沛', '创意涌现', '灵感迸发'][Math.floor(Math.random() * 3)];
  } else if (finalEnergy <= 2) {
    mbtiMood = ['深度内省', '平静安详', '和谐平衡'][Math.floor(Math.random() * 3)];
  }

  return {
    energyLevel: finalEnergy,
    dominantChakra,
    recommendedCrystal: crystalRecommendation,
    mbtiMood,
    elementBalance: profile?.inferredElement || '火'
  };
};

// 智能水晶推荐函数
const getSmartCrystalRecommendation = (energyLevel: number, chakra: string, profile?: UserProfileDataOutput): string => {
  // 基于脉轮的水晶对应关系
  const chakraCrystals = {
    '根轮': ['红玛瑙', '黑曜石', '赤铁矿', '石榴石'],
    '脐轮': ['橙色方解石', '太阳石', '虎眼石', '红玉髓'],
    '太阳神经丛': ['黄水晶', '琥珀', '黄玉', '金发晶'],
    '心轮': ['玫瑰石英', '绿松石', '翡翠', '绿幽灵'],
    '喉轮': ['青金石', '海蓝宝', '蓝晶石', '天河石'],
    '眉心轮': ['紫水晶', '萤石', '拉长石', '青金石'],
    '顶轮': ['白水晶', '紫水晶', '透明石英', '月光石']
  };

  // 基于能量水平的调整
  const energyBasedCrystals = {
    1: ['黑曜石', '赤铁矿', '烟晶'], // 低能量 - 保护和稳定
    2: ['玫瑰石英', '月光石', '绿幽灵'], // 较低能量 - 治愈和恢复
    3: ['白水晶', '紫水晶', '绿松石'], // 中等能量 - 平衡和净化
    4: ['黄水晶', '太阳石', '红玛瑙'], // 较高能量 - 激活和增强
    5: ['金发晶', '石榴石', '虎眼石'] // 高能量 - 放大和聚焦
  };

  // 获取脉轮对应的水晶
  const chakraOptions = chakraCrystals[chakra as keyof typeof chakraCrystals] || ['白水晶'];
  const energyOptions = energyBasedCrystals[energyLevel as keyof typeof energyBasedCrystals] || ['白水晶'];

  // 寻找交集，如果没有交集则优先考虑脉轮匹配
  const intersection = chakraOptions.filter(crystal => energyOptions.includes(crystal));

  if (intersection.length > 0) {
    return intersection[Math.floor(Math.random() * intersection.length)];
  }

  // 如果没有交集，根据MBTI类型进行个性化推荐
  if (profile?.mbtiLikeType) {
    const mbti = profile.mbtiLikeType;
    if (mbti.includes('T')) return '黄水晶'; // 思维型 - 增强理性思考
    if (mbti.includes('F')) return '玫瑰石英'; // 情感型 - 增强情感治愈
    if (mbti.includes('N')) return '紫水晶'; // 直觉型 - 增强直觉洞察
    if (mbti.includes('S')) return '红玛瑙'; // 感觉型 - 增强现实感知
  }

  // 默认返回脉轮对应的第一个水晶
  return chakraOptions[0];
};

// 增强的个性化洞察生成系统
const generateInsights = (profile?: UserProfileDataOutput, energyState?: EnergyState): DashboardInsight[] => {
  const insights: DashboardInsight[] = [];
  const currentHour = new Date().getHours();

  // 基于MBTI的深度洞察
  if (profile?.mbtiLikeType) {
    const mbti = profile.mbtiLikeType;

    // 能量方向洞察
    if (mbti.includes('E')) {
      if (currentHour >= 9 && currentHour <= 17) {
        insights.push({
          type: 'positive',
          title: '外向者黄金时段',
          description: '现在是你与他人互动和协作的最佳时机，你的社交能量正处于高峰',
          action: '安排团队会议或社交活动',
          icon: <Users className="h-4 w-4" />
        });
      } else {
        insights.push({
          type: 'neutral',
          title: '外向者充电建议',
          description: '虽然你偏好社交，但此时适合为明天的互动做准备',
          action: '回顾今日社交收获，规划明日互动',
          icon: <Brain className="h-4 w-4" />
        });
      }
    } else if (mbti.includes('I')) {
      if (currentHour < 9 || currentHour > 18) {
        insights.push({
          type: 'positive',
          title: '内向者专注时光',
          description: '这是你深度思考和独立工作的黄金时段，内在能量正在积聚',
          action: '进行深度思考或创意工作',
          icon: <Brain className="h-4 w-4" />
        });
      } else {
        insights.push({
          type: 'warning',
          title: '内向者能量管理',
          description: '社交活动可能消耗你的能量，记得适时休息恢复',
          action: '每2小时安排10分钟独处时间',
          icon: <Clock className="h-4 w-4" />
        });
      }
    }

    // 信息处理方式洞察
    if (mbti.includes('N')) {
      insights.push({
        type: 'positive',
        title: '直觉型创意激发',
        description: '你的直觉天赋让你能看到别人看不到的可能性和联系',
        action: '尝试头脑风暴或概念性思考',
        icon: <Sparkles className="h-4 w-4" />
      });
    } else if (mbti.includes('S')) {
      insights.push({
        type: 'neutral',
        title: '感觉型实践优势',
        description: '你擅长关注细节和实际操作，这是你的核心优势',
        action: '专注于具体任务和实际执行',
        icon: <Target className="h-4 w-4" />
      });
    }

    // 决策方式洞察
    if (mbti.includes('T')) {
      insights.push({
        type: 'neutral',
        title: '思维型逻辑分析',
        description: '你的理性分析能力是解决复杂问题的关键工具',
        action: '处理需要逻辑分析的任务',
        icon: <BarChart3 className="h-4 w-4" />
      });
    } else if (mbti.includes('F')) {
      insights.push({
        type: 'positive',
        title: '情感型和谐建立',
        description: '你的情感智慧能够创造和谐的人际关系和工作环境',
        action: '关注团队情感需求和人际和谐',
        icon: <Heart className="h-4 w-4" />
      });
    }
  }

  // 基于能量水平的动态建议
  if (energyState) {
    switch (energyState.energyLevel) {
      case 5:
        insights.push({
          type: 'positive',
          title: '能量巅峰状态',
          description: '你正处于能量的最高峰，这是突破自我、挑战困难任务的绝佳时机',
          action: '挑战最困难的项目或学习新技能',
          icon: <TrendingUp className="h-4 w-4" />
        });
        break;
      case 4:
        insights.push({
          type: 'positive',
          title: '高能量状态',
          description: '你的能量充沛，适合处理重要任务和创造性工作',
          action: '专注于重要项目和创意工作',
          icon: <Zap className="h-4 w-4" />
        });
        break;
      case 3:
        insights.push({
          type: 'neutral',
          title: '平衡能量状态',
          description: '你的能量处于平衡状态，适合稳定推进各项任务',
          action: '保持当前节奏，稳步前进',
          icon: <CheckCircle className="h-4 w-4" />
        });
        break;
      case 2:
        insights.push({
          type: 'warning',
          title: '能量偏低',
          description: '你的能量有所下降，建议专注于轻松的任务和自我恢复',
          action: '选择轻松任务，注意休息恢复',
          icon: <AlertTriangle className="h-4 w-4" />
        });
        break;
      case 1:
        insights.push({
          type: 'warning',
          title: '能量低谷期',
          description: '现在是休息和恢复的时候，避免高强度任务',
          action: '优先休息，进行冥想或轻松活动',
          icon: <Moon className="h-4 w-4" />
        });
        break;
    }

    // 基于主导脉轮的专业建议
    const chakraInsights = {
      '根轮': {
        type: 'neutral' as const,
        title: '根轮能量 - 稳定基础',
        description: '专注于建立稳定的基础和安全感，处理实际事务',
        action: '整理环境，处理基础事务，增强安全感',
        icon: <Mountain className="h-4 w-4" />
      },
      '脐轮': {
        type: 'positive' as const,
        title: '脐轮能量 - 创造活力',
        description: '创造力和热情正在涌现，适合艺术创作和情感表达',
        action: '进行创意活动，表达真实情感',
        icon: <Flame className="h-4 w-4" />
      },
      '太阳神经丛': {
        type: 'positive' as const,
        title: '太阳神经丛 - 意志力量',
        description: '个人力量和自信心增强，适合领导和决策',
        action: '承担领导责任，做重要决策',
        icon: <Sun className="h-4 w-4" />
      },
      '心轮': {
        type: 'positive' as const,
        title: '心轮能量 - 爱与连接',
        description: '爱与同理心的能量强烈，适合人际关系和情感治愈',
        action: '加深人际关系，进行情感治愈',
        icon: <Heart className="h-4 w-4" />
      },
      '喉轮': {
        type: 'neutral' as const,
        title: '喉轮能量 - 真实表达',
        description: '沟通和表达能力增强，适合分享想法和创作',
        action: '进行重要沟通，分享你的想法',
        icon: <Wind className="h-4 w-4" />
      },
      '眉心轮': {
        type: 'positive' as const,
        title: '眉心轮 - 直觉洞察',
        description: '直觉和洞察力达到高峰，适合深度思考和灵性探索',
        action: '冥想思考，相信你的直觉',
        icon: <Eye className="h-4 w-4" />
      },
      '顶轮': {
        type: 'positive' as const,
        title: '顶轮能量 - 灵性连接',
        description: '灵性觉知和智慧达到新高度，适合哲学思考',
        action: '进行灵性实践，探索生命意义',
        icon: <Crown className="h-4 w-4" />
      }
    };

    const chakraInsight = chakraInsights[energyState.dominantChakra as keyof typeof chakraInsights];
    if (chakraInsight) {
      insights.push(chakraInsight);
    }

    // 基于推荐水晶的使用建议
    const crystalGuidance = getCrystalUsageGuidance(energyState.recommendedCrystal);
    if (crystalGuidance) {
      insights.push(crystalGuidance);
    }
  }

  // 基于星座的季节性建议
  if (profile?.inferredZodiac) {
    const zodiacAdvice = getZodiacSeasonalAdvice(profile.inferredZodiac);
    if (zodiacAdvice) {
      insights.push(zodiacAdvice);
    }
  }

  return insights.slice(0, 6); // 限制显示最多6个洞察
};

// 水晶使用指导
const getCrystalUsageGuidance = (crystal: string): DashboardInsight | null => {
  const crystalGuidance = {
    '紫水晶': {
      type: 'neutral' as const,
      title: '紫水晶冥想指导',
      description: '紫水晶能增强直觉和精神清晰度，适合冥想和灵性探索',
      action: '将紫水晶放在第三眼位置冥想15分钟',
      icon: <Gem className="h-4 w-4" />
    },
    '玫瑰石英': {
      type: 'positive' as const,
      title: '玫瑰石英情感治愈',
      description: '玫瑰石英是爱的石头，能治愈情感创伤，增强自爱',
      action: '将玫瑰石英放在心脏附近，进行爱的冥想',
      icon: <Heart className="h-4 w-4" />
    },
    '白水晶': {
      type: 'neutral' as const,
      title: '白水晶能量净化',
      description: '白水晶是万能的净化石，能清理负能量，增强其他水晶效果',
      action: '用白水晶净化空间和其他水晶',
      icon: <Sparkles className="h-4 w-4" />
    },
    '黑曜石': {
      type: 'warning' as const,
      title: '黑曜石保护屏障',
      description: '黑曜石提供强大的保护能量，帮助抵御负面影响',
      action: '随身携带黑曜石，建立能量保护屏障',
      icon: <Shield className="h-4 w-4" />
    },
    '黄水晶': {
      type: 'positive' as const,
      title: '黄水晶财富显化',
      description: '黄水晶能增强自信和显化能力，特别是财富和成功',
      action: '将黄水晶放在工作区域，设定明确目标',
      icon: <Star className="h-4 w-4" />
    }
  };

  return crystalGuidance[crystal as keyof typeof crystalGuidance] || null;
};

// 星座季节性建议
const getZodiacSeasonalAdvice = (zodiac: string): DashboardInsight | null => {
  const currentMonth = new Date().getMonth();

  // 简化的星座季节建议
  const zodiacAdvice = {
    'Aries': currentMonth >= 2 && currentMonth <= 4 ? {
      type: 'positive' as const,
      title: '白羊座能量季节',
      description: '这是你的能量季节，勇气和行动力达到巅峰',
      action: '开始新项目，展现领导力',
      icon: <Flame className="h-4 w-4" />
    } : null,
    'Cancer': currentMonth >= 5 && currentMonth <= 7 ? {
      type: 'positive' as const,
      title: '巨蟹座情感季节',
      description: '情感和直觉力量增强，适合关注家庭和内在成长',
      action: '加深情感连接，关注内在需求',
      icon: <Heart className="h-4 w-4" />
    } : null,
    'Libra': currentMonth >= 8 && currentMonth <= 10 ? {
      type: 'positive' as const,
      title: '天秤座平衡季节',
      description: '和谐与美感的能量增强，适合艺术创作和关系建立',
      action: '追求平衡，创造美好事物',
      icon: <Star className="h-4 w-4" />
    } : null,
    'Capricorn': currentMonth >= 11 || currentMonth <= 1 ? {
      type: 'neutral' as const,
      title: '摩羯座成就季节',
      description: '实用主义和目标导向的能量增强，适合规划和执行',
      action: '制定长期计划，专注目标实现',
      icon: <Target className="h-4 w-4" />
    } : null
  };

  return zodiacAdvice[zodiac as keyof typeof zodiacAdvice] || null;
};

export default function IntegratedCrystalCalendarPage(): JSX.Element {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'guidance' | 'meditation' | 'insights'>('overview');
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

  // 智能内容状态
  const [guidance, setGuidance] = useState<DailyGuidanceResult | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // 任务完成状态
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // 加载用户档案
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.email) {
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);
        const { profileService } = await import('@/lib/supabase');
        const savedProfile = await profileService.getUserProfileByEmail(user.email);
        
        if (savedProfile && savedProfile.personality_insights) {
          const profileData: UserProfileDataOutput = {
            name: savedProfile.name,
            coreEnergyInsights: savedProfile.personality_insights,
            inferredZodiac: savedProfile.zodiac_sign || '',
            inferredChineseZodiac: savedProfile.chinese_zodiac || '',
            inferredElement: savedProfile.element || '',
            inferredPlanet: 'Mars',
            mbtiLikeType: savedProfile.mbti || '',
            chakraAnalysis: savedProfile.chakra_analysis && typeof savedProfile.chakra_analysis === 'object' ? 
              '您的脉轮能量分析已完成，请查看下方的脉轮能量图谱了解详细信息。' : 
              (typeof savedProfile.chakra_analysis === 'string' ? savedProfile.chakra_analysis : ''),
          };
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // 获取AI指导
  const fetchGuidanceForDate = useCallback(async (targetDate: Date) => {
    if (!profile || profileLoading) return;

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
  }, [profile, profileLoading]);

  // 日期变更时获取指导
  useEffect(() => {
    if (profile && !profileLoading) {
      fetchGuidanceForDate(selectedDate);
    }
  }, [selectedDate, profile, profileLoading, fetchGuidanceForDate]);

  const energyState = generateEnergyPrediction(selectedDate, profile);
  const insights = generateInsights(profile, energyState);

  // 任务切换功能
  const toggleTask = (taskName: string) => {
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskName)) {
        newSet.delete(taskName);
      } else {
        newSet.add(taskName);
      }
      return newSet;
    });
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-success/20 bg-success/5';
      case 'warning': return 'border-warning/20 bg-warning/5';
      default: return 'border-primary/20 bg-primary/5';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 - 量子风格 */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-b border-primary/10">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold heading-enhanced mb-3">
              ✨ 水晶能量日历
            </h1>
            <p className="text-muted-foreground text-lg">
              探索您的内在能量，与宇宙频率共振
            </p>
          </div>
        </div>
      </div>

      {/* 页面标题 - 量子共振风格 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 energy-gradient bg-clip-text text-transparent">
          ✨ 水晶能量日历
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          基于科学心理学和古老智慧的个性化能量管理
        </p>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 主要内容区域 - 量子共振布局 */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* 左侧：日历和快速信息 */}
          <div className="xl:col-span-1 space-y-6">
            {/* 日历 - 量子风格 */}
            <div className="quantum-card energy-card">
              <CrystalDayPicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                energyLevel={energyState.energyLevel}
                crystalRecommendation={energyState.recommendedCrystal}
                dominantChakra={energyState.dominantChakra}
                variant="default"
              />
            </div>

            {/* 今日能量概览 - 量子风格 */}
            <Card className="quantum-card energy-card quantum-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  能量概览
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* 能量等级显示 - 量子风格 */}
                <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="text-3xl font-bold energy-gradient bg-clip-text text-transparent mb-3">
                    {energyState.energyLevel}/5
                  </div>
                  <div className="flex justify-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          level <= energyState.energyLevel
                            ? 'bg-primary shadow-lg shadow-primary/30'
                            : 'bg-muted/50'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {energyState.energyLevel >= 4 ? '✨ 能量充沛' :
                     energyState.energyLevel >= 3 ? '🌟 状态良好' :
                     energyState.energyLevel >= 2 ? '⚡ 需要关注' : '🔋 建议休息'}
                  </div>
                </div>

                {/* 主导脉轮 - 量子风格 */}
                <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-lg p-4 border border-secondary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-full bg-secondary/20 text-secondary">
                      <Crown className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-secondary">主导脉轮</span>
                  </div>
                  <div className="text-base font-semibold text-foreground">{energyState.dominantChakra}</div>
                </div>

                {/* 情绪状态 - 量子风格 */}
                <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-4 border border-accent/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-full bg-accent/20 text-accent">
                      <Heart className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-accent">情绪状态</span>
                  </div>
                  <div className="text-base font-semibold text-foreground">{energyState.mbtiMood}</div>
                </div>
              </CardContent>
            </Card>

            {/* 推荐水晶 - 量子风格 */}
            <Card className="quantum-card energy-card quantum-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent ">
                    <Gem className="h-4 w-4" />
                  </div>
                  推荐水晶
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* 主要推荐水晶 - 量子风格 */}
                <div className="text-center bg-gradient-to-br from-accent/10 to-primary/10 rounded-xl p-6 border border-accent/20">
                  <div className="text-3xl mb-3 ">💎</div>
                  <div className="font-bold text-lg mb-2 energy-gradient bg-clip-text text-transparent">
                    {energyState.recommendedCrystal}
                  </div>
                  <div className="text-sm text-muted-foreground">✨ 今日推荐</div>
                </div>

                {/* 水晶属性 - 量子风格 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                    <span className="text-sm text-muted-foreground">对应脉轮</span>
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary border-secondary/20">
                      {energyState.dominantChakra}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <span className="text-sm text-muted-foreground">能量类型</span>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {energyState.elementBalance}元素
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 每日能量任务 - 量子风格 */}
            <Card className="quantum-card energy-card quantum-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg heading-enhanced flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-success/10 text-success ">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  每日能量任务
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    task: "晨间冥想",
                    duration: "10分钟",
                    completed: false,
                    icon: "🧘‍♀️",
                    description: "使用推荐水晶进行冥想"
                  },
                  {
                    task: "能量记录",
                    duration: "5分钟",
                    completed: false,
                    icon: "📝",
                    description: "记录当前的能量状态和感受"
                  },
                  {
                    task: "水晶净化",
                    duration: "3分钟",
                    completed: false,
                    icon: "✨",
                    description: "清洁和净化您的水晶"
                  },
                  {
                    task: "感恩练习",
                    duration: "5分钟",
                    completed: false,
                    icon: "🙏",
                    description: "列出今日三件感恩的事"
                  }
                ].map((item, index) => {
                  const isCompleted = completedTasks.has(item.task);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/60 hover:bg-white/80 transition-colors cursor-pointer"
                      onClick={() => toggleTask(item.task)}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'border-success bg-success'
                            : 'border-success/50'
                        }`}>
                          {isCompleted && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg ">{item.icon}</span>
                          <span className={`text-sm font-medium ${
                            isCompleted
                              ? 'text-success line-through'
                              : 'text-foreground'
                          }`}>
                            {item.task}
                          </span>
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                            {item.duration}
                          </Badge>
                        </div>
                        <p className={`text-xs ${
                          isCompleted
                            ? 'text-success/70'
                            : 'text-muted-foreground'
                        }`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-success/10 to-accent/10 border border-success/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-foreground">今日完成度</span>
                    <span className="text-sm font-bold energy-gradient bg-clip-text text-transparent">
                      {completedTasks.size}/4
                    </span>
                  </div>
                  <div className="w-full bg-muted/30 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-success to-accent h-3 rounded-full transition-all duration-500 energy-gradient"
                      style={{ width: `${(completedTasks.size / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 能量提醒 - 量子风格 */}
            <Card className="quantum-card energy-card quantum-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg heading-enhanced flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning ">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  能量提醒
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-warning/10 to-accent/10 border border-warning/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-full bg-warning/20 text-warning">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">最佳冥想时间</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    根据您的能量周期，建议在早上7-9点或晚上7-9点进行冥想练习
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-full bg-accent/20 text-accent ">
                      <Sun className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">能量补充建议</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    当感到能量低落时，可以到户外接触阳光，或者握住您的推荐水晶进行5分钟深呼吸
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：主要内容区域 */}
          <div className="xl:col-span-4 space-y-6">


            {/* 能量统计仪表板 - 量子风格 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* 今日能量指数 */}
              <Card className="quantum-card quantum-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl ">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold energy-gradient bg-clip-text text-transparent">
                        {energyState.energyLevel}
                      </div>
                      <div className="text-xs text-muted-foreground">能量指数</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 脉轮活跃度 */}
              <Card className="quantum-card quantum-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-secondary/10 rounded-xl ">
                      <Crown className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{energyState.dominantChakra}</div>
                      <div className="text-xs text-muted-foreground">主导脉轮</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 情绪状态 */}
              <Card className="quantum-card quantum-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-xl ">
                      <Heart className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{energyState.mbtiMood}</div>
                      <div className="text-xs text-muted-foreground">情绪状态</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 元素平衡 */}
              <Card className="quantum-card quantum-hover">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-warning/10 rounded-xl ">
                      {energyState.elementBalance === '火' && <Flame className="h-5 w-5 text-warning" />}
                      {energyState.elementBalance === '水' && <Droplets className="h-5 w-5 text-primary" />}
                      {energyState.elementBalance === '风' && <Wind className="h-5 w-5 text-secondary" />}
                      {energyState.elementBalance === '土' && <Mountain className="h-5 w-5 text-accent" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{energyState.elementBalance}元素</div>
                      <div className="text-xs text-muted-foreground">主导元素</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 每周能量趋势图 - 量子风格 */}
            <Card className="quantum-card energy-card quantum-hover">
              <CardHeader className="pb-4">
                <CardTitle className="heading-enhanced flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary ">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  本周能量趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {eachDayOfInterval({
                    start: startOfWeek(selectedDate),
                    end: endOfWeek(selectedDate)
                  }).map((day, index) => {
                    const dayEnergy = generateEnergyPrediction(day, profile);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                      <div
                        key={index}
                        className={`text-center p-4 rounded-xl transition-all cursor-pointer quantum-hover ${
                          isSelected
                            ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-lg '
                            : isToday
                              ? 'bg-gradient-to-br from-accent/20 to-primary/20 text-foreground border-2 border-accent'
                              : 'bg-muted/30 hover:bg-muted/50 text-foreground'
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="text-xs font-medium mb-2">
                          {format(day, 'EEE', { locale: zhCN })}
                        </div>
                        <div className={`text-xl font-bold mb-2 ${
                          isSelected ? 'text-white' : 'energy-gradient bg-clip-text text-transparent'
                        }`}>
                          {dayEnergy.energyLevel}
                        </div>
                        <div className={`text-xs mb-3 ${isSelected ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {format(day, 'dd', { locale: zhCN })}
                        </div>
                        {/* 能量条 - 量子风格 */}
                        <div className={`w-full rounded-full h-2 ${isSelected ? 'bg-white/30' : 'bg-muted/50'}`}>
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              isSelected ? 'bg-white energy-gradient' : 'energy-gradient'
                            }`}
                            style={{ width: `${(dayEnergy.energyLevel / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 趋势说明 - 量子风格 */}
                <div className="mt-6 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/20 text-primary ">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <span className="text-base font-medium text-foreground">✨ 趋势分析</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    本周您的能量呈现<span className="font-medium text-primary">
                    {energyState.energyLevel >= 4 ? '上升' : energyState.energyLevel >= 3 ? '稳定' : '波动'}</span>趋势，
                    建议<span className="font-medium text-secondary">
                    {energyState.energyLevel >= 4 ? '保持当前的良好状态' : energyState.energyLevel >= 3 ? '继续维持规律的练习' : '加强冥想和水晶疗愈'}</span>。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 标签页导航 - 量子风格 */}
            <Card className="quantum-card energy-card">
              <CardHeader className="pb-4">
                <div className="flex justify-center">
                  <div className="flex bg-gradient-to-r from-muted/20 to-muted/30 p-2 rounded-2xl shadow-lg backdrop-blur-sm">
                    {[
                      { id: 'overview', label: '概览', icon: BarChart3 },
                      { id: 'guidance', label: '指引', icon: Star },
                      { id: 'meditation', label: '冥想', icon: Gem },
                      { id: 'insights', label: '洞察', icon: Brain }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 quantum-hover",
                            activeTab === tab.id
                              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg scale-105 "
                              : "text-muted-foreground hover:text-foreground hover:bg-background/70 hover:shadow-md"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {/* 内容区域 */}
                <div className="min-h-[400px]">
                  {/* 概览标签页 */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* 今日洞察 */}
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          今日洞察
                        </h3>
                        <div className="space-y-3">
                          {insights.map((insight, index) => (
                            <div 
                              key={index}
                              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
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
                      </div>

                      {/* 能量趋势 */}
                      <div>
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          能量趋势
                        </h3>
                        <div className="grid grid-cols-7 gap-2">
                          {eachDayOfInterval({
                            start: startOfWeek(selectedDate),
                            end: endOfWeek(selectedDate)
                          }).map((day, index) => {
                            const dayEnergy = generateEnergyPrediction(day, profile);
                            return (
                              <div key={index} className="text-center p-2 rounded-lg bg-muted/50">
                                <div className="text-xs text-muted-foreground">
                                  {format(day, 'EEE', { locale: zhCN })}
                                </div>
                                <div className="text-lg font-bold text-primary mt-1">
                                  {dayEnergy.energyLevel}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 今日指引标签页 */}
                  {activeTab === 'guidance' && (
                    <div className="space-y-6">
                      {/* AI个性化指引 */}
                      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-primary/20 rounded-lg text-primary ">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">今日AI指引</h3>
                            <p className="text-sm text-muted-foreground">基于您的能量状态和星座运势</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-background/70 p-4 rounded-lg border border-primary/10">
                            <h4 className="font-medium text-foreground mb-2">🌟 能量建议</h4>
                            <p className="text-sm text-muted-foreground">
                              今日您的{energyState.dominantChakra}能量较为活跃，建议进行相关的冥想练习。
                              推荐使用{energyState.recommendedCrystal}来平衡和增强您的能量场。
                            </p>
                          </div>
                          <div className="bg-background/70 p-4 rounded-lg border border-primary/10">
                            <h4 className="font-medium text-foreground mb-2">💎 水晶使用指南</h4>
                            <p className="text-sm text-muted-foreground">
                              将{energyState.recommendedCrystal}放置在您的工作区域或随身携带，
                              有助于提升专注力和创造力。建议在冥想时握在手中，感受其能量振动。
                            </p>
                          </div>
                          <div className="bg-background/70 p-4 rounded-lg border border-primary/10">
                            <h4 className="font-medium text-foreground mb-2">🧘 今日修行重点</h4>
                            <p className="text-sm text-muted-foreground">
                              专注于{energyState.mbtiMood}的情绪状态，通过深呼吸和正念练习来保持内心平静。
                              建议在{energyState.elementBalance}元素的引导下进行能量调和。
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 每日肯定语 */}
                      <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-6 rounded-xl border border-secondary/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-secondary/20 rounded-lg text-secondary ">
                            <Heart className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold text-foreground">今日肯定语</h3>
                        </div>
                        <div className="text-center p-4 bg-background/70 rounded-lg border border-secondary/10">
                          <p className="text-lg font-medium text-foreground italic energy-gradient bg-clip-text text-transparent">
                            "我与宇宙的能量和谐共振，每一刻都充满无限可能"
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            重复这句肯定语，让正能量充满您的一天
                          </p>
                        </div>
                      </div>

                      {/* 行动建议 */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-success/10 to-accent/10 p-4 rounded-lg border border-success/20">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="h-4 w-4 text-success" />
                            <h4 className="font-medium text-foreground">建议行动</h4>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3" />
                              晨间冥想 10-15 分钟
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3" />
                              携带推荐水晶
                            </li>
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3" />
                              记录能量变化
                            </li>
                          </ul>
                        </div>
                        <div className="bg-gradient-to-br from-warning/10 to-destructive/10 p-4 rounded-lg border border-warning/20">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-4 w-4 text-warning" />
                            <h4 className="font-medium text-foreground">注意事项</h4>
                          </div>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              避免过度消耗能量
                            </li>
                            <li className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              保持充足睡眠
                            </li>
                            <li className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              定期能量净化
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'meditation' && (
                    <div className="space-y-6">
                      {/* 推荐冥想练习 */}
                      <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-6 rounded-xl border border-secondary/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-secondary/20 rounded-lg text-secondary ">
                            <Gem className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">今日推荐冥想</h3>
                            <p className="text-sm text-muted-foreground">基于您的{energyState.dominantChakra}能量状态</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 水晶冥想 */}
                          <div className="bg-background/70 p-4 rounded-lg border border-secondary/10">
                            <div className="flex items-center gap-2 mb-3">
                              <Gem className="h-4 w-4 text-secondary" />
                              <h4 className="font-medium text-foreground">{energyState.recommendedCrystal}冥想</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              握住{energyState.recommendedCrystal}，感受其独特的能量振动，让心灵与水晶共振。
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>建议时长：15-20分钟</span>
                            </div>
                          </div>

                          {/* 脉轮冥想 */}
                          <div className="bg-background/70 p-4 rounded-lg border border-primary/10">
                            <div className="flex items-center gap-2 mb-3">
                              <Crown className="h-4 w-4 text-primary" />
                              <h4 className="font-medium text-foreground">{energyState.dominantChakra}冥想</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              专注于{energyState.dominantChakra}的位置，想象温暖的光芒在此处流动，净化和平衡能量。
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>建议时长：10-15分钟</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 冥想步骤指导 */}
                      <div className="bg-gradient-to-r from-success/10 to-accent/10 p-6 rounded-xl border border-success/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-success/20 rounded-lg text-success ">
                            <Play className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold text-foreground">冥想步骤指导</h3>
                        </div>

                        <div className="space-y-4">
                          {[
                            { step: 1, title: "准备阶段", desc: "找一个安静的地方，舒适地坐下，将水晶放在手中或面前" },
                            { step: 2, title: "调息阶段", desc: "深呼吸3次，每次呼气时释放紧张，每次吸气时吸入平静" },
                            { step: 3, title: "连接阶段", desc: "感受水晶的温度和质感，想象其能量与您的能量场融合" },
                            { step: 4, title: "冥想阶段", desc: "专注于呼吸，让思绪自然流淌，不要强迫或判断" },
                            { step: 5, title: "结束阶段", desc: "缓慢睁开眼睛，感谢水晶的陪伴，记录冥想体验" }
                          ].map((item) => (
                            <div key={item.step} className="flex items-start gap-3 bg-background/70 p-3 rounded-lg">
                              <div className="flex-shrink-0 w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-success">{item.step}</span>
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 冥想音乐推荐 */}
                      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-primary/20 rounded-lg text-primary ">
                            <Activity className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold text-foreground">推荐背景音乐</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            { name: "水晶钵音", freq: "432Hz", desc: "纯净的水晶钵声音，有助于深度放松" },
                            { name: "自然白噪音", freq: "宽频", desc: "森林、海浪等自然声音，营造宁静氛围" },
                            { name: "脉轮频率", freq: "特定Hz", desc: "针对不同脉轮的特定频率音乐" }
                          ].map((music, index) => (
                            <div key={index} className="bg-background/70 p-3 rounded-lg border border-primary/10">
                              <h4 className="font-medium text-foreground mb-1">{music.name}</h4>
                              <p className="text-xs text-primary mb-2">{music.freq}</p>
                              <p className="text-sm text-muted-foreground">{music.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'insights' && (
                    <div className="space-y-6">
                      {/* 能量分析报告 */}
                      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-primary/20 rounded-lg text-primary ">
                            <Brain className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">个人能量分析</h3>
                            <p className="text-sm text-muted-foreground">基于您的个人档案和当前状态</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 能量特征 */}
                          <div className="bg-background/70 p-4 rounded-lg border border-primary/10">
                            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                              <Zap className="h-4 w-4 text-primary" />
                              能量特征分析
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">主导元素</span>
                                <Badge variant="outline" className="text-primary border-primary/30">
                                  {energyState.elementBalance}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">能量类型</span>
                                <Badge variant="outline" className="text-secondary border-secondary/30">
                                  {energyState.energyLevel >= 4 ? '高频振动' : energyState.energyLevel >= 3 ? '稳定流动' : '需要调和'}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">情绪模式</span>
                                <Badge variant="outline" className="text-accent border-accent/30">
                                  {energyState.mbtiMood}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {/* 成长建议 */}
                          <div className="bg-background/70 p-4 rounded-lg border border-secondary/10">
                            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                              <Target className="h-4 w-4 text-secondary" />
                              成长建议
                            </h4>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p>• 加强{energyState.dominantChakra}的能量练习</p>
                              <p>• 定期使用{energyState.recommendedCrystal}进行能量净化</p>
                              <p>• 培养{energyState.mbtiMood}状态下的正念觉察</p>
                              <p>• 平衡{energyState.elementBalance}元素的过度表达</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 水晶亲和力分析 */}
                      <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-6 rounded-xl border border-secondary/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-secondary/20 rounded-lg text-secondary ">
                            <Gem className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold text-foreground">水晶亲和力分析</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {[
                            {
                              crystal: energyState.recommendedCrystal,
                              affinity: "95%",
                              reason: "与您当前的能量频率高度匹配",
                              color: "bg-success/20 text-success border-success/30"
                            },
                            {
                              crystal: "白水晶",
                              affinity: "85%",
                              reason: "万能净化石，适合日常佩戴",
                              color: "bg-primary/20 text-primary border-primary/30"
                            },
                            {
                              crystal: "黑曜石",
                              affinity: "70%",
                              reason: "强力保护石，适合能量防护",
                              color: "bg-muted/50 text-muted-foreground border-muted"
                            }
                          ].map((item, index) => (
                            <div key={index} className="bg-background/70 p-4 rounded-lg border border-secondary/10">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">{item.crystal}</h4>
                                <Badge className={item.color}>{item.affinity}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 能量发展趋势 */}
                      <div className="bg-gradient-to-r from-accent/10 to-success/10 p-6 rounded-xl border border-accent/20">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-accent/20 rounded-lg text-accent ">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                          <h3 className="font-semibold text-foreground">能量发展趋势</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-background/70 p-4 rounded-lg border border-accent/10">
                            <h4 className="font-medium text-foreground mb-3">近期发展重点</h4>
                            <div className="space-y-2">
                              {[
                                "深化冥想练习，提升内在觉察力",
                                "学习水晶能量的高级应用技巧",
                                "建立稳定的日常能量管理习惯",
                                "探索与自然元素的深度连接"
                              ].map((item, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Star className="h-3 w-3 text-accent" />
                                  <span>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-background/70 p-4 rounded-lg border border-success/10">
                            <h4 className="font-medium text-foreground mb-3">潜在挑战与机遇</h4>
                            <div className="space-y-2">
                              <div className="p-2 bg-warning/10 rounded border border-warning/20">
                                <p className="text-sm text-muted-foreground">
                                  <strong className="text-warning">挑战：</strong>能量波动较大，需要更稳定的练习
                                </p>
                              </div>
                              <div className="p-2 bg-success/10 rounded border border-success/20">
                                <p className="text-sm text-muted-foreground">
                                  <strong className="text-success">机遇：</strong>对水晶能量敏感度高，适合深度修行
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
