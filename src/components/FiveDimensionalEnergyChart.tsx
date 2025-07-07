"use client";

import React, { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import type { UserProfileDataOutput } from "@/ai/schemas/user-profile-schemas";
import type { ChakraAssessmentScores } from "@/types/questionnaire";
import { 
  Brain, Star, Zap, Orbit, Gem, ChevronDown, ChevronUp, BookOpen, TrendingUp, 
  Target, Lightbulb, AlertTriangle, BarChart3, Key, Sparkles, Code, Users, 
  DollarSign, Eye, EyeOff, Settings, ToggleLeft, ToggleRight 
} from 'lucide-react';

// 五维能量数据类型
interface FiveDimensionalData {
  dimension: string;
  energy: number;
  color: string;
  description: string;
  icon: string;
  theoreticalBasis: string;
  keyTraits: string[];
  developmentAdvice: string;
  synergy: {
    positive: string[];
    challenges: string[];
  };
}

// 能量协同分析
interface EnergySynergyAnalysis {
  dominantPattern: string;
  balanceScore: number;
  synergyIndex: number;
  conflictAreas: string[];
  harmoniousAreas: string[];
  developmentPhase: string;
  recommendations: {
    crystals: string[];
    practices: string[];
    focus: string;
  };
}

// 五维能量图谱组件属性
interface FiveDimensionalEnergyChartProps {
  profileData: UserProfileDataOutput | null;
  chakraScores?: ChakraAssessmentScores | null;
  className?: string;
  // 新增：可选的深度评估数据
  physicalAssessment?: any;
  lifeRhythm?: any;
  socialAssessment?: any;
  financialEnergyAssessment?: any;
  emotionalIntelligenceAssessment?: any;
}

const FiveDimensionalEnergyChart: React.FC<FiveDimensionalEnergyChartProps> = ({ 
  profileData, 
  chakraScores, 
  className = "",
  physicalAssessment,
  lifeRhythm,
  socialAssessment,
  financialEnergyAssessment,
  emotionalIntelligenceAssessment
}) => {
  const { language, t } = useLanguage();
  
  // 【方案一】渐进式信息展示控制
  const [showAdvancedSections, setShowAdvancedSections] = useState<Record<string, boolean>>({
    energyCode: false,        // 能量密码板块
    relationships: false,     // 人际关系板块
    financial: false,         // 财务能量板块
    crystalRecommendations: false, // 水晶推荐板块
    weeklyGoals: false,       // 本周目标
    insights: false           // 深度洞察
  });
  
  // 一键展开/收起所有高级内容
  const toggleAllAdvanced = () => {
    const allClosed = Object.values(showAdvancedSections).every(v => !v);
    setShowAdvancedSections(prev => 
      Object.keys(prev).reduce((acc, key) => {
        acc[key as string] = allClosed;
        return acc;
      }, {} as Record<string, boolean>)
    );
  };
  
  // 【方案二】视觉优化：显示模式控制
  const [compactMode, setCompactMode] = useState(false); // 紧凑模式
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false); // 深度分析默认关闭
  const [showTheory, setShowTheory] = useState(false);

  // 计算生命数字（基于出生日期）
  const calculateLifePathNumber = (birthDate?: string): number => {
    if (!birthDate) return 50;
    
    try {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) return 50;
      
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      
      let sum = year + month + day;
      while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
        sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
      }
      
      const energyMap: Record<number, number> = {
        1: 85, 2: 70, 3: 80, 4: 65, 5: 90, 6: 75, 7: 85, 8: 80, 9: 75,
        11: 95, 22: 90, 33: 85
      };
      
      const energy = energyMap[sum] || 75;
      return Math.max(0, Math.min(100, energy));
    } catch (error) {
      return 50;
    }
  };

  // 计算身体能量指数
  const calculatePhysicalEnergy = (assessment?: any): number => {
    if (!assessment) return 50;
    
    try {
      const {
        sleepQuality = 5,
        exerciseFrequency = 3,
        stressLevel = 5,
        energyLevel = 5,
        overallHealth = 5
      } = assessment;
      
      const sleepScore = Math.max(0, Math.min(10, Number(sleepQuality) || 5));
      const exerciseScore = Math.max(0, Math.min(7, Number(exerciseFrequency) || 3));
      const stressScore = 10 - Math.max(0, Math.min(10, Number(stressLevel) || 5));
      const energyScore = Math.max(0, Math.min(10, Number(energyLevel) || 5));
      const healthScore = Math.max(0, Math.min(10, Number(overallHealth) || 5));
      
      const totalScore = (sleepScore * 2 + exerciseScore * 1.5 + stressScore * 2 + energyScore * 2 + healthScore * 2.5) / 10;
      const normalizedScore = Math.max(0, Math.min(100, totalScore * 10));
      
      return isNaN(normalizedScore) ? 50 : normalizedScore;
    } catch (error) {
      return 50;
    }
  };

  // 计算社交能量指数
  const calculateSocialEnergy = (assessment?: any): number => {
    if (!assessment) return 50;
    
    try {
      const {
        relationshipQuality = 5,
        socialSupport = 5,
        communicationSkills = 5,
        conflictResolution = 5,
        empathy = 5
      } = assessment;
      
      const scores = [
        Math.max(0, Math.min(10, Number(relationshipQuality) || 5)),
        Math.max(0, Math.min(10, Number(socialSupport) || 5)),
        Math.max(0, Math.min(10, Number(communicationSkills) || 5)),
        Math.max(0, Math.min(10, Number(conflictResolution) || 5)),
        Math.max(0, Math.min(10, Number(empathy) || 5))
      ];
      
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const normalizedScore = Math.max(0, Math.min(100, averageScore * 10));
      
      return isNaN(normalizedScore) ? 50 : normalizedScore;
    } catch (error) {
      return 50;
    }
  };

  // 计算生活节律能量
  const calculateLifeRhythmEnergy = (rhythm?: any): number => {
    if (!rhythm) return 50;
    
    try {
      const {
        morningRoutine = 5,
        workLifeBalance = 5,
        eveningRoutine = 5,
        weekendActivities = 5,
        timeManagement = 5
      } = rhythm;
      
      const scores = [
        Math.max(0, Math.min(10, Number(morningRoutine) || 5)),
        Math.max(0, Math.min(10, Number(workLifeBalance) || 5)),
        Math.max(0, Math.min(10, Number(eveningRoutine) || 5)),
        Math.max(0, Math.min(10, Number(weekendActivities) || 5)),
        Math.max(0, Math.min(10, Number(timeManagement) || 5))
      ];
      
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const normalizedScore = Math.max(0, Math.min(100, averageScore * 10));
      
      return isNaN(normalizedScore) ? 50 : normalizedScore;
    } catch (error) {
      return 50;
    }
  };

  // 计算财务能量指数
  const calculateFinancialEnergy = (assessment?: any): number => {
    if (!assessment) return 50;
    
    try {
      const {
        financialSecurity = 5,
        budgetManagement = 5,
        investmentKnowledge = 5,
        debtManagement = 5,
        financialGoals = 5
      } = assessment;
      
      const scores = [
        Math.max(0, Math.min(10, Number(financialSecurity) || 5)),
        Math.max(0, Math.min(10, Number(budgetManagement) || 5)),
        Math.max(0, Math.min(10, Number(investmentKnowledge) || 5)),
        Math.max(0, Math.min(10, Number(debtManagement) || 5)),
        Math.max(0, Math.min(10, Number(financialGoals) || 5))
      ];
      
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const normalizedScore = Math.max(0, Math.min(100, averageScore * 10));
      
      return isNaN(normalizedScore) ? 50 : normalizedScore;
    } catch (error) {
      return 50;
    }
  };

  // 计算情绪智能指数
  const calculateEmotionalIntelligence = (assessment?: any): number => {
    if (!assessment) return 50;
    
    try {
      const {
        selfAwareness = 5,
        selfRegulation = 5,
        motivation = 5,
        empathy = 5,
        socialSkills = 5
      } = assessment;
      
      const scores = [
        Math.max(0, Math.min(10, Number(selfAwareness) || 5)),
        Math.max(0, Math.min(10, Number(selfRegulation) || 5)),
        Math.max(0, Math.min(10, Number(motivation) || 5)),
        Math.max(0, Math.min(10, Number(empathy) || 5)),
        Math.max(0, Math.min(10, Number(socialSkills) || 5))
      ];
      
      const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const normalizedScore = Math.max(0, Math.min(100, averageScore * 10));
      
      return isNaN(normalizedScore) ? 50 : normalizedScore;
    } catch (error) {
      return 50;
    }
  };

  // 基础维度计算函数 - 需要在使用前定义
  const calculateMBTIEnergy = (mbtiType?: string): number => {
    if (!mbtiType) return 50;
    const typeScores: Record<string, number> = {
      'INTJ': 85, 'INTP': 80, 'ENTJ': 90, 'ENTP': 85,
      'INFJ': 75, 'INFP': 70, 'ENFJ': 85, 'ENFP': 80,
      'ISTJ': 65, 'ISFJ': 60, 'ESTJ': 75, 'ESFJ': 70,
      'ISTP': 60, 'ISFP': 55, 'ESTP': 70, 'ESFP': 65
    };
    const typeScore = typeScores[mbtiType];
    return Math.max(0, Math.min(100, typeScore || 50));
  };

  const calculateZodiacEnergy = (zodiac?: string): number => {
    if (!zodiac) return 50;
    const scoreMap: Record<string, number> = {
      '白羊座': 85, '金牛座': 65, '双子座': 75, '巨蟹座': 60,
      '狮子座': 90, '处女座': 70, '天秤座': 75, '天蝎座': 85,
      '射手座': 80, '摩羯座': 70, '水瓶座': 85, '双鱼座': 65
    };
    const score = scoreMap[zodiac] || 50;
    return Math.max(0, Math.min(100, score));
  };

  const calculateChakraEnergy = (scores?: ChakraAssessmentScores | null): number => {
    if (!scores) return 50;
    const chakraValues = [
      scores.rootChakraFocus || 0,
      scores.sacralChakraFocus || 0,
      scores.solarPlexusChakraFocus || 0,
      scores.heartChakraFocus || 0,
      scores.throatChakraFocus || 0,
      scores.thirdEyeChakraFocus || 0,
      scores.crownChakraFocus || 0
    ];
    const average = chakraValues.reduce((sum, val) => sum + val, 0) / chakraValues.length;
    // 将1-5分制转换为百分制 (1分=20%, 5分=100%)
    const percentage = average * 20;
    return Math.max(0, Math.min(100, isNaN(percentage) ? 50 : percentage));
  };

  const calculateElementEnergy = (element?: string): number => {
    if (!element) return 50;
    const elementMap: Record<string, number> = {
      '木': 75, '火': 85, '土': 70, '金': 80, '水': 65
    };
    const score = elementMap[element] || 50;
    return Math.max(0, Math.min(100, score));
  };

  const calculatePlanetEnergy = (planet?: string): number => {
    if (!planet) return 50;
    const planetMap: Record<string, number> = {
      '太阳': 90, '月亮': 70, '水星': 75, '金星': 80, '火星': 85,
      '木星': 85, '土星': 65, '天王星': 80, '海王星': 75, '冥王星': 70
    };
    const score = planetMap[planet] || 50;
    return Math.max(0, Math.min(100, score));
  };

  // 计算协同指数
  const calculateSynergyIndex = (data: FiveDimensionalData[]): number => {
    if (data.length === 0) return 50;
    const energies = data.map(d => d.energy || 0);
    const average = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    const variance = energies.reduce((sum, e) => sum + Math.pow(e - average, 2), 0) / energies.length;
    const standardDeviation = Math.sqrt(variance);
    
    // 协同指数：平均能量高且方差小的组合得分更高
    const balanceScore = Math.max(0, 100 - standardDeviation);
    const synergyScore = (average + balanceScore) / 2;
    
    return Math.round(Math.max(0, Math.min(100, isNaN(synergyScore) ? 50 : synergyScore)));
  };

  // 识别主导模式
  const identifyDominantPattern = (data: FiveDimensionalData[]): string => {
    if (data.length === 0) return '';
    const sorted = [...data].sort((a, b) => (b.energy || 0) - (a.energy || 0));
    const top = sorted[0];
    return top ? top.dimension : '';
  };

  // 识别冲突区域
  const identifyConflicts = (data: FiveDimensionalData[]): string[] => {
    const conflicts: string[] = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        const diff = Math.abs((data[i].energy || 0) - (data[j].energy || 0));
        if (diff > 30) {
          conflicts.push(`${data[i].dimension} vs ${data[j].dimension}`);
        }
      }
    }
    return conflicts;
  };

  // 识别和谐区域
  const identifyHarmonies = (data: FiveDimensionalData[]): string[] => {
    const harmonies: string[] = [];
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data.length; j++) {
        const diff = Math.abs((data[i].energy || 0) - (data[j].energy || 0));
        if (diff <= 15) {
          harmonies.push(`${data[i].dimension} & ${data[j].dimension}`);
        }
      }
    }
    return harmonies;
  };

  // 确定发展阶段
  const determineDevelopmentPhase = (average: number, balance: number): string => {
    if (average >= 80 && balance >= 80) return language === 'zh' ? '成熟平衡期' : 'Mature Balance Phase';
    if (average >= 70 && balance >= 60) return language === 'zh' ? '稳定发展期' : 'Stable Development Phase';
    if (average >= 60) return language === 'zh' ? '成长探索期' : 'Growth Exploration Phase';
    if (average >= 40) return language === 'zh' ? '基础建设期' : 'Foundation Building Phase';
    return language === 'zh' ? '起步准备期' : 'Initial Preparation Phase';
  };

  // 生成个性化建议
  const generateRecommendations = (
    data: FiveDimensionalData[], 
    pattern: string, 
    conflicts: string[]
  ): EnergySynergyAnalysis['recommendations'] => {
    const crystals = generateCrystalRecommendations(data[data.length - 1], data[0], profileData);
    const practices = generatePracticeRecommendations(data[data.length - 1], data[0], profileData, conflicts);
    const focus = generateFocusRecommendation(data[data.length - 1], data[0], pattern, data);
    
    return { crystals, practices, focus };
  };

  // 生成水晶建议
  const generateCrystalRecommendations = (
    weakest: FiveDimensionalData, 
    strongest: FiveDimensionalData,
    profile: any
  ): string[] => {
    const recommendations: string[] = [];
    
    if (weakest && weakest.dimension.includes('MBTI')) {
      recommendations.push(language === 'zh' ? '紫水晶 - 提升直觉与洞察力' : 'Amethyst - Enhance intuition and insight');
    }
    if (weakest && weakest.dimension.includes('脉轮')) {
      recommendations.push(language === 'zh' ? '白水晶 - 平衡所有脉轮能量' : 'Clear Quartz - Balance all chakra energies');
    }
    if (weakest && weakest.dimension.includes('元素')) {
      recommendations.push(language === 'zh' ? '玛瑙 - 稳定能量场' : 'Agate - Stabilize energy field');
    }
    
    return recommendations.length > 0 ? recommendations : [language === 'zh' ? '粉水晶 - 增强自爱与和谐' : 'Rose Quartz - Enhance self-love and harmony'];
  };

  // 生成练习建议
  const generatePracticeRecommendations = (
    weakest: FiveDimensionalData,
    strongest: FiveDimensionalData, 
    profile: any,
    conflicts: string[]
  ): string[] => {
    const recommendations: string[] = [];
    
    if (conflicts.length > 0) {
      recommendations.push(language === 'zh' ? '冥想练习 - 整合内在冲突' : 'Meditation practice - Integrate inner conflicts');
    }
    if (weakest && weakest.energy < 60) {
      recommendations.push(language === 'zh' ? '能量呼吸法 - 激活低活跃区域' : 'Energy breathing - Activate low-energy areas');
    }
    
    recommendations.push(language === 'zh' ? '日常觉察练习 - 保持能量平衡' : 'Daily awareness practice - Maintain energy balance');
    
    return recommendations;
  };

  // 生成焦点建议
  const generateFocusRecommendation = (
    weakest: FiveDimensionalData,
    strongest: FiveDimensionalData,
    pattern: string,
    data: FiveDimensionalData[]
  ): string => {
    if (!weakest) return language === 'zh' ? '保持当前平衡状态' : 'Maintain current balance';
    
    if (weakest.energy < 50) {
      return language === 'zh' 
        ? `重点关注${weakest.dimension}的能量提升，通过相关练习和调整生活方式来增强这一维度`
        : `Focus on enhancing ${weakest.dimension} energy through relevant practices and lifestyle adjustments`;
    }
    
    return language === 'zh' 
      ? '继续保持各维度的平衡发展，适度强化薄弱环节'
      : 'Continue balanced development across all dimensions while strengthening weaker areas';
  };

  // 五维能量协同分析 - 基于整体论能量理论
  const analyzeSynergy = (data: FiveDimensionalData[]): EnergySynergyAnalysis => {
    if (data.length === 0) {
      return {
        dominantPattern: '',
        balanceScore: 50,
        synergyIndex: 50,
        conflictAreas: [],
        harmoniousAreas: [],
        developmentPhase: language === 'zh' ? '数据不足' : 'Insufficient data',
        recommendations: {
          crystals: [],
          practices: [],
          focus: language === 'zh' ? '等待数据加载' : 'Waiting for data'
        }
      };
    }

    const energies = data.map(d => d.energy || 0);
    const average = energies.reduce((sum, e) => sum + e, 0) / energies.length;
    const balanceScore = calculateSynergyIndex(data);
    const synergyIndex = balanceScore;
    const dominantPattern = identifyDominantPattern(data);
    const conflictAreas = identifyConflicts(data);
    const harmoniousAreas = identifyHarmonies(data);
    const developmentPhase = determineDevelopmentPhase(average, balanceScore);
    const recommendations = generateRecommendations(data, dominantPattern, conflictAreas);

    return {
      dominantPattern,
      balanceScore,
      synergyIndex,
      conflictAreas,
      harmoniousAreas,
      developmentPhase,
      recommendations
    };
  };

  // 更新的八维能量评分计算
  const calculateExtendedDimensionalScores = (): FiveDimensionalData[] => {
    if (!profileData) return [];

    // 原有五个维度
    const mbtiScore = calculateMBTIEnergy(profileData.mbtiLikeType);
    const zodiacScore = calculateZodiacEnergy(profileData.inferredZodiac);
    const chakraScore = calculateChakraEnergy(chakraScores);
    const elementScore = calculateElementEnergy(profileData.inferredElement);
    const planetScore = calculatePlanetEnergy(profileData.inferredPlanet);

    // 新增三个核心维度
    const lifePathScore = calculateLifePathNumber(profileData.name ? '1990-01-01' : undefined); // 临时使用，实际需要生日
    const physicalScore = calculatePhysicalEnergy(physicalAssessment);
    const socialScore = calculateSocialEnergy(socialAssessment);

    const dimensions = [
      {
        dimension: language === 'zh' ? '🧠 人格特质' : '🧠 Personality',
        energy: mbtiScore,
        color: '#8b5cf6',
        description: language === 'zh' ? '基于MBTI类型的性格能量强度' : 'Personality energy based on MBTI type',
        icon: '🧠',
        theoreticalBasis: 'MBTI人格类型理论',
        keyTraits: ['认知偏好', '决策方式', '能量来源'],
        developmentAdvice: '通过了解认知功能提升个人效能',
        synergy: {
          positive: ['与星座能量的元素共鸣', '与行星影响的心理原型呼应'],
          challenges: ['需要与脉轮能量平衡', '避免过度依赖单一认知功能']
        }
      },
      {
        dimension: language === 'zh' ? '⭐ 星座能量' : '⭐ Zodiac Energy',
        energy: zodiacScore,
        color: '#f59e0b',
        description: language === 'zh' ? '星座对应的自然能量水平' : 'Natural energy level corresponding to zodiac sign',
        icon: '⭐',
        theoreticalBasis: '占星学四元素理论',
        keyTraits: ['元素特质', '模式表达', '能量循环'],
        developmentAdvice: '顺应星座特质的自然节律',
        synergy: {
          positive: ['与元素能量的直接关联', '与行星影响的深度共振'],
          challenges: ['需要调和不同元素间的冲突', '避免过度固化性格模式']
        }
      },
      {
        dimension: language === 'zh' ? '🌈 脉轮平衡' : '🌈 Chakra Balance',
        energy: chakraScore,
        color: '#10b981',
        description: language === 'zh' ? '主要脉轮的综合活跃指数' : 'Comprehensive activity index of main chakras',
        icon: '🌈',
        theoreticalBasis: '印度瑜伽脉轮系统',
        keyTraits: ['能量中心', '意识层次', '身心连接'],
        developmentAdvice: '通过冥想和瑜伽平衡脉轮能量',
        synergy: {
          positive: ['与身体能量的直接对应', '与情绪智能的深度关联'],
          challenges: ['需要持续的练习维护', '容易受到环境和情绪影响']
        }
      },
      {
        dimension: language === 'zh' ? '🔥 元素属性' : '🔥 Elemental Property',
        energy: elementScore,
        color: '#ef4444',
        description: language === 'zh' ? '主导元素的影响力强度' : 'Influence strength of dominant element',
        icon: '🔥',
        theoreticalBasis: '中医五行学说',
        keyTraits: ['脏腑对应', '情志特质', '季节共振'],
        developmentAdvice: '根据五行相生相克调节生活方式',
        synergy: {
          positive: ['与星座能量的元素呼应', '与生活节律的季节性匹配'],
          challenges: ['需要注意五行平衡', '避免单一元素过强']
        }
      },
      {
        dimension: language === 'zh' ? '🪐 行星影响' : '🪐 Planetary Influence',
        energy: planetScore,
        color: '#6366f1',
        description: language === 'zh' ? '关键行星的能量影响程度' : 'Energy influence level of key planets',
        icon: '🪐',
        theoreticalBasis: '占星学行星原型理论',
        keyTraits: ['心理原型', '能量驱动', '意识模式'],
        developmentAdvice: '整合行星原型能量提升意识层次',
        synergy: {
          positive: ['与星座能量的主宰关系', '与人格特质的深层共振'],
          challenges: ['需要平衡不同行星的影响', '避免负面行星能量的过度表达']
        }
      },
      {
        dimension: language === 'zh' ? '🔢 生命密码' : '🔢 Life Path',
        energy: lifePathScore,
        color: '#8b5cf6',
        description: language === 'zh' ? '基于出生日期的生命数字能量' : 'Life number energy based on birth date',
        icon: '🔢',
        theoreticalBasis: '数字学生命路径理论',
        keyTraits: ['天赋使命', '人生课题', '灵魂目的'],
        developmentAdvice: '理解并实践生命数字的指导意义',
        synergy: {
          positive: ['与人格特质的深层契合', '与行星影响的命运呼应'],
          challenges: ['需要在物质与精神间找到平衡', '避免过度依赖数字预测']
        }
      },
      {
        dimension: language === 'zh' ? '💪 身体能量' : '💪 Physical Energy',
        energy: physicalScore,
        color: '#059669',
        description: language === 'zh' ? '身体健康状况与体能水平' : 'Physical health status and fitness level',
        icon: '💪',
        theoreticalBasis: '整体健康医学',
        keyTraits: ['体能状态', '健康习惯', '生理节律'],
        developmentAdvice: '通过运动、营养和睡眠优化身体能量',
        synergy: {
          positive: ['与脉轮能量的身心连接', '与生活节律的协调性'],
          challenges: ['需要持续的健康管理', '受到年龄和环境因素影响']
        }
      },
      {
        dimension: language === 'zh' ? '👥 社交能量' : '👥 Social Energy',
        energy: socialScore,
        color: '#f59e0b',
        description: language === 'zh' ? '人际关系与社交互动能力' : 'Interpersonal relationships and social interaction ability',
        icon: '👥',
        theoreticalBasis: '社会心理学理论',
        keyTraits: ['关系质量', '沟通能力', '社交技巧'],
        developmentAdvice: '培养健康的人际关系和沟通技巧',
        synergy: {
          positive: ['与人格特质的外向性匹配', '与情绪智能的深度关联'],
          challenges: ['需要平衡个人与社交需求', '受到社会环境变化影响']
        }
      }
    ];

    return dimensions;
  };

  // 检测是否有增强评估数据
  const hasEnhancedData = !!(physicalAssessment || lifeRhythm || socialAssessment || financialEnergyAssessment || emotionalIntelligenceAssessment);
  
  // 根据是否有增强评估数据决定显示维度
  const extendedDimensionalData = calculateExtendedDimensionalScores();
  const displayData = hasEnhancedData ? extendedDimensionalData : extendedDimensionalData.slice(0, 5);
  const fiveDimensionalData = displayData.filter(d => d && typeof d.energy === 'number' && !isNaN(d.energy)); // 保持变量名兼容性，实际可能是5维或8维，过滤无效数据

  // 计算协同分析
  const synergyAnalysis = analyzeSynergy(fiveDimensionalData);

  // 获取能量等级
  const getEnergyLevel = (energy: number) => {
    if (energy >= 85) return { label: '卓越', color: 'bg-primary' };
    if (energy >= 70) return { label: '良好', color: 'bg-primary' };
    if (energy >= 55) return { label: '平衡', color: 'bg-accent' };
    if (energy >= 40) return { label: '待提升', color: 'bg-muted' };
    return { label: '需关注', color: 'bg-destructive' };
  };

  // 生成立即可行的行动建议
  const generateImmediateActions = () => {
    const sortedData = [...fiveDimensionalData].sort((a, b) => a.energy - b.energy);
    const weakest = sortedData[0];
    const actions = [];

    // 基于MBTI的个性化建议
    if (weakest.dimension.includes('MBTI')) {
      const mbtiType = profileData?.mbtiLikeType || '';
      if (mbtiType.includes('I')) {
        actions.push({
          title: language === 'zh' ? '🧘 内在充电时刻' : '🧘 Inner Recharge Moment',
          description: language === 'zh' ? '找一个舒适角落，播放轻音乐，闭眼感受内心的平静，为自己的能量"充电"' : 'Find a comfortable corner, play soft music, close eyes and feel inner peace to "recharge" your energy',
          timeCommitment: language === 'zh' ? '⏰ 10分钟' : '⏰ 10 minutes',
          tip: language === 'zh' ? '💡 内向者通过独处获得能量，这是天赋不是缺陷' : '💡 Introverts gain energy through solitude - this is a gift, not a flaw'
        });
      } else {
        actions.push({
          title: language === 'zh' ? '💬 主动社交连接' : '💬 Active Social Connection',
          description: language === 'zh' ? '给一位朋友发信息或打电话，分享今天的见闻或听听对方的故事' : 'Message or call a friend, share today\'s experiences or listen to their stories',
          timeCommitment: language === 'zh' ? '⏰ 15分钟' : '⏰ 15 minutes',
          tip: language === 'zh' ? '💡 外向者通过交流获得活力，真诚的对话胜过浅层的社交' : '💡 Extroverts gain vitality through communication - genuine dialogue beats shallow socializing'
        });
      }

      if (mbtiType.includes('N')) {
        actions.push({
          title: language === 'zh' ? '✨ 创意灵感捕捉' : '✨ Creative Inspiration Capture',
          description: language === 'zh' ? '用手机记录3个今天遇到的有趣想法，无论多么天马行空' : 'Record 3 interesting ideas you encountered today on your phone, no matter how wild',
          timeCommitment: language === 'zh' ? '⏰ 5分钟' : '⏰ 5 minutes',
          tip: language === 'zh' ? '💡 直觉型喜欢可能性，记录想法让创意不流失' : '💡 Intuitive types love possibilities - recording ideas preserves creativity'
        });
      } else {
        actions.push({
          title: language === 'zh' ? '📝 具体目标设定' : '📝 Concrete Goal Setting',
          description: language === 'zh' ? '写下明天要完成的3个具体任务，包括时间和地点' : 'Write down 3 specific tasks to complete tomorrow, including time and location',
          timeCommitment: language === 'zh' ? '⏰ 8分钟' : '⏰ 8 minutes',
          tip: language === 'zh' ? '💡 感觉型重视细节，具体计划让目标更容易实现' : '💡 Sensing types value details - specific plans make goals more achievable'
        });
      }
    }

    // 基于脉轮的能量平衡练习
    if (weakest.dimension.includes('脉轮') && chakraScores) {
      const chakraArray = [
        { name: '海底轮', score: chakraScores.rootChakraFocus, action: { title: '🌱 大地连接法', desc: '脱掉鞋子，在草地或泥土上站立3分钟，感受大地的稳定力量', tip: '海底轮主管安全感，接地练习帮助建立内在稳定' }},
        { name: '脐轮', score: chakraScores.sacralChakraFocus, action: { title: '🎨 创造力释放', desc: '用手边的纸笔随意涂鸦，不追求美观，只享受创作过程', tip: '脐轮掌管创造力，自由表达激活内在生命力' }},
        { name: '太阳轮', score: chakraScores.solarPlexusChakraFocus, action: { title: '☀️ 自信姿态练习', desc: '挺直腰背，双手叉腰，对镜子说"我能做到"5次', tip: '太阳轮是自信中心，身体姿态直接影响内在力量' }},
        { name: '心轮', score: chakraScores.heartChakraFocus, action: { title: '💚 感恩心流练习', desc: '闭眼回想今天3件值得感恩的事，感受心中的温暖', tip: '心轮连接爱与慈悲，感恩打开心灵空间' }},
        { name: '喉轮', score: chakraScores.throatChakraFocus, action: { title: '🗣️ 真实表达练习', desc: '对自己或亲近的人说出一个真实想法，哪怕有点紧张', tip: '喉轮掌管表达，真诚沟通释放内在声音' }},
        { name: '眉心轮', score: chakraScores.thirdEyeChakraFocus, action: { title: '👁️ 直觉感知练习', desc: '闭眼3分钟，不思考任何事，只观察脑海中自然浮现的画面', tip: '眉心轮是智慧之眼，静心观察培养内在洞察' }},
        { name: '顶轮', score: chakraScores.crownChakraFocus, action: { title: '🌟 宇宙连接冥想', desc: '想象头顶有一束光照射下来，感受与更大存在的连接', tip: '顶轮连接灵性，冥想扩展意识边界' }}
      ].sort((a, b) => a.score - b.score);
      
      const weakestChakra = chakraArray[0];
      actions.push({
        title: weakestChakra.action.title,
        description: weakestChakra.action.desc,
        timeCommitment: language === 'zh' ? '⏰ 5-8分钟' : '⏰ 5-8 minutes',
        tip: language === 'zh' ? `💡 ${weakestChakra.action.tip}` : `💡 ${weakestChakra.action.tip}`
      });
    }

    // 基于元素的季节性调养
    if (weakest.dimension.includes('元素')) {
      const element = profileData?.inferredElement || '';
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? '春' : 
                    currentMonth >= 5 && currentMonth <= 7 ? '夏' : 
                    currentMonth >= 8 && currentMonth <= 10 ? '秋' : '冬';
      
      if (element.includes('木') && season === '春') {
        actions.push({
          title: language === 'zh' ? '🌱 春木养肝法' : '🌱 Spring Wood Liver Care',
          description: language === 'zh' ? '到绿色植物旁深呼吸，双手轻按肝区（右肋下），感受生机勃勃的木气' : 'Breathe deeply near green plants, gently press liver area (below right ribs), feel vibrant wood energy',
          timeCommitment: language === 'zh' ? '⏰ 8分钟' : '⏰ 8 minutes',
          tip: language === 'zh' ? '💡 春季木气最旺，木型人此时养肝事半功倍' : '💡 Spring has strongest wood energy - perfect time for wood types to nourish liver'
        });
      } else if (element.includes('火')) {
        actions.push({
          title: language === 'zh' ? '🔥 心火平衡术' : '🔥 Heart Fire Balance',
          description: language === 'zh' ? '双手放在心口，想象心中有温暖的火光，既不炽烈也不熄灭，刚好温暖' : 'Place hands on heart, imagine warm gentle fire within - neither blazing nor extinguished, just warmly glowing',
          timeCommitment: language === 'zh' ? '⏰ 6分钟' : '⏰ 6 minutes',
          tip: language === 'zh' ? '💡 火型人需要学会控制热情的火焰，适度即是力量' : '💡 Fire types need to learn controlling passionate flames - moderation is power'
        });
      } else if (element.includes('土')) {
        actions.push({
          title: language === 'zh' ? '🏔️ 大地根基法' : '🏔️ Earth Foundation Practice',
          description: language === 'zh' ? '坐在地上或椅子上，感受重力把你牢牢"种"在大地上，像大树扎根' : 'Sit on ground or chair, feel gravity firmly "planting" you in earth like a tree taking root',
          timeCommitment: language === 'zh' ? '⏰ 10分钟' : '⏰ 10 minutes',
          tip: language === 'zh' ? '💡 土型人的力量来自稳定，接地练习增强内在安全感' : '💡 Earth types\' power comes from stability - grounding enhances inner security'
        });
      } else if (element.includes('金')) {
        actions.push({
          title: language === 'zh' ? '💨 清金润肺呼吸' : '💨 Metal Lung Cleansing Breath',
          description: language === 'zh' ? '深吸气4秒，屏息4秒，慢呼气8秒，想象肺部像金属般纯净明亮' : 'Inhale 4 seconds, hold 4 seconds, exhale 8 seconds, imagine lungs pure and bright like metal',
          timeCommitment: language === 'zh' ? '⏰ 8分钟' : '⏰ 8 minutes',
          tip: language === 'zh' ? '💡 金型人重视纯净，呼吸法净化身心，提升专注力' : '💡 Metal types value purity - breathing purifies body-mind, enhances focus'
        });
      } else if (element.includes('水')) {
        actions.push({
          title: language === 'zh' ? '🌊 水流冥想法' : '🌊 Water Flow Meditation',
          description: language === 'zh' ? '想象自己是一条小溪，柔软地流过各种地形，既不急躁也不停滞' : 'Imagine yourself as a stream, softly flowing through various terrains, neither rushing nor stagnating',
          timeCommitment: language === 'zh' ? '⏰ 10分钟' : '⏰ 10 minutes',
          tip: language === 'zh' ? '💡 水型人需要学会流动的智慧，柔能克刚是水的力量' : '💡 Water types need flowing wisdom - softness overcoming hardness is water\'s power'
        });
      }
    }

    // 基于星座的行星能量激活
    if (weakest.dimension.includes('行星')) {
      const zodiac = profileData?.inferredZodiac || '';
      if (zodiac.includes('白羊') || zodiac.includes('天蝎')) {
        actions.push({
          title: language === 'zh' ? '♈ 火星力量启动' : '♈ Mars Power Activation',
          description: language === 'zh' ? '做10个俯卧撑或快步走2分钟，感受身体的力量和决心' : 'Do 10 push-ups or brisk walk for 2 minutes, feel your body\'s strength and determination',
          timeCommitment: language === 'zh' ? '⏰ 5分钟' : '⏰ 5 minutes',
          tip: language === 'zh' ? '💡 火星主管行动力，身体运动激活内在勇气' : '💡 Mars governs action - physical movement activates inner courage'
        });
      } else if (zodiac.includes('金牛') || zodiac.includes('天秤')) {
        actions.push({
          title: language === 'zh' ? '♀ 金星美感培养' : '♀ Venus Beauty Cultivation',
          description: language === 'zh' ? '整理周围环境，放一朵花或美丽的物品，用5分钟欣赏生活中的美' : 'Organize surroundings, place a flower or beautiful object, spend 5 minutes appreciating life\'s beauty',
          timeCommitment: language === 'zh' ? '⏰ 8分钟' : '⏰ 8 minutes',
          tip: language === 'zh' ? '💡 金星主管美与和谐，美感练习提升生活品质' : '💡 Venus governs beauty and harmony - aesthetic practice enhances life quality'
        });
      }
    }

    // 确保至少有2个行动建议
    if (actions.length < 2) {
      actions.push({
        title: language === 'zh' ? '🎯 能量觉察练习' : '🎯 Energy Awareness Practice',
        description: language === 'zh' ? '闭眼感受身体，从头到脚扫描一遍，哪里紧张就轻轻按摩，哪里舒适就感恩' : 'Close eyes and feel your body, scan from head to toe, massage tense areas, appreciate comfortable ones',
        timeCommitment: language === 'zh' ? '⏰ 5分钟' : '⏰ 5 minutes',
        tip: language === 'zh' ? '💡 身体是能量的载体，觉察是改变的第一步' : '💡 Body is energy\'s vessel - awareness is the first step to change'
      });
    }

    return actions.slice(0, 2); // 返回最相关的2个建议，避免过载
  };

  // 生成本周成长目标
  const generateWeeklyGoals = () => {
    const sortedData = [...fiveDimensionalData].sort((a, b) => a.energy - b.energy);
    const weakest = sortedData[0];
    const goals = [];

    // 基于MBTI的个性化周目标
    if (weakest.dimension.includes('MBTI')) {
      const mbtiType = profileData?.mbtiLikeType || '';
      if (mbtiType.includes('E') && mbtiType.includes('J')) {
        goals.push({
          area: language === 'zh' ? '📋 高效执行力' : '📋 Efficient Execution',
          goal: language === 'zh' ? '制定3个具体的周计划，每天晚上回顾完成情况并调整明日安排' : 'Create 3 specific weekly plans, review completion each evening and adjust next day\'s schedule',
          difficulty: language === 'zh' ? '简单' : 'Easy',
          method: language === 'zh' ? '🔧 使用番茄工作法，25分钟专注+5分钟休息' : '🔧 Use Pomodoro: 25min focus + 5min break',
          benefit: language === 'zh' ? '🌟 计划性强的你会感到更有掌控感和成就感' : '🌟 Strong planners feel more in control and accomplished'
        });
      } else if (mbtiType.includes('I') && mbtiType.includes('P')) {
        goals.push({
          area: language === 'zh' ? '🌱 自我探索深度' : '🌱 Self-Exploration Depth',
          goal: language === 'zh' ? '每天写3句内心独白，记录真实想法和感受，不需要完美' : 'Write 3 inner monologue sentences daily, record genuine thoughts and feelings without perfection',
          difficulty: language === 'zh' ? '简单' : 'Easy',
          method: language === 'zh' ? '🔧 睡前5分钟，用手机备忘录随意记录' : '🔧 5 minutes before bed, casually record in phone notes',
          benefit: language === 'zh' ? '🌟 内向直觉型通过自省获得深刻洞察' : '🌟 Introverted intuitives gain deep insights through introspection'
        });
      } else if (mbtiType.includes('T')) {
        goals.push({
          area: language === 'zh' ? '🧠 逻辑思维训练' : '🧠 Logical Thinking Training',
          goal: language === 'zh' ? '每天分析一个问题的3个不同解决方案，培养多角度思考' : 'Analyze 3 different solutions to one problem daily, develop multi-perspective thinking',
          difficulty: language === 'zh' ? '中等' : 'Medium',
          method: language === 'zh' ? '🔧 选择工作/生活中的小问题，用"如果...那么..."思维' : '🔧 Choose small work/life problems, use "if...then..." thinking',
          benefit: language === 'zh' ? '🌟 理性思维者通过系统分析获得清晰决策' : '🌟 Rational thinkers gain clear decisions through systematic analysis'
        });
      } else if (mbtiType.includes('F')) {
        goals.push({
          area: language === 'zh' ? '💝 情感连接深化' : '💝 Emotional Connection Deepening',
          goal: language === 'zh' ? '每天给一个人真诚的关怀（可以是家人、朋友或陌生人）' : 'Give one person genuine care daily (family, friends, or strangers)',
          difficulty: language === 'zh' ? '简单' : 'Easy',
          method: language === 'zh' ? '🔧 发一条关心信息、给一个拥抱、说一句赞美' : '🔧 Send caring message, give hug, offer genuine compliment',
          benefit: language === 'zh' ? '🌟 情感型通过真诚连接获得内心满足' : '🌟 Feeling types gain inner fulfillment through authentic connections'
        });
      }
    }

    // 基于脉轮的能量平衡目标
    if (weakest.dimension.includes('脉轮') && chakraScores) {
      const chakraArray = [
        { name: '海底轮', score: chakraScores.rootChakraFocus, goal: '🌱 建立安全感', practice: '每天5分钟接地冥想，想象根系扎入大地', benefit: '增强内在稳定感和对未来的信心' },
        { name: '脐轮', score: chakraScores.sacralChakraFocus, goal: '🎨 激活创造力', practice: '每天做一件创意小事，写字、画画、唱歌都可以', benefit: '恢复对生活的热情和创造活力' },
        { name: '太阳轮', score: chakraScores.solarPlexusChakraFocus, goal: '☀️ 提升自信力', practice: '每天完成一个小挑战，为自己喝彩庆祝', benefit: '建立自我价值感和内在力量' },
        { name: '心轮', score: chakraScores.heartChakraFocus, goal: '💚 开放爱的能力', practice: '每天练习无条件的自我接纳和对他人的善意', benefit: '体验更深的爱与被爱的感受' },
        { name: '喉轮', score: chakraScores.throatChakraFocus, goal: '🗣️ 真实表达自我', practice: '每天说出一个真实想法，即使有点不舒服', benefit: '获得内在自由和他人的真正理解' },
        { name: '眉心轮', score: chakraScores.thirdEyeChakraFocus, goal: '👁️ 开发直觉智慧', practice: '每天静心10分钟，观察内在的直觉和洞察', benefit: '做决策更准确，对生活有更深理解' },
        { name: '顶轮', score: chakraScores.crownChakraFocus, goal: '🌟 连接更高智慧', practice: '每天感恩冥想，感受与宇宙的连接', benefit: '获得内在平静和人生意义感' }
      ].sort((a, b) => a.score - b.score);
      
      const focusChakra = chakraArray[0];
      goals.push({
        area: focusChakra.name,
        goal: focusChakra.goal,
        difficulty: language === 'zh' ? '中等' : 'Medium',
        method: language === 'zh' ? `🔧 ${focusChakra.practice}` : `🔧 ${focusChakra.practice}`,
        benefit: language === 'zh' ? `🌟 ${focusChakra.benefit}` : `🌟 ${focusChakra.benefit}`
      });
    }

    // 基于元素的季节性养生目标
    if (weakest.dimension.includes('元素')) {
      const element = profileData?.inferredElement || '';
      const currentMonth = new Date().getMonth();
      const season = currentMonth >= 2 && currentMonth <= 4 ? '春' : 
                    currentMonth >= 5 && currentMonth <= 7 ? '夏' : 
                    currentMonth >= 8 && currentMonth <= 10 ? '秋' : '冬';
      
      if (element.includes('木') && season === '春') {
        goals.push({
          area: language === 'zh' ? '🌱 春季木气养肝' : '🌱 Spring Wood Liver Care',
          goal: language === 'zh' ? '调整作息顺应春气，11点前睡觉，多吃绿色蔬菜' : 'Adjust schedule to spring energy, sleep before 11pm, eat more green vegetables',
          difficulty: language === 'zh' ? '中等' : 'Medium',
          method: language === 'zh' ? '🔧 设置睡眠提醒，每餐加一样绿菜' : '🔧 Set sleep reminders, add green veggie to each meal',
          benefit: language === 'zh' ? '🌟 木型人春季养肝事半功倍，情绪更稳定' : '🌟 Wood types benefit greatly from spring liver care, more stable emotions'
        });
      } else if (element.includes('火')) {
        goals.push({
          area: language === 'zh' ? '🔥 火型人心智平衡' : '🔥 Fire Type Mind Balance',
          goal: language === 'zh' ? '学会控制冲动，遇事先深呼吸3次再反应' : 'Learn impulse control, take 3 deep breaths before reacting to situations',
          difficulty: language === 'zh' ? '中等' : 'Medium',
          method: language === 'zh' ? '🔧 设置"暂停"提醒，练习4-7-8呼吸法' : '🔧 Set "pause" reminders, practice 4-7-8 breathing',
          benefit: language === 'zh' ? '🌟 火型人学会节制后，领导力和魅力更强' : '🌟 Fire types gain stronger leadership and charisma with self-control'
        });
      }
    }

    // 确保至少有1个目标
    if (goals.length === 0) {
      goals.push({
        area: language === 'zh' ? '🎯 整体能量提升' : '🎯 Overall Energy Enhancement',
        goal: language === 'zh' ? '建立晨间能量仪式，5分钟冥想+设定今日意图' : 'Establish morning energy ritual: 5-minute meditation + set daily intention',
        difficulty: language === 'zh' ? '简单' : 'Easy',
        method: language === 'zh' ? '🔧 起床后先不看手机，静坐感受身心状态' : '🔧 Don\'t check phone upon waking, sit quietly and feel body-mind state',
        benefit: language === 'zh' ? '🌟 晨间仪式为整天设定积极基调' : '🌟 Morning ritual sets positive tone for entire day'
      });
    }

    return goals.slice(0, 2);
  };

  // 获取核心驱动力洞察
  const getPersonalityInsight = () => {
    const mbtiType = profileData?.mbtiLikeType || '';
    const insights = {
      'NT': { 
        drive: language === 'zh' ? '🎯 理性探索者' : '🎯 Rational Explorer',
        description: language === 'zh' ? '追求理解世界的运作规律' : 'Seeks to understand how the world works'
      },
      'NF': { 
        drive: language === 'zh' ? '✨ 理想主义者' : '✨ Idealistic Visionary', 
        description: language === 'zh' ? '致力于实现人类潜能和美好愿景' : 'Dedicated to human potential and beautiful visions'
      },
      'SJ': { 
        drive: language === 'zh' ? '🛡️ 稳定守护者' : '🛡️ Stable Guardian',
        description: language === 'zh' ? '维护秩序和传统，保护重要的人事物' : 'Maintains order and tradition, protects important people and things'
      },
      'SP': { 
        drive: language === 'zh' ? '🌊 灵活适应者' : '🌊 Flexible Adapter',
        description: language === 'zh' ? '享受当下，灵活应对环境变化' : 'Enjoys present moment, adapts flexibly to environmental changes'
      }
    };

    for (const [pattern, insight] of Object.entries(insights)) {
      if (mbtiType.includes(pattern[0]) && mbtiType.includes(pattern[1])) {
        return insight;
      }
    }
    
    return { 
      drive: language === 'zh' ? '⚖️ 均衡发展者' : '⚖️ Balanced Developer',
      description: language === 'zh' ? '在多个维度间寻求平衡发展' : 'Seeks balanced development across multiple dimensions'
    };
  };

  // 获取能量风格
  const getEnergyStyle = () => {
    const highest = Math.max(...fiveDimensionalData.map(d => d.energy));
    const lowest = Math.min(...fiveDimensionalData.map(d => d.energy));
    const range = highest - lowest;
    const average = fiveDimensionalData.reduce((sum, d) => sum + d.energy, 0) / fiveDimensionalData.length;
    
    if (range > 30) {
      return {
        style: language === 'zh' ? '⛰️ 波峰型' : '⛰️ Peak-Valley Type',
        description: language === 'zh' ? '有明显的能量高峰和低谷，专长突出' : 'Clear energy peaks and valleys with distinct strengths'
      };
    } else if (range > 15) {
      return {
        style: language === 'zh' ? '🌊 波浪型' : '🌊 Wave Type',
        description: language === 'zh' ? '能量起伏适中，适应性强' : 'Moderate energy fluctuations with good adaptability'
      };
    } else {
      return {
        style: language === 'zh' ? '🌕 平衡型' : '🌕 Balanced Type',
        description: language === 'zh' ? '五维能量均衡，整体稳定' : 'Balanced five-dimensional energy, overall stable'
      };
    }
  };

  // 获取成长阶段
  const getGrowthPhase = () => {
    const average = fiveDimensionalData.reduce((sum, d) => sum + d.energy, 0) / fiveDimensionalData.length;
    const balance = synergyAnalysis.balanceScore;
    
    if (average >= 85 && balance >= 80) {
      return {
        phase: language === 'zh' ? '🌟 精通阶段' : '🌟 Mastery Phase',
        description: language === 'zh' ? '能量充沛且平衡，可以指导他人' : 'Abundant and balanced energy, ready to guide others'
      };
    } else if (average >= 70 && balance >= 65) {
      return {
        phase: language === 'zh' ? '🚀 发展阶段' : '🚀 Development Phase',
        description: language === 'zh' ? '各维度稳步提升，积极成长中' : 'Steady improvement across dimensions, actively growing'
      };
    } else if (average >= 55 && balance >= 50) {
      return {
        phase: language === 'zh' ? '🌱 成长阶段' : '🌱 Growth Phase',
        description: language === 'zh' ? '开始整合各维度，寻找平衡点' : 'Beginning to integrate dimensions, finding balance'
      };
    } else {
      return {
        phase: language === 'zh' ? '🌅 觉醒阶段' : '🌅 Awakening Phase',
        description: language === 'zh' ? '正在觉察自我，探索内在潜能' : 'Awakening to self-awareness, exploring inner potential'
      };
    }
  };

  // 获取维度对应的文本标签
  const getDimensionLabel = (dimension: string, data: FiveDimensionalData) => {
    if (!profileData) return '';

    const dimensionName = dimension.includes('MBTI') || dimension.includes('人格')
      ? 'mbti'
      : dimension.includes('星座') || dimension.includes('Zodiac')
      ? 'zodiac'
      : dimension.includes('脉轮') || dimension.includes('Chakra')
      ? 'chakra'
      : dimension.includes('元素') || dimension.includes('Elemental')
      ? 'element'
      : dimension.includes('行星') || dimension.includes('Planetary')
      ? 'planet'
      : dimension.includes('生命密码') || dimension.includes('Life Path')
      ? 'lifepath'
      : '';

    switch (dimensionName) {
      case 'mbti':
        return profileData.mbtiLikeType?.match(/\b([IE][NS][TF][JP])\b/)?.[0] || 'XXXX';

      case 'zodiac':
        return profileData.inferredZodiac || '未知';

      case 'chakra':
        // 找出最需要平衡的脉轮
        if (chakraScores) {
          const chakraValues = [
            { name: '海底轮', value: chakraScores.rootChakraFocus },
            { name: '生殖轮', value: chakraScores.sacralChakraFocus },
            { name: '太阳轮', value: chakraScores.solarPlexusChakraFocus },
            { name: '心轮', value: chakraScores.heartChakraFocus },
            { name: '喉轮', value: chakraScores.throatChakraFocus },
            { name: '眉心轮', value: chakraScores.thirdEyeChakraFocus },
            { name: '顶轮', value: chakraScores.crownChakraFocus }
          ].filter(chakra => chakra.value !== undefined && chakra.value !== null && !isNaN(chakra.value));

          if (chakraValues.length > 0) {
            const lowestChakra = chakraValues.reduce((min, current) =>
              current.value < min.value ? current : min
            );
            return lowestChakra.name;
          }
        }
        return '平衡';

      case 'element':
        return profileData.inferredElement || '未知';

      case 'planet':
        return profileData.inferredPlanet || '太阳';

      case 'lifepath':
        // 计算生命路径数字
        const lifePathNumber = calculateLifePathNumber(profileData?.name ? '1990-01-01' : undefined);
        // 将能量分数转换为生命路径数字（1-9, 11, 22, 33）
        const energyToLifePathMap: Record<number, number> = {
          85: 1, 70: 2, 80: 3, 65: 4, 90: 5, 75: 6, 82: 7, 78: 8, 72: 9,
          95: 11, 88: 22, 92: 33
        };

        // 根据能量分数找到对应的生命路径数字
        const reverseMap = Object.entries(energyToLifePathMap).find(([energy, _]) =>
          parseInt(energy) === Math.round(data.energy)
        );

        if (reverseMap) {
          return reverseMap[1].toString();
        }

        // 如果没有精确匹配，根据能量范围估算
        if (data.energy >= 90) return '5';
        if (data.energy >= 85) return '1';
        if (data.energy >= 80) return '3';
        if (data.energy >= 75) return '6';
        if (data.energy >= 70) return '2';
        return '4';

      default:
        return data.energy.toString();
    }
  };

  // 自定义工具提示
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const level = getEnergyLevel(data.energy);
      const dimensionLabel = getDimensionLabel(data.dimension, data);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-800 flex items-center gap-2">
            <span>{data.icon}</span>
            {data.dimension}
          </p>
          <p className="text-sm text-gray-600 mb-2">{data.description}</p>
          <div className="flex items-center gap-2">
            <Badge className={`${level.color} text-white`}>
              {dimensionLabel}
            </Badge>
            <span className="text-sm font-medium">{data.energy}/100</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // 获取详细的理论解释和科学依据
  const getDetailedAnalysisExplanation = () => {
    const sortedData = [...fiveDimensionalData].sort((a, b) => b.energy - a.energy);
    const maxScore = sortedData[0]?.energy || 0;
    const minScore = sortedData[sortedData.length - 1]?.energy || 0;
    const scoreDifference = maxScore - minScore;
    const average = fiveDimensionalData.length > 0 ? 
      fiveDimensionalData.reduce((sum, d) => sum + (d.energy || 0), 0) / fiveDimensionalData.length : 0;
    const variance = fiveDimensionalData.length > 0 ? 
      fiveDimensionalData.reduce((sum, d) => sum + Math.pow((d.energy || 0) - average, 2), 0) / fiveDimensionalData.length : 0;
    const standardDeviation = Math.sqrt(variance) || 0;

    // 安全的数值计算，避免NaN和无效值
    const safeSkewness = standardDeviation > 0 && fiveDimensionalData.length > 0 ? 
      fiveDimensionalData.reduce((sum, d) => sum + Math.pow(((d.energy || 0) - average) / standardDeviation, 3), 0) / fiveDimensionalData.length : 0;
    const safeKurtosis = standardDeviation > 0 && fiveDimensionalData.length > 0 ? 
      fiveDimensionalData.reduce((sum, d) => sum + Math.pow(((d.energy || 0) - average) / standardDeviation, 4), 0) / fiveDimensionalData.length - 3 : 0;
    const safeCoefficientVariation = average > 0 ? (standardDeviation / average * 100) : 0;

    return {
      strengthsExplanation: {
        title: language === 'zh' ? '🌟 优势分析的科学依据' : '🌟 Scientific Basis for Strengths Analysis',
        content: language === 'zh' ? (
          synergyAnalysis.harmoniousAreas.length > 0 ? 
          `您的能量分析显示出${synergyAnalysis.harmoniousAreas.length}个和谐区域，这基于**心理学整体论**（Gestalt Psychology）原理。当个体的不同心理维度达到相对平衡时，会产生"1+1>2"的协同效应。

**理论依据：**
• **卡尔·荣格的类型学理论** - 《心理类型》(1921)：不同心理功能的平衡发展
• **亚伯拉罕·马斯洛的自我实现理论** - 《动机与人格》(1954)：整合性人格发展
• **系统论心理学** - 路德维希·冯·贝塔朗菲《一般系统论》(1968)：系统内各要素的协调性

**分析原理：**
当您各维度能量在平均值±15分范围内（标准差: ${standardDeviation.toFixed(1)}分），表明您的心理能量系统具有良好的**内在一致性**。这种平衡状态有利于：
1. 认知资源的有效配置
2. 情绪调节的稳定性
3. 行为表现的一致性` : 
          `您目前各维度发展相对均衡（能量差距${scoreDifference.toFixed(1)}分 < 30分阈值），这符合**发展心理学**中的"均衡发展"理论。

**科学依据：**
• **埃里克·埃里克森的心理社会发展理论** - 强调各发展阶段的均衡性
• **霍华德·加德纳的多元智能理论** - 《智能的结构》(1983)：多种智能的协调发展
• **正向心理学** - 马丁·塞利格曼《真实的幸福》(2002)：优势识别与发挥

根据统计学原理，当数据分布的变异系数（CV = ${safeCoefficientVariation.toFixed(1)}%）< 30%时，说明各维度发展具有良好的稳定性和可预测性。`
        ) : (
          synergyAnalysis.harmoniousAreas.length > 0 ? 
          `Your energy analysis reveals ${synergyAnalysis.harmoniousAreas.length} harmonious areas, based on **Gestalt Psychology** principles. When different psychological dimensions achieve relative balance, they create a synergistic effect where "1+1>2".

**Theoretical Foundation:**
• **Carl Jung's Typology Theory** - "Psychological Types" (1921): Balanced development of psychological functions
• **Abraham Maslow's Self-Actualization Theory** - "Motivation and Personality" (1954): Integrated personality development
• **Systems Psychology** - Ludwig von Bertalanffy's "General System Theory" (1968): Coordination of system elements

**Analysis Principle:**
With your dimensional energies within ±15 points of average (Standard deviation: ${standardDeviation.toFixed(1)} points), your psychological energy system shows good **internal consistency**. This balanced state facilitates:
1. Effective allocation of cognitive resources
2. Emotional regulation stability  
3. Behavioral consistency` :
          `Your current dimensional development is relatively balanced (energy gap ${scoreDifference.toFixed(1)} points < 30-point threshold), aligning with "balanced development" theory in **Developmental Psychology**.

**Scientific Evidence:**
• **Erik Erikson's Psychosocial Development Theory** - Emphasizes balance across developmental stages
• **Howard Gardner's Multiple Intelligence Theory** - "Frames of Mind" (1983): Coordinated development of multiple intelligences
• **Positive Psychology** - Martin Seligman's "Authentic Happiness" (2002): Strength identification and utilization

According to statistical principles, when the coefficient of variation (CV = ${safeCoefficientVariation.toFixed(1)}%) < 30%, it indicates good stability and predictability in dimensional development.`
        )
      },
      challengesExplanation: {
        title: language === 'zh' ? '🤔 挑战分析的心理学原理' : '🤔 Psychological Principles of Challenge Analysis',
        content: language === 'zh' ? (
          synergyAnalysis.conflictAreas.length > 0 ? 
          `检测到${synergyAnalysis.conflictAreas.length}个潜在冲突区域，这并非缺陷，而是个性复杂性的体现。根据**认知失调理论**（Leon Festinger, 1957），适度的内在冲突实际上是心理成长的动力。

**能量分布不均的科学解释：**
当能量差距 > 30分时（您的差距：${scoreDifference.toFixed(1)}分），表明存在**发展不平衡**现象。这基于：

• **维果茨基的最近发展区理论** - 《思维与语言》(1934)：不平衡推动发展
• **皮亚杰的认知发展理论** - 平衡化过程中的暂时失衡
• **动力系统理论** - Thelen & Smith (1994)：系统在动态变化中寻求新平衡

**统计学依据：**
- 标准差: ${standardDeviation.toFixed(1)}分（> 10分表示显著差异）
- 变异系数: ${safeCoefficientVariation.toFixed(1)}%（> 15%显示不均匀性）
- 能量范围: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)}分

这种不平衡并非永久性，而是**发展过程中的自然现象**，为您指明了成长方向。` : 
          `暂未检测到显著冲突区域（能量差距 < 30分），这表明您的心理系统具有良好的**内在协调性**。根据**自我一致性理论**（Carl Rogers, 1959），这种状态有利于自我实现。

**平衡状态的心理学意义：**
• **认知和谐** - 不同心理功能协调运作
• **情绪稳定** - 内在冲突较少，情绪波动小
• **行为一致** - 价值观与行为表现统一

**维持建议基于：**
- **积极心理学理论** - 强化已有优势
- **系统维护原理** - 定期检视和微调
- **预防性发展策略** - 避免单一维度过度发展`
        ) : (
          synergyAnalysis.conflictAreas.length > 0 ? 
          `${synergyAnalysis.conflictAreas.length} potential conflict areas detected. This isn't a flaw but reflects personality complexity. According to **Cognitive Dissonance Theory** (Leon Festinger, 1957), moderate internal conflicts actually drive psychological growth.

**Scientific Explanation of Uneven Energy Distribution:**
When energy gap > 30 points (Your gap: ${scoreDifference.toFixed(1)} points), it indicates **developmental imbalance**. This is based on:

• **Vygotsky's Zone of Proximal Development Theory** - "Thought and Language" (1934): Imbalance drives development
• **Piaget's Cognitive Development Theory** - Temporary disequilibrium in equilibration process
• **Dynamic Systems Theory** - Thelen & Smith (1994): Systems seek new balance through dynamic change

**Statistical Evidence:**
- Standard Deviation: ${standardDeviation.toFixed(1)} points (>10 indicates significant variation)
- Coefficient of Variation: ${safeCoefficientVariation.toFixed(1)}% (>15% shows unevenness)
- Energy Range: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)} points

This imbalance isn't permanent but a **natural phenomenon in development**, pointing toward your growth direction.` :
          `No significant conflict areas detected (energy gap < 30 points), indicating good **internal coordination** in your psychological system. According to **Self-Consistency Theory** (Carl Rogers, 1959), this state facilitates self-actualization.

**Psychological Significance of Balance:**
• **Cognitive Harmony** - Different psychological functions work coordinately
• **Emotional Stability** - Less internal conflict, smaller emotional fluctuations
• **Behavioral Consistency** - Values align with behavioral expressions

**Maintenance recommendations based on:**
- **Positive Psychology Theory** - Strengthen existing strengths
- **System Maintenance Principles** - Regular review and fine-tuning
- **Preventive Development Strategy** - Avoid over-development of single dimensions`
        )
      },
      energyDistributionAnalysis: {
        title: language === 'zh' ? '📊 能量分布的数学模型' : '📊 Mathematical Model of Energy Distribution',
        content: language === 'zh' ? 
          `您的能量分布遵循**正态分布的变形**，这在心理测量学中是常见现象。

**数学分析：**
- 平均值：${average.toFixed(1)}分
- 标准差：${standardDeviation.toFixed(1)}分  
- 偏度系数：${safeSkewness.toFixed(2)}
- 峰度系数：${safeKurtosis.toFixed(2)}

**理论参考：**
• **心理测量学** - Robert J. Sternberg《认知心理学》(2009)
• **个体差异心理学** - Arthur Jensen《The g Factor》(1998)
• **统计心理学** - Jacob Cohen《Statistical Power Analysis》(1988)

**临床意义：**
根据心理学研究，健康个体的多维能量分布应呈现**适度变异性**（CV: 10-25%），您的变异系数为${safeCoefficientVariation.toFixed(1)}%，${safeCoefficientVariation > 25 ? '略高于正常范围，建议关注平衡发展' : safeCoefficientVariation < 10 ? '变异性较低，可能过于一致化' : '处于健康范围内'}。` :
          `Your energy distribution follows a **modified normal distribution**, which is common in psychometrics.

**Mathematical Analysis:**
- Mean: ${average.toFixed(1)} points
- Standard Deviation: ${standardDeviation.toFixed(1)} points
- Skewness: ${safeSkewness.toFixed(2)}
- Kurtosis: ${safeKurtosis.toFixed(2)}

**Theoretical References:**
• **Psychometrics** - Robert J. Sternberg "Cognitive Psychology" (2009)
• **Individual Differences Psychology** - Arthur Jensen "The g Factor" (1998)
• **Statistical Psychology** - Jacob Cohen "Statistical Power Analysis" (1988)

**Clinical Significance:**
According to psychological research, healthy individuals should show **moderate variability** in multi-dimensional energy distribution (CV: 10-25%). Your coefficient of variation is ${safeCoefficientVariation.toFixed(1)}%, which is ${safeCoefficientVariation > 25 ? 'slightly above normal range, suggesting focus on balanced development' : safeCoefficientVariation < 10 ? 'relatively low variability, potentially over-consistent' : 'within healthy range'}.`
      }
    };
  };

  // ===== 8维专属功能函数 =====
  
  // 生成能量原型
  const generateEnergyArchetype = () => {
    if (!hasEnhancedData) return '探索者';
    
    // 基于具体问卷数据分析能量原型
    const physicalScore = calculatePhysicalEnergy(physicalAssessment);
    const socialScore = calculateSocialEnergy(socialAssessment);
    const financialScore = calculateFinancialEnergy(financialEnergyAssessment);
    const emotionalScore = calculateEmotionalIntelligence(emotionalIntelligenceAssessment);
    const rhythmScore = calculateLifeRhythmEnergy(lifeRhythm);
    
    // 分析用户的MBTI偏好
    const mbtiType = profileData?.mbtiLikeType || '';
    const isExtrovert = mbtiType.includes('E');
    const isIntuitive = mbtiType.includes('N');
    const isFeeling = mbtiType.includes('F');
    const isJudging = mbtiType.includes('J');
    
    // 深度分析用户特质
    let archetype = '';
    let confidence = 0;
    
    // 高情商 + 高社交 = 人际关系专家
    if (emotionalScore > 80 && socialScore > 75) {
      archetype = language === 'zh' ? '心灵治愈师' : 'Soul Healer';
      confidence = Math.min(95, (emotionalScore + socialScore) / 2);
    }
    // 高财务 + 高生活节奏 = 成功导向者
    else if (financialScore > 80 && rhythmScore > 75) {
      archetype = language === 'zh' ? '丰盛创造者' : 'Abundance Creator';
      confidence = Math.min(95, (financialScore + rhythmScore) / 2);
    }
    // 高身体 + 高生活节奏 = 活力领袖
    else if (physicalScore > 80 && rhythmScore > 75) {
      archetype = language === 'zh' ? '生命力导师' : 'Vitality Master';
      confidence = Math.min(95, (physicalScore + rhythmScore) / 2);
    }
    // MBTI + 情感模式分析
    else if (isExtrovert && isFeeling && emotionalScore > 70) {
      archetype = language === 'zh' ? '温暖连接者' : 'Warm Connector';
      confidence = Math.min(90, emotionalScore);
    }
    else if (!isExtrovert && isIntuitive && emotionalScore > 65) {
      archetype = language === 'zh' ? '深度洞察者' : 'Deep Insight';
      confidence = Math.min(85, emotionalScore);
    }
    else if (isJudging && financialScore > 65 && rhythmScore > 65) {
      archetype = language === 'zh' ? '稳健建构者' : 'Steady Builder';
      confidence = Math.min(85, (financialScore + rhythmScore) / 2);
    }
    // 平衡发展型
    else {
      const avgScore = (physicalScore + socialScore + financialScore + emotionalScore + rhythmScore) / 5;
      if (avgScore > 70) {
        archetype = language === 'zh' ? '全面发展者' : 'Well-Rounded Developer';
    } else {
        archetype = language === 'zh' ? '成长探索者' : 'Growth Explorer';
    }
      confidence = Math.min(80, avgScore);
    }
    
    return `${archetype} (${Math.round(confidence)}%匹配度)`;
  };

  // 生成原型描述
  const generateArchetypeDescription = () => {
    const archetype = generateEnergyArchetype();
    
    const descriptions: Record<string, string> = {
      '灵性导师': '你具备深度的内在智慧和强大的人际连接能力，天生具有指导他人的天赋',
      'Spiritual Guide': 'You possess deep inner wisdom and strong interpersonal connection abilities, naturally gifted at guiding others',
      '和谐使者': '你擅长在复杂的人际关系中寻找平衡，是天然的调解者和团队协调者',
      'Harmony Ambassador': 'You excel at finding balance in complex relationships, a natural mediator and team coordinator',
      '智慧隐者': '你倾向于深度思考和内在探索，拥有独特的洞察力和创新思维',
      'Wise Hermit': 'You tend toward deep thinking and inner exploration, possessing unique insights and innovative thinking',
      '创意领袖': '你结合了创造力和领导力，能够激发他人并引导团队实现创新目标',
      'Creative Leader': 'You combine creativity and leadership, able to inspire others and guide teams toward innovative goals',
      '平衡探索者': '你在各个维度都保持着良好的平衡，是一个全面发展的个体',
      'Balanced Explorer': 'You maintain good balance across all dimensions, representing well-rounded development'
    };
    
    return descriptions[archetype] || descriptions['平衡探索者'];
  };

  // 生成原型优势
  const generateArchetypeStrengths = () => {
    const archetype = generateEnergyArchetype();
    
    const strengths: Record<string, string> = {
      '灵性导师': '你的优势在于能够深入理解人性，具有强大的共情能力和指导天赋。你能够帮助他人发现内在潜力，并在人生重要节点提供智慧指引。',
      'Spiritual Guide': 'Your strength lies in deep understanding of human nature, strong empathy and guidance abilities. You can help others discover inner potential and provide wise guidance at important life junctures.',
      '和谐使者': '你的天赋是化解冲突、促进合作。你能敏锐地察觉到群体动态，并运用高情商来建立桥梁，创造双赢的局面。',
      'Harmony Ambassador': 'Your gift is resolving conflicts and promoting cooperation. You can keenly perceive group dynamics and use high emotional intelligence to build bridges and create win-win situations.',
      '智慧隐者': '你具有深度思考的能力和独特的洞察力。你能够看到别人看不到的模式和连接，在复杂问题中找到创新解决方案。',
      'Wise Hermit': 'You have deep thinking abilities and unique insights. You can see patterns and connections others miss, finding innovative solutions to complex problems.',
      '创意领袖': '你结合了创新思维和实执行力。你能够将抽象的想法转化为具体行动，并激励团队共同实现创造性目标。',
      'Creative Leader': 'You combine innovative thinking with practical execution. You can transform abstract ideas into concrete actions and inspire teams to achieve creative goals together.',
      '平衡探索者': '你的最大优势是适应性强和全面发展。你能够在不同环境中保持稳定表现，是可靠的团队成员和问题解决者。',
      'Balanced Explorer': 'Your greatest strength is strong adaptability and comprehensive development. You can maintain stable performance in different environments, being a reliable team member and problem solver.'
    };
    
    return strengths[archetype] || strengths['平衡探索者'];
  };

  // 生成能量数字
  const generateEnergyNumbers = () => {
    if (!hasEnhancedData) return [];
    
    const scores = displayData.map(d => d.energy);
    const lifePathNumber = calculateLifePathNumber(profileData?.name);
    
    return [
      {
        name: language === 'zh' ? '生命密码' : 'Life Path',
        value: lifePathNumber.toString(),
        meaning: language === 'zh' ? '你的人生使命数字' : 'Your life mission number'
      },
      {
        name: language === 'zh' ? '能量总和' : 'Energy Sum',
        value: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length).toString(),
        meaning: language === 'zh' ? `${hasEnhancedData ? '八' : '五'}维平均能量值` : `${hasEnhancedData ? 'Eight' : 'Five'}-dimensional average energy`
      },
      {
        name: language === 'zh' ? '平衡指数' : 'Balance Index',
        value: synergyAnalysis.balanceScore.toString(),
        meaning: language === 'zh' ? '各维度协调程度' : 'Coordination level across dimensions'
      }
    ];
  };

  // 获取社交风格
  const getSocialStyle = () => {
    if (!hasEnhancedData) return '友好型';
    
    const socialEnergy = calculateSocialEnergy(socialAssessment);
    const emotionalIntelligence = calculateEmotionalIntelligence(emotionalIntelligenceAssessment);
    
    if (socialEnergy > 80 && emotionalIntelligence > 75) {
      return language === 'zh' ? '魅力领袖' : 'Charismatic Leader';
    } else if (socialEnergy > 70 && emotionalIntelligence < 60) {
      return language === 'zh' ? '热情外向' : 'Enthusiastic Extrovert';
    } else if (socialEnergy < 50 && emotionalIntelligence > 70) {
      return language === 'zh' ? '深度共情' : 'Deep Empath';
    } else if (socialEnergy < 40) {
      return language === 'zh' ? '独立自主' : 'Independent';
    } else {
      return language === 'zh' ? '平衡社交' : 'Balanced Social';
    }
  };

  // 获取社交风格描述
  const getSocialStyleDescription = () => {
    const style = getSocialStyle();
    const descriptions: Record<string, string> = {
      '魅力领袖': '你在社交场合中自然成为焦点，既有感染力又善解人意',
      'Charismatic Leader': 'You naturally become the center of attention in social situations, both charismatic and empathetic',
      '热情外向': '你喜欢与人交往，精力充沛，但有时可能忽略他人的情感需求',
      'Enthusiastic Extrovert': 'You enjoy interacting with people and are energetic, but may sometimes overlook others\' emotional needs',
      '深度共情': '你善于理解他人情感，但在大型社交场合可能感到疲惫',
      'Deep Empath': 'You\'re good at understanding others\' emotions but may feel drained in large social settings',
      '独立自主': '你更喜欢小圈子或一对一的深度交流，重视质量胜过数量',
      'Independent': 'You prefer small circles or one-on-one deep conversations, valuing quality over quantity',
      '平衡社交': '你能适应不同的社交环境，既不过分外向也不过分内向',
      'Balanced Social': 'You can adapt to different social environments, neither overly extroverted nor introverted'
    };
    
    return descriptions[style] || descriptions['平衡社交'];
  };

  // 获取情感模式
  const getEmotionalPattern = () => {
    if (!hasEnhancedData) return '稳定型';
    
    const emotionalIntelligence = calculateEmotionalIntelligence(emotionalIntelligenceAssessment);
    const mbtiType = profileData?.mbtiLikeType || '';
    
    if (emotionalIntelligence > 85) {
      return language === 'zh' ? '情感大师' : 'Emotional Master';
    } else if (emotionalIntelligence > 70 && mbtiType.includes('F')) {
      return language === 'zh' ? '感性共鸣' : 'Empathetic Resonance';
    } else if (emotionalIntelligence > 70 && mbtiType.includes('T')) {
      return language === 'zh' ? '理性调节' : 'Rational Regulation';
    } else if (emotionalIntelligence < 50) {
      return language === 'zh' ? '探索成长' : 'Growing Explorer';
    } else {
      return language === 'zh' ? '平和稳定' : 'Peaceful Stability';
    }
  };

  // 获取情感模式描述
  const getEmotionalPatternDescription = () => {
    const pattern = getEmotionalPattern();
    const descriptions: Record<string, string> = {
      '情感大师': '你对情感有深刻理解，能够很好地管理自己和影响他人的情绪',
      'Emotional Master': 'You have deep understanding of emotions and can manage your own and influence others\' emotions well',
      '感性共鸣': '你天生具有强烈的同理心，能够深度感受他人的情感状态',
      'Empathetic Resonance': 'You naturally have strong empathy and can deeply feel others\' emotional states',
      '理性调节': '你善于用逻辑思维来处理情感问题，保持客观冷静',
      'Rational Regulation': 'You\'re good at using logical thinking to handle emotional issues, staying objective and calm',
      '探索成长': '你正在学习如何更好地理解和管理情感，这是一个成长的过程',
      'Growing Explorer': 'You\'re learning how to better understand and manage emotions, which is a growth process',
      '平和稳定': '你的情感状态相对稳定，不容易被外界因素过度影响',
      'Peaceful Stability': 'Your emotional state is relatively stable and not easily overly affected by external factors'
    };
    
    return descriptions[pattern] || descriptions['平和稳定'];
  };

  // 获取关系建议
  const getRelationshipAdvice = () => {
    if (!hasEnhancedData) return [language === 'zh' ? '保持真实的自己，同时对他人保持开放态度' : 'Stay true to yourself while remaining open to others'];
    
    const socialScore = calculateSocialEnergy(socialAssessment);
    const emotionalScore = calculateEmotionalIntelligence(emotionalIntelligenceAssessment);
    const mbtiType = profileData?.mbtiLikeType || '';
    
    const advice = [];
    
    // 基于具体社交能量分析
    if (socialScore > 85) {
      advice.push({
        area: language === 'zh' ? '社交优势管理' : 'Social Advantage Management',
        suggestion: language === 'zh' ? '你的社交能力很强，要注意不要在社交中消耗过多精力。学会选择性社交，专注于深度关系。' : 'Your social skills are strong. Be careful not to consume too much energy in socializing. Learn selective socializing and focus on deep relationships.',
        actionStep: language === 'zh' ? '每周安排1-2次独处时间充电' : 'Schedule 1-2 solo recharge times per week'
      });
    } else if (socialScore < 50) {
      advice.push({
        area: language === 'zh' ? '社交能力提升' : 'Social Skills Enhancement',
        suggestion: language === 'zh' ? '可以从小型聚会开始练习社交技巧，选择你感兴趣的话题作为社交切入点。' : 'Start practicing social skills at small gatherings, choose topics you\'re interested in as social entry points.',
        actionStep: language === 'zh' ? '每周参加一次小型聚会或兴趣小组' : 'Attend one small gathering or interest group per week'
      });
    }
    
    // 基于情商分析
    if (emotionalScore > 80) {
      advice.push({
        area: language === 'zh' ? '情感边界设定' : 'Emotional Boundary Setting',
        suggestion: language === 'zh' ? '你的共情能力很强，容易感受到他人的情绪。需要学会保护自己的情感空间，避免情绪过载。' : 'Your empathy is strong and you easily sense others\' emotions. Learn to protect your emotional space and avoid emotional overload.',
        actionStep: language === 'zh' ? '建立每日情感清理仪式（如冥想、写日记）' : 'Establish daily emotional clearing rituals (meditation, journaling)'
      });
    } else if (emotionalScore < 60) {
      advice.push({
        area: language === 'zh' ? '情感认知提升' : 'Emotional Awareness Enhancement',
        suggestion: language === 'zh' ? '可以通过观察他人的表情和语调来提升情感敏感度，练习识别不同的情绪状态。' : 'Improve emotional sensitivity by observing others\' expressions and tone, practice identifying different emotional states.',
        actionStep: language === 'zh' ? '每天练习情绪识别：记录自己和他人的3种情绪' : 'Daily emotion recognition practice: record 3 emotions of self and others'
      });
    }
    
    // 基于MBTI特质的关系建议
    if (mbtiType.includes('E') && mbtiType.includes('F')) {
      advice.push({
        area: language === 'zh' ? '关系深度管理' : 'Relationship Depth Management',
        suggestion: language === 'zh' ? '你喜欢与人建立深入连接，但要注意不要在初期关系中过度投入。循序渐进地建立信任。' : 'You like to build deep connections with people, but be careful not to over-invest in early relationships. Build trust gradually.',
        actionStep: language === 'zh' ? '新关系前3个月保持适度距离，观察对方' : 'Maintain moderate distance in new relationships for first 3 months, observe the other person'
      });
    } else if (mbtiType.includes('I') && mbtiType.includes('T')) {
      advice.push({
        area: language === 'zh' ? '情感表达练习' : 'Emotional Expression Practice',
        suggestion: language === 'zh' ? '你可能习惯理性分析，但在亲密关系中适当表达情感会让关系更温暖。' : 'You may be used to rational analysis, but appropriate emotional expression in intimate relationships will make them warmer.',
        actionStep: language === 'zh' ? '每天向重要的人表达一次感谢或关心' : 'Express gratitude or care to important people once daily'
      });
    }
    
    // 确保至少有一条建议
    if (advice.length === 0) {
      advice.push({
        area: language === 'zh' ? '关系平衡' : 'Relationship Balance',
        suggestion: language === 'zh' ? '你在人际关系中表现平衡，继续保持真实的自己，同时对他人保持开放态度。' : 'You show balance in relationships. Continue being authentic while staying open to others.',
        actionStep: language === 'zh' ? '每周反思一次：我在关系中是否保持了真实的自己？' : 'Weekly reflection: Am I staying authentic in my relationships?'
      });
    }
    
    return advice;
  };

  // 获取财务人格
  const getFinancialPersonality = () => {
    if (!hasEnhancedData || !financialEnergyAssessment || !lifeRhythm) {
      return language === 'zh' ? '请完善财务问卷，解锁专属财务人格分析' : 'Please complete the financial questionnaire to unlock your financial personality analysis';
    }
    
    const financialEnergy = calculateFinancialEnergy(financialEnergyAssessment);
    const lifeRhythmEnergy = calculateLifeRhythmEnergy(lifeRhythm);
    
    if (financialEnergy > 85 && lifeRhythmEnergy > 75) {
      return language === 'zh' ? '财富创造者' : 'Wealth Creator';
    } else if (financialEnergy > 75) {
      return language === 'zh' ? '丰盛吸引者' : 'Abundance Attractor';
    } else if (financialEnergy < 40) {
      return language === 'zh' ? '金钱学习者' : 'Money Learner';
    } else if (lifeRhythmEnergy > 70) {
      return language === 'zh' ? '稳健规划者' : 'Steady Planner';
    } else {
      return language === 'zh' ? '平衡管理者' : 'Balanced Manager';
    }
  };

  // 获取财务人格描述
  const getFinancialPersonalityDescription = () => {
    const personality = getFinancialPersonality();
    const descriptions: Record<string, string> = {
      '财富创造者': '你具有很强的财富意识和创造能力，善于发现机会并转化为价值',
      'Wealth Creator': 'You have strong wealth consciousness and creative ability, good at finding opportunities and converting them to value',
      '丰盛吸引者': '你对金钱有正面的态度，相信丰盛，具有吸引财富的心态',
      'Abundance Attractor': 'You have a positive attitude toward money, believe in abundance, and have a wealth-attracting mindset',
      '金钱学习者': '你正在学习如何更好地管理财务，建立健康的金钱观念',
      'Money Learner': 'You\'re learning how to better manage finances and build healthy money concepts',
      '稳健规划者': '你倾向于稳定的财务规划，注重长期积累和风险控制',
      'Steady Planner': 'You tend toward stable financial planning, focusing on long-term accumulation and risk control',
      '平衡管理者': '你在财务管理上保持平衡，既不过分保守也不过分激进',
      'Balanced Manager': 'You maintain balance in financial management, neither overly conservative nor aggressive'
    };
    
    return descriptions[personality] || descriptions['平衡管理者'];
  };

  // 获取财务特征
  const getFinancialTraits = () => {
    const personality = getFinancialPersonality();
    
    const traits: Record<string, string[]> = {
      '财富创造者': ['善于发现商机', '敢于投资冒险', '具有长远眼光', '注重价值创造'],
      'Wealth Creator': ['Good at spotting opportunities', 'Willing to invest and take risks', 'Has long-term vision', 'Focuses on value creation'],
      '丰盛吸引者': ['积极的金钱观', '相信财富流动', '慷慨分享', '感恩心态'],
      'Abundance Attractor': ['Positive money mindset', 'Believes in wealth flow', 'Generous sharing', 'Grateful attitude'],
      '金钱学习者': ['开放学习态度', '注重基础建设', '谨慎但积极', '重视专业建议'],
      'Money Learner': ['Open learning attitude', 'Focuses on foundation building', 'Cautious but positive', 'Values professional advice'],
      '稳健规划者': ['风险控制意识强', '注重长期规划', '保守投资风格', '重视安全性'],
      'Steady Planner': ['Strong risk control awareness', 'Focuses on long-term planning', 'Conservative investment style', 'Values security'],
      '平衡管理者': ['理性决策', '灵活应变', '均衡配置', '稳中求进'],
      'Balanced Manager': ['Rational decision-making', 'Flexible adaptation', 'Balanced allocation', 'Steady progress']
    };
    
    return traits[personality] || traits['平衡管理者'];
  };

  // 获取个性化理财建议
  const getPersonalizedFinancialAdvice = () => {
    if (!hasEnhancedData) {
      return [
        {
          category: language === 'zh' ? '基础理财' : 'Basic Finance',
          suggestion: language === 'zh' ? '从建立预算和储蓄习惯开始，逐步学习投资知识' : 'Start with budgeting and saving habits, gradually learn investment knowledge',
          benefit: language === 'zh' ? '建立稳固的财务基础' : 'Build solid financial foundation',
          priority: language === 'zh' ? '高优先级' : 'High Priority',
          timeline: language === 'zh' ? '1-3个月' : '1-3 months'
        }
      ];
    }
    
    const financialScore = calculateFinancialEnergy(financialEnergyAssessment);
    const rhythmScore = calculateLifeRhythmEnergy(lifeRhythm);
    const mbtiType = profileData?.mbtiLikeType || '';
    let age = 25;
    if (profileData && (profileData as any).birthDate) {
      const birth = new Date((profileData as any).birthDate);
      if (!isNaN(birth.getTime())) {
        const now = new Date();
        age = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
          age--;
        }
      }
    }
    
    const advice = [];
    
    // 基于财务能量分析
    if (financialScore > 80) {
      advice.push({
        category: language === 'zh' ? '高级投资策略' : 'Advanced Investment Strategy',
        suggestion: language === 'zh' ? `基于你${financialScore}分的财务能量，建议将资产30%配置高风险高收益投资，40%中等风险基金，30%保守型投资。` : `Based on your financial energy score of ${financialScore}, allocate 30% to high-risk high-return investments, 40% to medium-risk funds, 30% to conservative investments.`,
        benefit: language === 'zh' ? '最大化你的财务天赋，实现财富快速增长' : 'Maximize your financial talent for rapid wealth growth',
        priority: language === 'zh' ? '高优先级' : 'High Priority',
        timeline: language === 'zh' ? '立即执行' : 'Execute immediately'
      });
    } else if (financialScore < 50) {
      advice.push({
        category: language === 'zh' ? '财务基础建设' : 'Financial Foundation Building',
        suggestion: language === 'zh' ? `你的财务能量${financialScore}分偏低，建议先建立3-6个月生活费的应急基金，学习基础理财知识。` : `Your financial energy score of ${financialScore} is low. Start by building 3-6 months emergency fund and learning basic financial knowledge.`,
        benefit: language === 'zh' ? '建立稳固的财务安全网' : 'Build solid financial safety net',
        priority: language === 'zh' ? '最高优先级' : 'Highest Priority',
        timeline: language === 'zh' ? '3-6个月完成' : '3-6 months to complete'
      });
    }
    
    // 基于生活节奏分析
    if (rhythmScore > 75) {
      advice.push({
        category: language === 'zh' ? '自动化理财' : 'Automated Finance',
        suggestion: language === 'zh' ? `你的生活节奏很好(${rhythmScore}分)，适合设置自动投资计划，每月固定投资额度。` : `Your life rhythm is excellent (${rhythmScore} points), suitable for automated investment plans with fixed monthly amounts.`,
        benefit: language === 'zh' ? '利用你的规律性习惯实现财富稳步增长' : 'Use your regular habits for steady wealth growth',
        priority: language === 'zh' ? '中优先级' : 'Medium Priority',
        timeline: language === 'zh' ? '1个月内设置' : 'Set up within 1 month'
      });
    }
    
    // 基于年龄的建议
    if (age < 30) {
      advice.push({
        category: language === 'zh' ? '青年理财策略' : 'Young Adult Financial Strategy',
        suggestion: language === 'zh' ? '趁年轻可以承担更多风险，建议70%投资型产品，30%储蓄型产品。重点学习投资知识。' : 'Take advantage of youth to handle more risk: 70% investment products, 30% savings products. Focus on learning investment knowledge.',
        benefit: language === 'zh' ? '利用时间复利效应最大化财富积累' : 'Maximize wealth accumulation through compound interest',
        priority: language === 'zh' ? '高优先级' : 'High Priority',
        timeline: language === 'zh' ? '立即开始，持续执行' : 'Start immediately, execute continuously'
      });
    } else if (age > 40) {
      advice.push({
        category: language === 'zh' ? '稳健理财规划' : 'Stable Financial Planning',
        suggestion: language === 'zh' ? '注重资产保值增值，建议50%稳健型投资，30%中等风险产品，20%保险和养老储备。' : 'Focus on asset preservation and growth: 50% stable investments, 30% medium-risk products, 20% insurance and retirement savings.',
        benefit: language === 'zh' ? '确保财务安全，为退休做准备' : 'Ensure financial security and prepare for retirement',
        priority: language === 'zh' ? '高优先级' : 'High Priority',
        timeline: language === 'zh' ? '3个月内调整' : 'Adjust within 3 months'
      });
    }
    
    // 基于MBTI的理财风格建议
    if (mbtiType.includes('J')) {
      advice.push({
        category: language === 'zh' ? '计划型理财' : 'Planned Finance',
        suggestion: language === 'zh' ? '制定详细的5年财务规划，设定明确的财务目标和时间节点。' : 'Create detailed 5-year financial plan with clear financial goals and timelines.',
        benefit: language === 'zh' ? '发挥你的计划优势，系统性积累财富' : 'Leverage your planning strength for systematic wealth accumulation',
        priority: language === 'zh' ? '中优先级' : 'Medium Priority',
        timeline: language === 'zh' ? '1个月内制定' : 'Develop within 1 month'
      });
    } else if (mbtiType.includes('P')) {
      advice.push({
        category: language === 'zh' ? '灵活型理财' : 'Flexible Finance',
        suggestion: language === 'zh' ? '选择流动性较强的投资产品，保持资金的灵活性，以应对机会和变化。' : 'Choose high-liquidity investment products to maintain capital flexibility for opportunities and changes.',
        benefit: language === 'zh' ? '保持财务灵活性，抓住投资机会' : 'Maintain financial flexibility to seize investment opportunities',
        priority: language === 'zh' ? '中优先级' : 'Medium Priority',
        timeline: language === 'zh' ? '根据市场情况调整' : 'Adjust based on market conditions'
      });
    }
    
    // 确保至少有一条建议
    if (advice.length === 0) {
      advice.push({
        category: language === 'zh' ? '均衡理财' : 'Balanced Finance',
        suggestion: language === 'zh' ? '保持收支平衡，适度投资，建立多元化的投资组合。' : 'Maintain income-expense balance, moderate investment, build diversified portfolio.',
        benefit: language === 'zh' ? '稳定的财务增长' : 'Stable financial growth',
        priority: language === 'zh' ? '中优先级' : 'Medium Priority',
        timeline: language === 'zh' ? '持续执行' : 'Execute continuously'
      });
    }
    
    return advice.slice(0, 3); // 最多返回3条建议
  };

  // 获取增强水晶推荐
  const getEnhancedCrystalRecommendations = () => {
    if (!hasEnhancedData) return [{
      name: language === 'zh' ? '请完善八维能量问卷，解锁个性化水晶推荐' : 'Please complete the 8D energy questionnaire to unlock personalized crystal recommendations',
      icon: '📄',
      color: 'bg-gray-300',
      energyType: '',
      description: '',
      personalEffect: '',
      usage: '',
      targetImprovement: ''
    }];
    
    const physicalScore = calculatePhysicalEnergy(physicalAssessment);
    const socialScore = calculateSocialEnergy(socialAssessment);
    const financialScore = calculateFinancialEnergy(financialEnergyAssessment);
    const emotionalScore = calculateEmotionalIntelligence(emotionalIntelligenceAssessment);
    const rhythmScore = calculateLifeRhythmEnergy(lifeRhythm);
    const mbtiType = profileData?.mbtiLikeType || '';
    
    const recommendations = [];
    
    // 分析最需要提升的维度
    const scores = [
      { name: 'physical', score: physicalScore },
      { name: 'social', score: socialScore },
      { name: 'financial', score: financialScore },
      { name: 'emotional', score: emotionalScore },
      { name: 'rhythm', score: rhythmScore }
    ];
    scores.sort((a, b) => a.score - b.score);
    
    // 基于最弱的维度推荐水晶
    const weakestDimension = scores[0];
    const weakestScore = weakestDimension.score;
    
    switch (weakestDimension.name) {
      case 'physical':
      recommendations.push({
          name: language === 'zh' ? '红玛瑙' : 'Red Agate',
          icon: '🔴',
          color: 'bg-primary',
          energyType: language === 'zh' ? '身体活力' : 'Physical Vitality',
          description: language === 'zh' ? '增强体力和行动力的守护石，激发生命活力' : 'Guardian stone that enhances stamina and action power, ignites life vitality',
          personalEffect: language === 'zh' ? `你的身体能量${weakestScore}分偏低，红玛瑙将帮助你恢复活力，增强体能和耐力` : `Your physical energy of ${weakestScore} is low, Red Agate will help restore vitality and enhance stamina`,
          usage: language === 'zh' ? '运动前佩戴或握在手中，激发身体潜能' : 'Wear or hold before exercise to unleash physical potential',
          targetImprovement: language === 'zh' ? `预期提升身体能量10-15分` : `Expected to improve physical energy by 10-15 points`
        });
        break;
        
      case 'social':
        const crystalChoice = socialScore < 40 ? 
          {
            name: language === 'zh' ? '天河石' : 'Amazonite',
            icon: '🌊',
            color: 'bg-teal-500',
            description: language === 'zh' ? '勇气与沟通之石，帮助克服社交恐惧' : 'Stone of courage and communication, helps overcome social fears'
          } : 
          {
        name: language === 'zh' ? '粉晶' : 'Rose Quartz',
        icon: '💎',
        color: 'bg-pink-500',
            description: language === 'zh' ? '爱情与人际关系的守护石，增强人际魅力' : 'Guardian stone of love and relationships, enhances interpersonal charm'
          };
        
        recommendations.push({
          ...crystalChoice,
        energyType: language === 'zh' ? '社交能量' : 'Social Energy',
          personalEffect: language === 'zh' ? `你的社交能量${weakestScore}分需要提升，${crystalChoice.name}将帮助你在人际交往中更加自信自在` : `Your social energy of ${weakestScore} needs improvement, ${crystalChoice.name} will help you be more confident in interpersonal interactions`,
          usage: language === 'zh' ? '社交场合前佩戴在心轮位置，增强个人磁场' : 'Wear at heart chakra before social occasions to enhance personal magnetic field',
          targetImprovement: language === 'zh' ? `预期提升社交能量10-20分` : `Expected to improve social energy by 10-20 points`
        });
        break;
        
      case 'financial':
        const financialCrystal = financialScore < 40 ? 
          {
            name: language === 'zh' ? '黄水晶' : 'Citrine',
            icon: '💛',
            color: 'bg-primary',
            description: language === 'zh' ? '财富磁石，吸引正财偏财，改善财运' : 'Wealth magnet, attracts both regular and windfall wealth'
          } : 
          {
        name: language === 'zh' ? '绿幽灵' : 'Green Phantom',
        icon: '💚',
        color: 'bg-primary',
            description: language === 'zh' ? '事业财运石，象征财富的层层累积' : 'Career and wealth stone, symbolizes layered wealth accumulation'
          };
          
        recommendations.push({
          ...financialCrystal,
        energyType: language === 'zh' ? '财富能量' : 'Wealth Energy',
          personalEffect: language === 'zh' ? `你的财务能量${weakestScore}分偏低，${financialCrystal.name}将帮助你建立正确的财富观念，吸引丰盛能量` : `Your financial energy of ${weakestScore} is low, ${financialCrystal.name} will help establish correct wealth concepts and attract abundant energy`,
          usage: language === 'zh' ? '放在办公桌财位或随身携带，增强财运磁场' : 'Place on desk wealth position or carry with you to enhance wealth magnetic field',
          targetImprovement: language === 'zh' ? `预期提升财务能量15-25分` : `Expected to improve financial energy by 15-25 points`
        });
        break;
        
      case 'emotional':
        const emotionalCrystal = mbtiType.includes('T') ? 
          {
            name: language === 'zh' ? '月光石' : 'Moonstone',
            icon: '🌙',
            color: 'bg-gray-300',
            description: language === 'zh' ? '情感平衡石，帮助理性型人格开发感性智慧' : 'Emotional balance stone, helps rational personalities develop emotional wisdom'
          } : 
          {
        name: language === 'zh' ? '紫水晶' : 'Amethyst',
        icon: '💜',
        color: 'bg-primary',
            description: language === 'zh' ? '智慧与冷静之石，平衡情绪波动' : 'Stone of wisdom and calm, balances emotional fluctuations'
          };
          
        recommendations.push({
          ...emotionalCrystal,
        energyType: language === 'zh' ? '情绪智能' : 'Emotional Intelligence',
          personalEffect: language === 'zh' ? `你的情绪智能${weakestScore}分有待提升，${emotionalCrystal.name}将帮助你更好地理解和管理情绪` : `Your emotional intelligence of ${weakestScore} needs improvement, ${emotionalCrystal.name} will help you better understand and manage emotions`,
          usage: language === 'zh' ? '冥想时放在眉心轮或睡前放在枕头下' : 'Place at third eye chakra during meditation or under pillow before sleep',
          targetImprovement: language === 'zh' ? `预期提升情绪智能12-18分` : `Expected to improve emotional intelligence by 12-18 points`
        });
        break;
        
      case 'rhythm':
        recommendations.push({
          name: language === 'zh' ? '黑曜石' : 'Obsidian',
          icon: '⚫',
          color: 'bg-black',
          energyType: language === 'zh' ? '生活节奏' : 'Life Rhythm',
          description: language === 'zh' ? '稳定与专注之石，帮助建立规律的生活节奏' : 'Stone of stability and focus, helps establish regular life rhythm',
          personalEffect: language === 'zh' ? `你的生活节奏${weakestScore}分需要调整，黑曜石将帮助你建立更规律稳定的作息` : `Your life rhythm of ${weakestScore} needs adjustment, Obsidian will help establish more regular and stable routines`,
          usage: language === 'zh' ? '放在床头或工作区域，增强专注力和规律性' : 'Place at bedside or work area to enhance focus and regularity',
          targetImprovement: language === 'zh' ? `预期改善生活节奏15-20分` : `Expected to improve life rhythm by 15-20 points`
        });
        break;
    }
    
    // 如果整体能量很好，推荐进阶水晶
    const averageScore = (physicalScore + socialScore + financialScore + emotionalScore + rhythmScore) / 5;
    if (averageScore > 75 && recommendations.length === 0) {
      recommendations.push({
        name: language === 'zh' ? '超七水晶' : 'Super Seven',
        icon: '🌟',
        color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
        energyType: language === 'zh' ? '全面提升' : 'Overall Enhancement',
        description: language === 'zh' ? '集合七种矿物的强化水晶，全面提升各维度能量' : 'Enhanced crystal combining seven minerals, comprehensively improves all dimensional energies',
        personalEffect: language === 'zh' ? `你的整体能量${Math.round(averageScore)}分已经很优秀，超七水晶将帮你达到更高层次的能量状态` : `Your overall energy of ${Math.round(averageScore)} is already excellent, Super Seven will help you reach higher energy levels`,
        usage: language === 'zh' ? '冥想时握在双手，或佩戴进行能量调频' : 'Hold in both hands during meditation or wear for energy attunement',
        targetImprovement: language === 'zh' ? `预期全面提升能量5-10分` : `Expected to improve overall energy by 5-10 points`
      });
    }
    
    // 基于MBTI特质推荐辅助水晶
    if (recommendations.length < 2) {
      if (mbtiType.includes('N') && mbtiType.includes('P')) {
        recommendations.push({
          name: language === 'zh' ? '萤石' : 'Fluorite',
          icon: '🔮',
          color: 'bg-primary',
          energyType: language === 'zh' ? '创意灵感' : 'Creative Inspiration',
          description: language === 'zh' ? '智慧与专注之石，激发创造力和直觉洞察' : 'Stone of wisdom and focus, stimulates creativity and intuitive insight',
          personalEffect: language === 'zh' ? '基于你的直觉感知特质，萤石将帮助你将创意转化为实际成果' : 'Based on your intuitive perceiving traits, Fluorite will help transform creativity into tangible results',
          usage: language === 'zh' ? '创作工作时放在桌上，激发灵感和专注力' : 'Place on desk during creative work to inspire creativity and focus',
          targetImprovement: language === 'zh' ? `增强创意表达和执行力` : `Enhance creative expression and execution`
        });
      } else if (mbtiType.includes('S') && mbtiType.includes('J')) {
        recommendations.push({
          name: language === 'zh' ? '虎眼石' : 'Tiger Eye',
          icon: '👁️',
          color: 'bg-amber-600',
          energyType: language === 'zh' ? '实务执行' : 'Practical Execution',
          description: language === 'zh' ? '决断与行动之石，增强执行力和决策能力' : 'Stone of determination and action, enhances execution and decision-making abilities',
          personalEffect: language === 'zh' ? '基于你的实感判断特质，虎眼石将强化你的执行效率和目标达成' : 'Based on your sensing judging traits, Tiger Eye will strengthen your execution efficiency and goal achievement',
          usage: language === 'zh' ? '制定计划时握在手中，执行任务时佩戴' : 'Hold while making plans, wear during task execution',
          targetImprovement: language === 'zh' ? `提升执行效率和目标实现率` : `Improve execution efficiency and goal achievement rate`
        });
      }
    }
    
    // 检查所有分数是否都一样
    const allSame = scores.every(s => s === scores[0]);
    if (allSame) {
      return [{
        name: language === 'zh' ? '请完善八维能量问卷，解锁个性化水晶推荐' : 'Please complete the 8D energy questionnaire to unlock personalized crystal recommendations',
        icon: '📄',
        color: 'bg-gray-300',
        energyType: '',
        description: '',
        personalEffect: '',
        usage: '',
        targetImprovement: ''
      }];
    }
    
    return recommendations.slice(0, 3); // 最多返回3个推荐
  };

  // 计算总体能量指数
  const overallEnergy = Math.round(fiveDimensionalData.reduce((sum, d) => sum + (d.energy || 0), 0) / fiveDimensionalData.length);
  
  // 确保有有效数据
  if (fiveDimensionalData.length === 0) {
    return (
      <Card className={`w-full max-w-4xl mx-auto quantum-card ${className}`}>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-gray-500">
              {language === 'zh' ? '数据加载中...' : 'Loading data...'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profileData) return null;

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasEnhancedData
            ? t('energyExplorationPage.fiveDimensional.titleEnhanced')
            : t('energyExplorationPage.fiveDimensional.title')
          }
          {hasEnhancedData && (
            <Badge className="bg-primary text-white text-xs ml-2">
              {t('energyExplorationPage.fiveDimensional.enhanced')}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {hasEnhancedData
            ? t('energyExplorationPage.fiveDimensional.descriptionEnhanced')
            : t('energyExplorationPage.fiveDimensional.description')
          }
        </p>
      </CardHeader>
      <CardContent>
        {/* 【方案一 & 方案二】控制面板 */}
        <div className="mb-6 p-4 hierarchy-secondary rounded-lg border border-border">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {/* 左侧：显示模式控制 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-slate-700">
                  {t('energyExplorationPage.fiveDimensional.displaySettings')}
                </span>
              </div>
              
              {/* 紧凑模式切换 */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCompactMode(!compactMode)}
                  className="h-8 px-3"
                >
                  {compactMode ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <span className="ml-1 text-xs">
                    {compactMode ? t('energyExplorationPage.fiveDimensional.detailedMode') : t('energyExplorationPage.fiveDimensional.compactMode')}
                  </span>
                </Button>
              </div>
            </div>

            {/* 右侧：高级内容控制 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">
                {language === 'zh' ? '高级内容' : 'Advanced Content'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAllAdvanced}
                className="h-8 px-3 text-xs"
              >
                {Object.values(showAdvancedSections).every(v => !v) ? (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    {language === 'zh' ? '展开全部' : 'Show All'}
                  </>
                ) : (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    {language === 'zh' ? '收起全部' : 'Hide All'}
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* 信息层级指示器 */}
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{language === 'zh' ? '核心分析' : 'Core Analysis'}</span>
            </div>
            <div className="flex items-center gap-1 ml-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{language === 'zh' ? '深度洞察' : 'Deep Insights'}</span>
            </div>
            <div className="flex items-center gap-1 ml-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{language === 'zh' ? '专属建议' : 'Personalized Tips'}</span>
            </div>
          </div>
        </div>

        {/* 【方案二】优化的五维雷达图 - 紧凑模式适配 */}
        <div className={`w-full mb-6 ${compactMode ? 'h-64' : 'h-96'} transition-all duration-300`}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={fiveDimensionalData} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                className="text-xs"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
              />
              <Radar
                name="能量等级"
                dataKey="energy"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.3}
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 【方案二】优化的维度详细信息 - 紧凑模式适配 */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ${compactMode ? 'lg:grid-cols-3' : ''}`}>
          {fiveDimensionalData.map((dimension, index) => {
            const level = getEnergyLevel(dimension.energy);
            const dimensionLabel = getDimensionLabel(dimension.dimension, dimension);
            return (
              <div key={index} className={`flex items-center gap-3 rounded-lg hierarchy-secondary hover:bg-accent/10 transition-all ${compactMode ? 'p-3' : 'p-4'}`}>
                <div className="text-2xl">{dimension.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-foreground">{dimension.dimension.replace(/^[🧠⭐🔥🌟🔢👥💎]\s*/, '')}</p>
                    <Badge className={`${level.color} text-white`}>
                      {dimensionLabel}
                    </Badge>
                  </div>
                                      {!compactMode && <p className="text-xs text-gray-600">{dimension.description}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {/* 简单总结 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 quantum-card">
            <div className="text-center">
              <h4 className="font-bold text-2xl text-primary mb-1">
                {overallEnergy}/100
              </h4>
              <p className="font-semibold text-foreground text-sm mb-2">
                {language === 'zh' ? '😊 整体状态' : '😊 Overall Status'}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {language === 'zh' ? '各方面的综合得分' : 'Combined score across all areas'}
              </p>
              <Badge className={`${getEnergyLevel(overallEnergy).color} text-white text-xs`}>
                {getEnergyLevel(overallEnergy).label}
              </Badge>
            </div>
          </div>
          
          <div className="p-4 quantum-card">
            <div className="text-center">
              <h4 className="font-bold text-2xl text-primary mb-1">
                {synergyAnalysis.balanceScore}/100
              </h4>
              <p className="font-semibold text-foreground text-sm mb-2">
                {language === 'zh' ? '⚖️ 平衡程度' : '⚖️ Balance Level'}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {language === 'zh' ? '各方面发展是否均匀' : 'How evenly developed all areas are'}
              </p>
              <Badge className={`${getEnergyLevel(synergyAnalysis.balanceScore).color} text-white text-xs`}>
                {language === 'zh' ? '协调度' : 'Harmony'}
              </Badge>
            </div>
          </div>
          
          <div className="p-4 quantum-card">
            <div className="text-center">
              <h4 className="font-bold text-2xl text-primary mb-1">
                {synergyAnalysis.synergyIndex}/100
              </h4>
              <p className="font-semibold text-gray-800 text-sm mb-2">
                {language === 'zh' ? '🤝 配合度' : '🤝 Synergy Level'}
              </p>
              <p className="text-xs text-muted-foreground mb-2">
                {language === 'zh' ? '不同特质间的互补程度' : 'How well different traits complement each other'}
              </p>
              <Badge className="bg-primary text-white text-xs">
                {synergyAnalysis.developmentPhase}
              </Badge>
            </div>
          </div>
        </div>

        {/* 给你的专属建议 */}
        <div className="p-6 quantum-card mb-6">
          <div className="text-center mb-6">
            <h4 className="font-bold text-xl heading-enhanced mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {language === 'zh' ? '💡 给你的专属建议' : '💡 Suggestions Just For You'}
            </h4>
            <Badge className="bg-indigo-500 text-white mb-3">
              {synergyAnalysis.dominantPattern}
            </Badge>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              {language === 'zh' 
                ? '根据你的特点，我们为你准备了一些简单实用的小方法，每天花几分钟就能有改善'
                : 'Based on your traits, we\'ve prepared some simple and practical methods that only take a few minutes daily to see improvement'}
            </p>
          </div>

          {/* 今天就能做的小事 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
              <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Target className="h-5 w-5" />
                {language === 'zh' ? '🎯 今天就能做的小事' : '🎯 Small Things You Can Do Today'}
              </h5>
              <p className="text-xs text-muted-foreground mb-3">
                {language === 'zh' ? '简单易行，马上就能开始！' : 'Simple and easy, you can start right now!'}
              </p>
              <div className="space-y-3">
                {generateImmediateActions().map((action, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 hierarchy-tertiary rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm mb-1">{action.title}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-1">{action.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-medium">{action.timeCommitment}</p>
                      </div>
                      {action.tip && (
                        <p className="text-xs text-muted-foreground mt-2 hierarchy-quaternary p-2 rounded italic">{action.tip}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 【渐进式展示】本周目标 */}
            <Collapsible 
              open={showAdvancedSections.weeklyGoals} 
              onOpenChange={(open) => setShowAdvancedSections(prev => ({...prev, weeklyGoals: open}))}
            >
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full mb-4 p-3 h-auto">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <div className="font-semibold text-foreground">
                          {language === 'zh' ? '📅 本周习惯养成' : '📅 Weekly Habits'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {language === 'zh' ? '坚持一周，发现明显变化' : 'Stick for a week, notice clear changes'}
                        </div>
                      </div>
                      <Badge className="bg-primary text-white text-xs">
                        {language === 'zh' ? '专属建议' : 'Personalized'}
                      </Badge>
                    </div>
                    {showAdvancedSections.weeklyGoals ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
            <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
              <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                {language === 'zh' ? '📅 这周要培养的好习惯' : '📅 Good Habits to Develop This Week'}
              </h5>
              <p className="text-xs text-muted-foreground mb-3">
                {language === 'zh' ? '坚持一周，你会发现明显的变化！' : 'Stick to it for a week and you\'ll notice clear changes!'}
              </p>
              <div className="space-y-3">
                {generateWeeklyGoals().map((goal, i) => (
                  <div key={i} className="p-3 hierarchy-tertiary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground text-sm">{goal.area}</p>
                      <Badge className="bg-primary text-white text-xs">{goal.difficulty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">{goal.goal}</p>
                    {goal.method && (
                      <p className="text-xs text-muted-foreground mb-2 hierarchy-quaternary p-2 rounded">{goal.method}</p>
                    )}
                    {goal.benefit && (
                      <p className="text-xs text-foreground font-medium italic">{goal.benefit}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

                  {/* 简单了解你自己 */}
        <div className="p-4 quantum-card">
          <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            {language === 'zh' ? '🎭 简单了解你自己' : '🎭 Simply Understanding Yourself'}
          </h5>
          <p className="text-sm text-muted-foreground mb-4">
            {language === 'zh' ? '用三句话概括你的性格特点，让你更了解自己' : 'Summarize your personality traits in three sentences to help you understand yourself better'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 hierarchy-tertiary rounded-lg">
              <div className="text-lg font-bold text-primary mb-1">{getPersonalityInsight().drive}</div>
              <p className="text-xs text-muted-foreground mb-2">{language === 'zh' ? '💪 内心动力' : '💪 Inner Motivation'}</p>
              <p className="text-xs text-foreground leading-relaxed">{getPersonalityInsight().description}</p>
            </div>
            <div className="text-center p-3 hierarchy-tertiary rounded-lg">
              <div className="text-lg font-bold text-primary mb-1">{getEnergyStyle().style}</div>
              <p className="text-xs text-muted-foreground mb-2">{language === 'zh' ? '🎨 做事风格' : '🎨 Working Style'}</p>
              <p className="text-xs text-foreground leading-relaxed">{getEnergyStyle().description}</p>
            </div>
            <div className="text-center p-3 hierarchy-tertiary rounded-lg">
              <div className="text-lg font-bold text-primary mb-1">{getGrowthPhase().phase}</div>
              <p className="text-xs text-muted-foreground mb-2">{language === 'zh' ? '📈 当前状态' : '📈 Current Status'}</p>
              <p className="text-xs text-foreground leading-relaxed">{getGrowthPhase().description}</p>
            </div>
          </div>
        </div>

        {/* 8维专属内容 */}
        {hasEnhancedData && (
          <>
            {/* 【渐进式展示】8维能量密码 */}
            <Collapsible 
              open={showAdvancedSections.energyCode} 
              onOpenChange={(open) => setShowAdvancedSections(prev => ({...prev, energyCode: open}))}
            >
              <div className="mb-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between p-4 h-auto">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-amber-600" />
                      <div className="text-left">
                        <div className="font-semibold text-amber-800">
                          {language === 'zh' ? '🔮 专属能量密码' : '🔮 Your Energy Code'}
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          {language === 'zh' ? '基于八维数据生成的个人能量原型' : 'Personal energy archetype based on 8D data'}
                        </div>
                      </div>
                      <Badge className="bg-amber-500 text-white text-xs">
                        {language === 'zh' ? '深度洞察' : 'Deep Insight'}
                      </Badge>
                    </div>
                    {showAdvancedSections.energyCode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
            <div className="p-6 quantum-card mb-6">
              <div className="text-center mb-6">
                <h4 className="font-bold text-xl heading-enhanced mb-2 flex items-center justify-center gap-2">
                  <Key className="h-5 w-5" />
                  {language === 'zh' ? '🔮 你的专属能量密码' : '🔮 Your Exclusive Energy Code'}
                </h4>
                <Badge className="bg-primary text-white mb-3">
                  {language === 'zh' ? '8维专享' : '8D Exclusive'}
                </Badge>
                <p className="text-sm text-amber-700 leading-relaxed mb-4">
                  {language === 'zh' 
                    ? '基于你的八维能量数据，为你生成独一无二的个人能量密码'
                    : 'Based on your eight-dimensional energy data, we generate a unique personal energy code just for you'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                  <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    {language === 'zh' ? '🌟 你的能量原型' : '🌟 Your Energy Archetype'}
                  </h5>
                  <div className="text-center p-4 hierarchy-tertiary rounded-lg mb-3">
                    <div className="text-2xl font-bold text-amber-600 mb-2">{generateEnergyArchetype()}</div>
                    <p className="text-sm text-amber-700">{generateArchetypeDescription()}</p>
                  </div>
                  <p className="text-xs text-amber-600 leading-relaxed">{generateArchetypeStrengths()}</p>
                </div>

                <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                  <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    {language === 'zh' ? '🔢 你的能量数字' : '🔢 Your Energy Numbers'}
                  </h5>
                  <div className="space-y-3">
                    {generateEnergyNumbers().map((number, i) => (
                      <div key={i} className="flex items-center justify-between p-3 hierarchy-tertiary rounded-lg">
                        <div>
                          <p className="font-medium text-foreground text-sm">{number.name}</p>
                          <p className="text-xs text-muted-foreground">{number.meaning}</p>
                        </div>
                        <div className="text-xl font-bold text-primary">{number.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 【渐进式展示】8维人际关系分析 */}
            <Collapsible 
              open={showAdvancedSections.relationships} 
              onOpenChange={(open) => setShowAdvancedSections(prev => ({...prev, relationships: open}))}
            >
              <div className="mb-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between p-4 h-auto">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-pink-600" />
                      <div className="text-left">
                        <div className="font-semibold text-pink-800">
                          {language === 'zh' ? '💝 人际关系图谱' : '💝 Relationship Map'}
                        </div>
                        <div className="text-xs text-pink-600 mt-1">
                          {language === 'zh' ? '基于社交能量和情商的人际模式分析' : 'Interpersonal pattern analysis based on social energy and EQ'}
                        </div>
                      </div>
                      <Badge className="bg-pink-500 text-white text-xs">
                        {language === 'zh' ? '深度洞察' : 'Deep Insight'}
                      </Badge>
                    </div>
                    {showAdvancedSections.relationships ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
            <div className="p-6 quantum-card mb-6">
              <div className="text-center mb-6">
                <h4 className="font-bold text-xl heading-enhanced mb-2 flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  {language === 'zh' ? '💝 人际关系能量图谱' : '💝 Interpersonal Energy Map'}
                </h4>
                <Badge className="bg-primary text-white mb-3">
                  {language === 'zh' ? '基于社交能量分析' : 'Based on Social Energy Analysis'}
                </Badge>
                <p className="text-sm text-pink-700 leading-relaxed mb-4">
                  {language === 'zh' 
                    ? '通过你的社交能量和情绪智能数据，分析你的人际关系模式'
                    : 'Analyze your interpersonal patterns through social energy and emotional intelligence data'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                  <h5 className="font-bold text-foreground mb-3 text-center">
                    {language === 'zh' ? '🤝 社交风格' : '🤝 Social Style'}
                  </h5>
                  <div className="text-center p-3 hierarchy-tertiary rounded-lg">
                    <div className="text-lg font-bold text-pink-600 mb-2">{getSocialStyle()}</div>
                    <p className="text-xs text-pink-700 leading-relaxed">{getSocialStyleDescription()}</p>
                  </div>
                </div>

                <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                  <h5 className="font-bold text-foreground mb-3 text-center">
                    {language === 'zh' ? '💗 情感模式' : '💗 Emotional Pattern'}
                  </h5>
                  <div className="text-center p-3 hierarchy-tertiary rounded-lg">
                    <div className="text-lg font-bold text-rose-600 mb-2">{getEmotionalPattern()}</div>
                    <p className="text-xs text-rose-700 leading-relaxed">{getEmotionalPatternDescription()}</p>
                  </div>
                </div>

                <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                  <h5 className="font-bold text-foreground mb-3 text-center">
                    {language === 'zh' ? '🎯 关系建议' : '🎯 Relationship Advice'}
                  </h5>
                  <div className="space-y-2">
                    {getRelationshipAdvice().map((advice, i) => (
                      typeof advice === 'string' ? (
                        <div key={i} className="p-2 hierarchy-tertiary rounded text-xs text-foreground">{advice}</div>
                      ) : (
                        <div key={i} className="p-2 hierarchy-tertiary rounded text-xs text-foreground">
                          <div className="font-semibold text-primary mb-1">{advice.area}</div>
                          <div className="mb-1">建议：{advice.suggestion}</div>
                          <div className="text-muted-foreground">行动建议：{advice.actionStep}</div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 【渐进式展示】8维财务能量指导 */}
            <Collapsible 
              open={showAdvancedSections.financial} 
              onOpenChange={(open) => setShowAdvancedSections(prev => ({...prev, financial: open}))}
            >
              <div className="mb-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between p-4 h-auto">
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <div className="text-left">
                        <div className="font-semibold text-emerald-800">
                          {language === 'zh' ? '💰 财务能量密码' : '💰 Financial Energy Code'}
                        </div>
                        <div className="text-xs text-emerald-600 mt-1">
                          {language === 'zh' ? '个性化理财建议和丰盛心态指导' : 'Personalized financial advice and abundance mindset guidance'}
                        </div>
                      </div>
                      <Badge className="bg-emerald-500 text-white text-xs">
                        {language === 'zh' ? '深度洞察' : 'Deep Insight'}
                      </Badge>
                    </div>
                    {showAdvancedSections.financial ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
            <div className="p-6 quantum-card mb-6">
              <div className="text-center mb-6">
                <h4 className="font-bold text-xl heading-enhanced mb-2 flex items-center justify-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {language === 'zh' ? '💰 财务能量密码' : '💰 Financial Energy Code'}
                </h4>
                <Badge className="bg-primary text-white mb-3">
                  {language === 'zh' ? '基于财务能量分析' : 'Based on Financial Energy Analysis'}
                </Badge>
                <p className="text-sm text-emerald-700 leading-relaxed mb-4">
                  {language === 'zh' 
                    ? '根据你的财务能量评估，为你提供个性化的理财和丰盛心态建议'
                    : 'Based on your financial energy assessment, providing personalized financial and abundance mindset advice'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                  <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {language === 'zh' ? '📊 你的财务人格' : '📊 Your Financial Personality'}
                  </h5>
                  <div className="text-center p-3 hierarchy-tertiary rounded-lg mb-3">
                    <div className="text-lg font-bold text-emerald-600 mb-2">{getFinancialPersonality()}</div>
                    <p className="text-xs text-emerald-700 leading-relaxed">{getFinancialPersonalityDescription()}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-600 font-medium">💡 核心特征：</p>
                    {getFinancialTraits().map((trait, i) => (
                      <div key={i} className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                        • {trait}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                  <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    {language === 'zh' ? '🎯 个性化理财建议' : '🎯 Personalized Financial Advice'}
                  </h5>
                  {/* 财务能量概览 */}
                  <div className="mb-4 p-3 bg-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-800">
                        {language === 'zh' ? '财务能量等级' : 'Financial Energy Level'}
                      </span>
                      <Badge className={`${getEnergyLevel(calculateFinancialEnergy(financialEnergyAssessment)).color} text-white text-xs`}>
                        {calculateFinancialEnergy(financialEnergyAssessment)}/100
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {getPersonalizedFinancialAdvice().map((advice, i) => (
                      <div key={i} className="p-3 hierarchy-tertiary rounded-lg border border-border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-white text-xs">{advice.category}</Badge>
                            <Badge variant="outline" className="text-xs">{advice.priority}</Badge>
                        </div>
                          {advice.timeline && (
                            <Badge variant="outline" className="text-xs">
                              {advice.timeline}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-foreground font-medium leading-relaxed mb-2">{advice.suggestion}</p>
                        <p className="text-xs text-muted-foreground mb-2">🌟 {advice.benefit}</p>
                        {typeof advice === 'object' && advice !== null && 'targetImprovement' in advice &&
                          typeof (advice as any).targetImprovement === 'string' && (advice as any).targetImprovement && (
                            <p className="text-xs text-muted-foreground italic">📈 {(advice as any).targetImprovement}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
              </CollapsibleContent>
            </Collapsible>

            {/* 【渐进式展示】8维专属水晶推荐 */}
            <Collapsible 
              open={showAdvancedSections.crystalRecommendations} 
              onOpenChange={(open) => setShowAdvancedSections(prev => ({...prev, crystalRecommendations: open}))}
            >
              <div className="mb-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full flex items-center justify-between p-4 h-auto">
                    <div className="flex items-center gap-3">
                      <Gem className="h-5 w-5 text-violet-600" />
                      <div className="text-left">
                        <div className="font-semibold text-violet-800">
                          {language === 'zh' ? '💎 专属水晶矩阵' : '💎 Crystal Matrix'}
                        </div>
                        <div className="text-xs text-violet-600 mt-1">
                          {language === 'zh' ? '基于八维能量精准匹配的水晶组合' : 'Crystal combinations precisely matched to your 8D energy'}
                        </div>
                      </div>
                      <Badge className="bg-violet-500 text-white text-xs">
                        {language === 'zh' ? '深度洞察' : 'Deep Insight'}
                      </Badge>
                    </div>
                    {showAdvancedSections.crystalRecommendations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
            <div className="p-6 quantum-card mb-6">
              <div className="text-center mb-6">
                <h4 className="font-bold text-xl heading-enhanced mb-2 flex items-center justify-center gap-2">
                  <Gem className="h-5 w-5" />
                  {language === 'zh' ? '💎 八维专属水晶矩阵' : '💎 Eight-Dimensional Crystal Matrix'}
                </h4>
                <Badge className="bg-primary text-white mb-3">
                  {language === 'zh' ? '精准匹配' : 'Precise Matching'}
                </Badge>
                <p className="text-sm text-violet-700 leading-relaxed mb-4">
                  {language === 'zh' 
                    ? '基于你的八维能量数据，为你精心挑选最适合的水晶组合'
                    : 'Based on your eight-dimensional energy data, carefully selected crystal combinations that suit you best'}
                </p>
              </div>

              {/* 能量分析概览 */}
              <div className="mb-6 p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                <h5 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {language === 'zh' ? '🔍 能量分析基础' : '🔍 Energy Analysis Foundation'}
                </h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  <div className="p-2 bg-violet-50 rounded">
                    <div className="text-xs text-violet-600">{language === 'zh' ? '身体' : 'Physical'}</div>
                    <div className="font-bold text-violet-800">{calculatePhysicalEnergy(physicalAssessment)}</div>
                  </div>
                  <div className="p-2 bg-violet-50 rounded">
                    <div className="text-xs text-violet-600">{language === 'zh' ? '社交' : 'Social'}</div>
                    <div className="font-bold text-violet-800">{calculateSocialEnergy(socialAssessment)}</div>
                  </div>
                  <div className="p-2 bg-violet-50 rounded">
                    <div className="text-xs text-violet-600">{language === 'zh' ? '财务' : 'Financial'}</div>
                    <div className="font-bold text-violet-800">{calculateFinancialEnergy(financialEnergyAssessment)}</div>
                  </div>
                  <div className="p-2 bg-violet-50 rounded">
                    <div className="text-xs text-violet-600">{language === 'zh' ? '情感' : 'Emotional'}</div>
                    <div className="font-bold text-violet-800">{calculateEmotionalIntelligence(emotionalIntelligenceAssessment)}</div>
                  </div>
                  <div className="p-2 bg-violet-50 rounded">
                    <div className="text-xs text-violet-600">{language === 'zh' ? '节奏' : 'Rhythm'}</div>
                    <div className="font-bold text-violet-800">{calculateLifeRhythmEnergy(lifeRhythm)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getEnhancedCrystalRecommendations().map((crystal, i) => (
                  <div key={i} className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center mb-3">
                      <div className="text-2xl mb-2">{crystal.icon}</div>
                      <h5 className="font-bold text-foreground text-sm">{crystal.name}</h5>
                      <Badge className={`${crystal.color} text-white text-xs mt-1`}>
                        {crystal.energyType}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs text-violet-700 leading-relaxed">{crystal.description}</p>
                      
                      <div className="hierarchy-tertiary p-3 rounded-lg border border-border">
                        <p className="text-xs text-foreground font-medium mb-1">✨ 个性化分析：</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{crystal.personalEffect}</p>
                      </div>

                      <div className="hierarchy-tertiary p-2 rounded">
                        <p className="text-xs text-foreground font-medium mb-1">🔮 使用方法：</p>
                        <p className="text-xs text-muted-foreground">{crystal.usage}</p>
                      </div>

                      {crystal.targetImprovement && (
                        <div className="hierarchy-tertiary p-2 rounded border border-border">
                          <p className="text-xs text-foreground font-medium mb-1">📈 预期效果：</p>
                          <p className="text-xs text-muted-foreground">{crystal.targetImprovement}</p>
                        </div>
                      )}
                    </div>
                    {/* 推荐理由展示 */}
                    {crystal.personalEffect && (
                      <div className="text-xs text-violet-500 mt-2">推荐理由：{crystal.personalEffect}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
              </CollapsibleContent>
            </Collapsible>
          </>
        )}
        </div>

        {/* 【渐进式展示】深度分析 */}
        <Collapsible 
          open={showAdvancedSections.insights} 
          onOpenChange={(open) => setShowAdvancedSections(prev => ({...prev, insights: open}))}
        >
          <div className="mb-4">
          <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full flex items-center justify-between p-4 h-auto">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold text-foreground">
                      {language === 'zh' ? '🔍 科学分析原理' : '🔍 Scientific Analysis'}
                      </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {language === 'zh' ? '了解能量分析的理论基础和科学依据' : 'Understand the theoretical basis and scientific foundation'}
                </div>
                    </div>
                  <Badge className="bg-primary text-white text-xs">
                    {language === 'zh' ? '专业知识' : 'Professional'}
                  </Badge>
                  </div>
                {showAdvancedSections.insights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
              </div>
          <CollapsibleContent>
            {/* 直接显示科学分析内容 */}
            <div className="p-6 quantum-card">
              <div className="text-center mb-6">
                <h4 className="font-bold text-xl heading-enhanced mb-2 flex items-center justify-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {language === 'zh' ? '📊 能量分布的科学分析' : '📊 Scientific Analysis of Energy Distribution'}
                </h4>
                <Badge className="bg-primary text-white mb-3">
                  {language === 'zh' ? '数学模型' : 'Mathematical Model'}
                </Badge>
                </div>

              <div className="p-4 hierarchy-secondary rounded-lg border border-border shadow-sm">
                <h6 className="font-semibold text-foreground text-sm mb-3">
                    {getDetailedAnalysisExplanation().energyDistributionAnalysis.title}
                  </h6>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {getDetailedAnalysisExplanation().energyDistributionAnalysis.content}
                  </div>
                </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

      </CardContent>
    </Card>
  );
};

export default FiveDimensionalEnergyChart; 