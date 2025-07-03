import type { MbtiQuestionnaireAnswers as MbtiRawAnswers } from "@/lib/mbti-utils"; // Renamed for clarity
import type * as z from 'zod';


export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface BasicInfo {
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
}

export type MBTILikeAssessmentAnswers = MbtiRawAnswers;

// Raw answers from the 28-question Chakra questionnaire
export interface ChakraQuestionnaireAnswers {
  root: [number, number, number, number] | [undefined,undefined,undefined,undefined]; 
  sacral: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  solarPlexus: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  heart: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  throat: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  thirdEye: [number, number, number, number] | [undefined,undefined,undefined,undefined];
  crown: [number, number, number, number] | [undefined,undefined,undefined,undefined];
}


// Calculated average scores for each chakra (this is what's sent to AI)
export interface ChakraAssessmentScores {
  rootChakraFocus: number; // Average score 1-5
  sacralChakraFocus: number;
  solarPlexusChakraFocus: number;
  heartChakraFocus: number;
  throatChakraFocus: number;
  thirdEyeChakraFocus: number;
  crownChakraFocus: number;
}


export interface LifestylePreferences {
  colorPreferences: string[];
  activityPreferences: string[];
  healingGoals: string[];
}

export interface CurrentStatus {
  stressLevel: number; // 1 (Very Low) to 5 (Very High)
  energyLevel: number; // 1 (Very Low) to 5 (Very High)
  emotionalState: string;
}

// 新增：身体体质评估
export interface PhysicalAssessment {
  height?: number; // 身高(cm)
  weight?: number; // 体重(kg)
  exerciseFrequency: number; // 1-5: 从不运动到每天运动
  sleepQuality: number; // 1-5: 睡眠质量评分
  energyPeakTime: 'morning' | 'afternoon' | 'evening' | 'night'; // 精力最佳时段
  stressResponse: number; // 1-5: 压力应对能力
  healthConcerns: string[]; // 健康关注点
}

// 新增：生活节律评估
export interface LifeRhythm {
  wakeUpTime: string; // HH:MM
  bedTime: string; // HH:MM
  workSchedule: 'fixed' | 'flexible' | 'irregular'; // 工作时间规律性
  socialFrequency: number; // 1-5: 社交活动频率
  seasonalMood: number; // 1-5: 季节对情绪的影响程度
  digitalUsage: number; // 1-5: 数字设备使用时间
  natureConnection: number; // 1-5: 与自然的连接频率
}

// 新增：社交关系评估
export interface SocialAssessment {
  relationshipStatus: 'single' | 'dating' | 'married' | 'complicated' | 'prefer_not_say';
  socialCircleSize: number; // 1-5: 社交圈大小
  conflictHandling: number; // 1-5: 冲突处理能力
  empathyLevel: number; // 1-5: 共情能力
  communicationPreference: 'direct' | 'diplomatic' | 'passive' | 'assertive';
  energyDrain: string[]; // 消耗能量的人际关系类型
  energyBoost: string[]; // 增强能量的人际关系类型
}

// 新增：财务能量评估
export interface FinancialEnergyAssessment {
  moneyRelationship: 'love' | 'neutral' | 'stress' | 'fear' | 'control';
  abundanceMindset: number; // 1-5: 丰盛心态评分
  financialStress: number; // 1-5: 财务压力水平
  generosity: number; // 1-5: 慷慨程度
  materialAttachment: number; // 1-5: 对物质的依恋程度
  financialGoals: string[]; // 财务目标
}

// 新增：情绪智能评估
export interface EmotionalIntelligenceAssessment {
  selfAwareness: number; // 1-5: 自我觉察能力
  emotionRegulation: number; // 1-5: 情绪调节能力
  socialAwareness: number; // 1-5: 社会觉察能力
  relationshipManagement: number; // 1-5: 关系管理能力
  stressCoping: string[]; // 压力应对方式
  emotionalTriggers: string[]; // 情绪触发点
  moodPatterns: string[]; // 情绪模式
}

// For react-hook-form values
export interface QuestionnaireFormValues {
  basicInfo: BasicInfo;
  mbtiAnswers: MBTILikeAssessmentAnswers; // Will store arrays of 'A'|'B'|undefined
  chakraAnswers: ChakraQuestionnaireAnswers; // Stores the 28 raw scores (number|undefined)
  lifestylePreferences: LifestylePreferences;
  currentStatus: CurrentStatus;
  // 新增可选的深度评估模块
  physicalAssessment?: PhysicalAssessment;
  lifeRhythm?: LifeRhythm;
  socialAssessment?: SocialAssessment;
  financialEnergyAssessment?: FinancialEnergyAssessment;
  emotionalIntelligenceAssessment?: EmotionalIntelligenceAssessment;
}


// Input type for the AI flow
export interface FullQuestionnaireDataInput {
  basicInfo: BasicInfo;
  mbtiAnswers?: MBTILikeAssessmentAnswers; // Optional if skipped/incomplete
  calculatedMbtiType?: string; // Optional, from local calculation
  chakraAssessment?: ChakraAssessmentScores; // Optional, from local calculation
  lifestylePreferences: LifestylePreferences;
  currentStatus: CurrentStatus;
  language: 'en' | 'zh';
}


// Step configuration for the multi-step form
export interface StepConfig {
  id: string;
  titleKey: string;
  icon: React.ElementType;
  fields?: Array<keyof QuestionnaireFormValues | `basicInfo.${keyof BasicInfo}` | `mbtiAnswers.${keyof MBTILikeAssessmentAnswers}` | `chakraAnswers.${keyof ChakraQuestionnaireAnswers}` | `lifestylePreferences.${keyof LifestylePreferences}` | `currentStatus.${keyof CurrentStatus}` >;
  schema: z.ZodSchema<unknown>; // Each step will have its own schema for validation
  skippable?: boolean;
  skipToastKey?: string;
}

    