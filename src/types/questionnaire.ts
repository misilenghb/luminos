import type { MbtiQuestionnaireAnswers as MbtiRawAnswers, MbtiDimensionAnswers } from "@/lib/mbti-utils"; // Renamed for clarity
import type * as z from 'zod';


export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

// 基本信息类型
export interface BasicInfo {
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
}

// 生活方式偏好类型
export interface LifestylePreferences {
  healingGoals: string[];
  colorPreferences: string[];
  activityPreferences: string[];
}

// 当前状态类型
export interface CurrentStatus {
  energyLevel: number;
  stressLevel: number;
  sleepQuality: number;
  emotionalState: string;
  physicalConditions: string[];
}

// 脉轮问卷答案类型
export interface ChakraQuestionnaireAnswers {
  root: [number, number, number, number];
  sacral: [number, number, number, number];
  solarPlexus: [number, number, number, number];
  heart: [number, number, number, number];
  throat: [number, number, number, number];
  thirdEye: [number, number, number, number];
  crown: [number, number, number, number];
  [key: string]: [number, number, number, number];
}

// MBTI问卷答案类型
export interface MbtiQuestionnaireAnswers {
  eiAnswers: MbtiDimensionAnswers;
  snAnswers: MbtiDimensionAnswers;
  tfAnswers: MbtiDimensionAnswers;
  jpAnswers: MbtiDimensionAnswers;
}

// 脉轮评估分数类型
export interface ChakraAssessmentScores {
  rootChakraFocus: number;
  sacralChakraFocus: number;
  solarPlexusChakraFocus: number;
  heartChakraFocus: number;
  throatChakraFocus: number;
  thirdEyeChakraFocus: number;
  crownChakraFocus: number;
}

// 完整问卷表单值类型
export interface QuestionnaireFormValues {
  basicInfo: BasicInfo;
  lifestylePreferences: LifestylePreferences;
  currentStatus: CurrentStatus;
  chakraAnswers?: ChakraQuestionnaireAnswers;
  mbtiAnswers?: MbtiQuestionnaireAnswers;
}

// 问卷分析结果类型
export interface QuestionnaireAnalysisResult {
  inferredZodiac: string;
  inferredChineseZodiac: string;
  inferredElement: string;
  mbtiLikeType: string;
  coreEnergyInsights: string[];
  chakraScores?: ChakraAssessmentScores;
}

// MBTI 类似类型答案（兼容 AI 推理结果和表单）
export interface MBTILikeAssessmentAnswers {
  ei?: number[];
  sn?: number[];
  tf?: number[];
  jp?: number[];
  type?: string;
  [key: string]: any;
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

    