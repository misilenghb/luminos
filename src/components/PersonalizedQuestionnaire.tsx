"use client";

import type { SubmitHandler } from "react-hook-form";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeUserProfile } from "@/ai/flows/user-profile-flow";
import type { FullQuestionnaireDataInput, UserProfileDataOutput as UserProfileData } from "@/ai/schemas/user-profile-schemas";
import type { StepConfig, QuestionnaireFormValues, ChakraQuestionnaireAnswers, MBTILikeAssessmentAnswers as MbtiRawAnswers } from "@/types/questionnaire";
import { useToast } from "@/hooks/use-toast";
import { calculateMbtiType, areMbtiAnswersComplete, type MbtiDimensionAnswers } from "@/lib/mbti-utils";
import { calculateChakraScores, areChakraAnswersComplete } from "@/lib/chakra-utils";
import { CalendarIcon, User, Palette as PaletteIcon, TrendingUp, ChevronLeft, ChevronRight, Sparkles as ChakraIconUi, Target as GoalIcon, ListChecks, RotateCcw } from "lucide-react";
import InstantFeedback from './InstantFeedback';
import EnhancedQuestionnaire from './EnhancedQuestionnaire';
import { format, parse, isValid as isValidDate } from 'date-fns';
import { useAuth } from "@/contexts/AuthContext";

// Schemas for individual step validation
const basicInfoSchema = z.object({
  name: z.string().min(1, "energyExplorationPage.questionnaire.validation.nameRequired"),
  birthDate: z.string().refine(val => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
    const date = parse(val, 'yyyy-MM-dd', new Date());
    return isValidDate(date);
  }, {
    message: "energyExplorationPage.questionnaire.validation.birthDateInvalid",
  }),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
    errorMap: () => ({ message: "energyExplorationPage.questionnaire.validation.genderRequired" })
  }),
});

const chakraQuestionScoreSchema = z.number().min(1).max(5, "energyExplorationPage.questionnaire.chakraAssessment.validation.answerRequired");
const chakraDimensionAnswersSchema = z.tuple([
  chakraQuestionScoreSchema, chakraQuestionScoreSchema, chakraQuestionScoreSchema, chakraQuestionScoreSchema
]);
const chakraKeys: Array<keyof ChakraQuestionnaireAnswers> = ["root", "sacral", "solarPlexus", "heart", "throat", "thirdEye", "crown"];
const strictChakraAnswersSchema = z.object(
  Object.fromEntries(chakraKeys.map(key => [key, chakraDimensionAnswersSchema]))
);


const mbtiDimensionAnswerSchema = z.enum(['A', 'B'], { errorMap: () => ({ message: "energyExplorationPage.questionnaire.validation.mbtiAnswerRequired" }) });
const mbtiDimensionTupleSchema = z.tuple([
  mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema,
  mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema, mbtiDimensionAnswerSchema
]);
const strictMbtiAnswersSchema = z.object({
  eiAnswers: mbtiDimensionTupleSchema,
  snAnswers: mbtiDimensionTupleSchema,
  tfAnswers: mbtiDimensionTupleSchema,
  jpAnswers: mbtiDimensionTupleSchema,
});

const lifestylePreferencesSchema = z.object({
  colorPreferences: z.array(z.string()).min(1, "energyExplorationPage.questionnaire.validation.colorRequired"),
  activityPreferences: z.array(z.string()).min(1, "energyExplorationPage.questionnaire.validation.activityRequired"),
  healingGoals: z.array(z.string()).min(1, "energyExplorationPage.questionnaire.validation.goalRequired"),
});

const currentStatusSchema = z.object({
  stressLevel: z.number().min(1).max(5),
  energyLevel: z.number().min(1).max(5),
  emotionalState: z.string().min(1, "energyExplorationPage.questionnaire.validation.emotionalStateRequired").max(500, "energyExplorationPage.questionnaire.validation.emotionalStateMax"),
});


// Schemas for submittable (potentially partial) skippable sections
const submittableChakraQuestionScoreSchema = chakraQuestionScoreSchema.optional();
const submittableChakraDimensionAnswersSchema = z.tuple([submittableChakraQuestionScoreSchema, submittableChakraQuestionScoreSchema, submittableChakraQuestionScoreSchema, submittableChakraQuestionScoreSchema]);
const submittableChakraAnswersSchema = z.object(
  Object.fromEntries(chakraKeys.map(key => [key, submittableChakraDimensionAnswersSchema.optional()]))
).partial().optional();

const submittableMbtiDimensionAnswerSchema = mbtiDimensionAnswerSchema.optional();
const submittableMbtiDimensionTupleSchema = z.tuple([
  submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema,
  submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema, submittableMbtiDimensionAnswerSchema
]);
const submittableMbtiAnswersSchema = z.object({
  eiAnswers: submittableMbtiDimensionTupleSchema.optional(),
  snAnswers: submittableMbtiDimensionTupleSchema.optional(),
  tfAnswers: submittableMbtiDimensionTupleSchema.optional(),
  jpAnswers: submittableMbtiDimensionTupleSchema.optional(),
}).partial().optional();


// Schema for the entire form for final submission (more lenient for skippable sections)
const fullQuestionnaireFormSchema = z.object({
  basicInfo: basicInfoSchema,
  chakraAnswers: submittableChakraAnswersSchema,
  mbtiAnswers: submittableMbtiAnswersSchema,
  lifestylePreferences: lifestylePreferencesSchema,
  currentStatus: currentStatusSchema,
});


interface PersonalizedQuestionnaireProps {
  setProfileData: (data: UserProfileData | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  enhancedData?: any; // 增强评估数据，用于检查是否已完成
}

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    transition: { ease: "easeInOut", duration: 0.3 },
  }),
};


// 本地存储键名
const QUESTIONNAIRE_STORAGE_KEY = 'questionnaire_progress';
const CURRENT_STEP_STORAGE_KEY = 'questionnaire_current_step';

// 加载本地存储的问卷数据
const loadStoredFormData = (): Partial<QuestionnaireFormValues> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(QUESTIONNAIRE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// 保存问卷数据到本地存储
const saveFormDataToStorage = (data: QuestionnaireFormValues) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(QUESTIONNAIRE_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('无法保存问卷进度到本地存储:', error);
  }
};

// 保存当前步骤到本地存储
const saveCurrentStepToStorage = (step: number) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CURRENT_STEP_STORAGE_KEY, step.toString());
  } catch (error) {
    console.warn('无法保存当前步骤到本地存储:', error);
  }
};

// 加载本地存储的当前步骤
const loadStoredCurrentStep = (): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const stored = localStorage.getItem(CURRENT_STEP_STORAGE_KEY);
    const step = stored ? parseInt(stored, 10) : 0;
    return isNaN(step) || step < 0 || step >= 5 ? 0 : step;
  } catch {
    return 0;
  }
};

// 清除本地存储的问卷数据
const clearStoredFormData = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(QUESTIONNAIRE_STORAGE_KEY);
    localStorage.removeItem(CURRENT_STEP_STORAGE_KEY);
  } catch (error) {
    console.warn('无法清除本地存储的问卷数据:', error);
  }
};

const PersonalizedQuestionnaire: React.FC<PersonalizedQuestionnaireProps> = ({ setProfileData, setIsAnalyzing, enhancedData }) => {
  const { t, language, getTranslatedOptions } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 增强评估相关状态
  const [showEnhancedAssessmentDialog, setShowEnhancedAssessmentDialog] = useState(false);
  const [basicAssessmentResult, setBasicAssessmentResult] = useState<UserProfileData | null>(null);
  const [showEnhancedQuestionnaire, setShowEnhancedQuestionnaire] = useState(false);
  const [formDataSnapshot, setFormDataSnapshot] = useState<Partial<QuestionnaireFormValues>>({});

  const defaultChakraAnswers: Record<keyof ChakraQuestionnaireAnswers, [number|undefined, number|undefined, number|undefined, number|undefined]> = chakraKeys.reduce((acc, key) => {
    acc[key] = [undefined, undefined, undefined, undefined];
    return acc;
  }, {} as Record<keyof ChakraQuestionnaireAnswers, [number|undefined, number|undefined, number|undefined, number|undefined]>);

  const defaultMbtiAnswers: MbtiRawAnswers = {
    eiAnswers: Array(7).fill(undefined) as MbtiDimensionAnswers,
    snAnswers: Array(7).fill(undefined) as MbtiDimensionAnswers,
    tfAnswers: Array(7).fill(undefined) as MbtiDimensionAnswers,
    jpAnswers: Array(7).fill(undefined) as MbtiDimensionAnswers,
  };


  const stepsConfig: StepConfig[] = [
    { id: "basicInfo", titleKey: "energyExplorationPage.questionnaire.steps.basicInfo", icon: User, fields: ["basicInfo"], schema: basicInfoSchema },
    { id: "chakraAnswers", titleKey: "energyExplorationPage.questionnaire.steps.chakraAssessment", icon: ChakraIconUi, fields: ["chakraAnswers"], schema: strictChakraAnswersSchema, skippable: true, skipToastKey: "toasts.skippedChakraDesc" },
    { id: "mbtiAnswers", titleKey: "energyExplorationPage.questionnaire.steps.mbtiTitle", icon: ListChecks, fields: ["mbtiAnswers"], schema: strictMbtiAnswersSchema, skippable: true, skipToastKey: "toasts.skippedMbtiDesc" },
    { id: "lifestylePreferences", titleKey: "energyExplorationPage.questionnaire.steps.lifestylePreferences", icon: PaletteIcon, fields: ["lifestylePreferences"], schema: lifestylePreferencesSchema },
    { id: "currentStatus", titleKey: "energyExplorationPage.questionnaire.steps.currentStatus", icon: TrendingUp, fields: ["currentStatus"], schema: currentStatusSchema },
  ];

  // 默认表单数据
  const defaultFormValues = {
    basicInfo: {
      name: "",
      birthDate: "",
      gender: "prefer_not_to_say" as const,
    },
    chakraAnswers: defaultChakraAnswers,
    mbtiAnswers: defaultMbtiAnswers,
    lifestylePreferences: {
      colorPreferences: [],
      activityPreferences: [],
      healingGoals: [],
    },
    currentStatus: {
      stressLevel: 3,
      energyLevel: 3,
      emotionalState: "",
    },
  } as QuestionnaireFormValues;

  const { control, handleSubmit, trigger, formState: { errors, isValid: isFormValid }, getValues, setValue, reset, watch } = useForm<QuestionnaireFormValues>({
    resolver: zodResolver(fullQuestionnaireFormSchema), 
    mode: "onChange", // 恢复实时验证，现在有了有效的默认值
    defaultValues: defaultFormValues,
  });

  const watchedBirthDate = useWatch({ control, name: "basicInfo.birthDate" });
  const [calendarDisplayMonth, setCalendarDisplayMonth] = useState<Date | undefined>();



  // 初始化：从本地存储加载数据
  useEffect(() => {
    if (typeof window !== 'undefined' && !isInitialized) {
      const storedData = loadStoredFormData();
      const storedStep = loadStoredCurrentStep();
      
      if (storedData) {
        // 显示恢复进度的提示
        toast({
          title: "已恢复答题进度",
          description: "检测到您之前的答题进度，已为您自动恢复。",
          variant: "default",
        });
        
        // 重置表单数据
        reset({ ...defaultFormValues, ...storedData });
        setCurrentStep(storedStep);
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized, reset, toast, defaultFormValues]);

  // 监听表单变化，自动保存到本地存储
  const allFormData = useWatch({ control });
  useEffect(() => {
    if (isInitialized && allFormData) {
      saveFormDataToStorage(allFormData as QuestionnaireFormValues);
    }
  }, [allFormData, isInitialized]);

  // 监听步骤变化，保存当前步骤
  useEffect(() => {
    if (isInitialized) {
      saveCurrentStepToStorage(currentStep);
    }
  }, [currentStep, isInitialized]);

  // This effect correctly initializes the calendar month on the client-side
  // to avoid hydration errors.
  useEffect(() => {
    const birthDateValue = getValues("basicInfo.birthDate");
    if (birthDateValue && /^\d{4}-\d{2}-\d{2}$/.test(birthDateValue)) {
      const parsed = parse(birthDateValue, 'yyyy-MM-dd', new Date());
      if (isValidDate(parsed)) {
        setCalendarDisplayMonth(parsed);
        return;
      }
    }
    setCalendarDisplayMonth(new Date());
  }, []); // Run only once on mount

  // This effect updates the calendar view when the user types a valid date.
  useEffect(() => {
    if (watchedBirthDate && /^\d{4}-\d{2}-\d{2}$/.test(watchedBirthDate)) {
      const parsedDate = parse(watchedBirthDate, 'yyyy-MM-dd', new Date());
      if (isValidDate(parsedDate)) {
        setCalendarDisplayMonth(parsedDate);
      }
    }
  }, [watchedBirthDate]);
  
  const mbtiQuestionGroups = useMemo(() => ({
    ei: Array.from({ length: 7 }, (_, i) => ({
      key: `ei-${i}`,
      formKey: `mbtiAnswers.eiAnswers.${i}` as const,
      question: t(`energyExplorationPage.questionnaire.mbtiQuestions.ei.${i}.q`),
      optionA: t(`energyExplorationPage.questionnaire.mbtiQuestions.ei.${i}.a`),
      optionB: t(`energyExplorationPage.questionnaire.mbtiQuestions.ei.${i}.b`),
    })),
    sn: Array.from({ length: 7 }, (_, i) => ({
      key: `sn-${i}`,
      formKey: `mbtiAnswers.snAnswers.${i}` as const,
      question: t(`energyExplorationPage.questionnaire.mbtiQuestions.sn.${i}.q`),
      optionA: t(`energyExplorationPage.questionnaire.mbtiQuestions.sn.${i}.a`),
      optionB: t(`energyExplorationPage.questionnaire.mbtiQuestions.sn.${i}.b`),
    })),
    tf: Array.from({ length: 7 }, (_, i) => ({
      key: `tf-${i}`,
      formKey: `mbtiAnswers.tfAnswers.${i}` as const,
      question: t(`energyExplorationPage.questionnaire.mbtiQuestions.tf.${i}.q`),
      optionA: t(`energyExplorationPage.questionnaire.mbtiQuestions.tf.${i}.a`),
      optionB: t(`energyExplorationPage.questionnaire.mbtiQuestions.tf.${i}.b`),
    })),
    jp: Array.from({ length: 7 }, (_, i) => ({
      key: `jp-${i}`,
      formKey: `mbtiAnswers.jpAnswers.${i}` as const,
      question: t(`energyExplorationPage.questionnaire.mbtiQuestions.jp.${i}.q`),
      optionA: t(`energyExplorationPage.questionnaire.mbtiQuestions.jp.${i}.a`),
      optionB: t(`energyExplorationPage.questionnaire.mbtiQuestions.jp.${i}.b`),
    })),
  }), [t, language]);


  const statusSliders = [
    { name: "currentStatus.stressLevel", labelKey: "energyExplorationPage.questionnaire.status.stressLevel"},
    { name: "currentStatus.energyLevel", labelKey: "energyExplorationPage.questionnaire.status.energyLevel"},
  ] as const;
  
  const colorOptions = useMemo(() => getTranslatedOptions('colors'), [t, language, getTranslatedOptions]);
  const activityOptions = useMemo(() => getTranslatedOptions('activities'), [t, language, getTranslatedOptions]);
  const healingGoalOptions = useMemo(() => getTranslatedOptions('healingGoals'), [t, language, getTranslatedOptions]);
  const genderOptions = useMemo(() => getTranslatedOptions('genders'), [t, language, getTranslatedOptions]);

  const handleNext = async () => {
    setDirection(1);
    const currentStepData = stepsConfig[currentStep];
    let isStepValid = true;

    if (currentStepData.skippable) {
        let isSectionActuallyComplete = false;
        const currentValues = getValues(currentStepData.id as keyof QuestionnaireFormValues);

        if (currentStepData.id === "chakraAnswers") {
            isSectionActuallyComplete = areChakraAnswersComplete(currentValues as ChakraQuestionnaireAnswers | undefined);
        } else if (currentStepData.id === "mbtiAnswers") {
            isSectionActuallyComplete = areMbtiAnswersComplete(currentValues as MbtiRawAnswers | undefined);
        }

        if (!isSectionActuallyComplete) {
            // Section is not fully complete. Show the "skipped" toast.
            // Trigger validation for fields the user *did* interact with to show inline errors,
            // but this doesn't prevent navigation.
            if (currentStepData.fields) {
                 await trigger(currentStepData.fields as any);
            }
            toast({
                title: t('toasts.skippedSectionTitle'),
                description: t(currentStepData.skipToastKey as string),
                variant: "default", 
            });
        }
        // Always allow proceeding for skippable steps
        isStepValid = true;
    } else if (currentStepData.fields) {
      // For non-skippable steps, enforce validation
      isStepValid = await trigger(currentStepData.fields as any);
       if (!isStepValid) {
         toast({
            variant: "destructive",
            title: t('toasts.incompleteSectionTitle'),
            description: t('toasts.incompleteSectionDesc'),
          });
      }
    }

    if (isStepValid && currentStep < stepsConfig.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleClearProgress = () => {
    if (window.confirm("确定要清空所有答题进度吗？此操作无法撤销。")) {
      clearStoredFormData();
      reset(defaultFormValues);
      setCurrentStep(0);
      toast({
        title: "已清空答题进度",
        description: "您的所有答题进度已被清除，可以重新开始测评。",
        variant: "default",
      });
    }
  };

  // 增强评估相关处理函数
  const handleEnhancedAssessmentAccept = () => {
    setShowEnhancedAssessmentDialog(false);
    setShowEnhancedQuestionnaire(true);
  };

  const handleEnhancedAssessmentDecline = () => {
    setShowEnhancedAssessmentDialog(false);
  };

  const handleEnhancedAssessmentComplete = (enhancedData: any) => {
    // 合并基础评估和增强评估结果
    if (basicAssessmentResult) {
      setProfileData({
        ...basicAssessmentResult,
        ...enhancedData
      });
    }
    setShowEnhancedQuestionnaire(false);
    
    toast({
      title: t('toasts.enhancedAnalysisCompleteTitle') || "增强分析完成",
      description: t('toasts.enhancedAnalysisCompleteDesc') || "您的深度能量画像已生成，包含更全面的分析维度",
    });
  };
  
  const onSubmit: SubmitHandler<QuestionnaireFormValues> = async (data) => {
    setIsAnalyzing(true);
    setProfileData(null);
    
    let finalMbtiResult = undefined;
    if (data.mbtiAnswers && areMbtiAnswersComplete(data.mbtiAnswers)) {
      finalMbtiResult = calculateMbtiType(data.mbtiAnswers);
    }

    let finalChakraScores = undefined;
    if (data.chakraAnswers && areChakraAnswersComplete(data.chakraAnswers)) {
      finalChakraScores = calculateChakraScores(data.chakraAnswers);
    }

    try {
      const aiInput: FullQuestionnaireDataInput = {
        basicInfo: data.basicInfo,
        mbtiAnswers: data.mbtiAnswers && areMbtiAnswersComplete(data.mbtiAnswers) ? data.mbtiAnswers : undefined,
        calculatedMbtiType: finalMbtiResult?.type,
        chakraAssessment: finalChakraScores,
        lifestylePreferences: data.lifestylePreferences,
        currentStatus: data.currentStatus,
        language: language
      };
      const result = await analyzeUserProfile(aiInput);
      setProfileData(result);
      setBasicAssessmentResult(result); // 保存基础评估结果
      
      toast({
        title: t('toasts.profileAnalysisCompleteTitle'),
        description: t('toasts.profileAnalysisCompleteDesc'),
      });
      
      // 仅在用户尚未完成增强评估时弹出增强评估选择对话框
      if (!enhancedData) {
        setTimeout(() => {
          setShowEnhancedAssessmentDialog(true);
        }, 1000); // 延迟1秒弹出，让用户先看到基础结果
      }
      
      let shouldClearLocalStorage = false;
      
      // Save profile if user is logged in
      if (isAuthenticated && user) {
        try {
          // 导入Supabase服务
          const { profileService } = await import('@/lib/supabase');
          
          // 构造用户档案数据（移除user_id，让数据库自动生成UUID）
          const profileData = {
            email: user.email,
            name: data.basicInfo.name,
            birth_date: data.basicInfo.birthDate,
            gender: data.basicInfo.gender,
            zodiac_sign: result.inferredZodiac,
            chinese_zodiac: result.inferredChineseZodiac,
            element: result.inferredElement,
            mbti: result.mbtiLikeType,
            answers: data, // 保存完整的问卷答案
            chakra_analysis: finalChakraScores || null,
            energy_preferences: data.lifestylePreferences,
            personality_insights: result.coreEnergyInsights,
          };
          
          // 保存到数据库
          console.log('正在保存用户画像数据:', profileData);
          const savedProfile = await profileService.upsertUserProfile(profileData);
          
          if (savedProfile) {
            console.log('✅ 用户画像保存成功:', savedProfile);
            shouldClearLocalStorage = true; // 只有数据库保存成功才清除本地数据
            toast({
              title: t('toasts.profileSavedSuccessTitle'),
              description: t('toasts.profileSavedSuccessDesc'),
            });
          } else {
            console.error('❌ 保存用户画像失败: 未返回数据');
            throw new Error('Failed to save profile to database');
          }
        } catch (saveError) {
          console.error("Failed to save user profile:", saveError);
          toast({
            variant: "destructive",
            title: t('toasts.profileSaveErrorTitle'),
            description: `${saveError instanceof Error ? saveError.message : String(saveError)}。您的问卷数据已保留在本地，稍后可重新提交。`,
          });
          // 数据库保存失败时不清除本地存储，用户可以稍后重试
          shouldClearLocalStorage = false;
        }
      } else {
        // 用户未登录，仅完成AI分析，保留本地数据以备后用
        shouldClearLocalStorage = false;
        console.log('💾 用户未登录，问卷数据已保留在本地存储中');
      }
      
      // 只有在数据库保存成功或用户手动清除时才清除本地存储
      if (shouldClearLocalStorage) {
        clearStoredFormData();
        console.log('🧹 本地存储已清除（数据已成功保存到数据库）');
      }

    } catch (error) {
      console.error("Error analyzing user profile:", error);
      toast({
        variant: "destructive",
        title: t('toasts.errorAnalyzingProfileTitle'),
        description: error instanceof Error ? error.message : t('toasts.unknownError'),
      });
      setProfileData(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const progressValue = ((currentStep + 1) / stepsConfig.length) * 100;

  const renderChakraAssessment = () => (
    <div className="space-y-10">
      {chakraKeys.map((chakraKey) => (
        <div key={chakraKey} className="space-y-6">
          <h3 className="text-xl font-semibold text-accent border-b pb-2">
            {t(`energyExplorationPage.questionnaire.chakraAssessment.${chakraKey}.title`)}
          </h3>
          {([1, 2, 3, 4] as const).map((qIndex) => {
            const questionText = t(`energyExplorationPage.questionnaire.chakraAssessment.${chakraKey}.q${qIndex}`);
            const fieldName = `chakraAnswers.${chakraKey}.${qIndex - 1}` as const;
            const errorForField = errors.chakraAnswers?.[chakraKey]?.[qIndex-1];

            return (
              <div key={`${chakraKey}-q${qIndex}`} className="p-4 border rounded-md bg-card/50 shadow-sm">
                <Label htmlFor={fieldName} className="block mb-3 text-sm font-normal leading-snug">
                  {qIndex}. {questionText}
                </Label>
                <Controller
                  name={fieldName}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      onValueChange={(value) => field.onChange(value ? parseInt(value, 10) : undefined)}
                      value={field.value !== undefined ? String(field.value) : ""}
                      className="flex flex-wrap gap-x-4 gap-y-2"
                    >
                      {([1, 2, 3, 4, 5] as const).map((val) => (
                        <div key={val} className="flex items-center space-x-2">
                          <RadioGroupItem value={String(val)} id={`${fieldName}-${val}`} />
                          <Label htmlFor={`${fieldName}-${val}`} className="font-normal cursor-pointer text-xs sm:text-sm">
                            {val} - {t(`energyExplorationPage.questionnaire.chakraAssessment.likertScale.${val}`)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                {errorForField && <p className="text-destructive text-sm mt-2">{t(errorForField.message || "energyExplorationPage.questionnaire.chakraAssessment.validation.answerRequired")}</p>}
              </div>
            );
          })}
          {chakraKey !== 'crown' && <Separator className="my-10" />}
        </div>
      ))}
    </div>
  );


  const renderMbtiQuestions = () => (
    <div className="space-y-10">
        {(Object.keys(mbtiQuestionGroups) as Array<keyof typeof mbtiQuestionGroups>).map(dimKey => (
            <div key={dimKey} className="space-y-8">
                <h3 className="text-xl font-semibold text-accent border-b pb-2">{t(`energyExplorationPage.questionnaire.mbtiQuestions.dimensionLabels.${dimKey}`)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {mbtiQuestionGroups[dimKey].map((qItem, index) => (
                        <div key={qItem.key} className="p-4 border rounded-md bg-card/50 shadow-sm">
                            <Label htmlFor={`${qItem.key}-A`} className="block mb-3 text-sm font-normal leading-snug">{index + 1}. {qItem.question}</Label>
                            <Controller
                                name={qItem.formKey}
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup 
                                      onValueChange={(value) => field.onChange(value || undefined)} 
                                      value={field.value || ""} 
                                      className="mt-2 space-y-3"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="A" id={`${qItem.key}-A`} />
                                            <Label htmlFor={`${qItem.key}-A`} className="font-normal cursor-pointer text-sm leading-snug">{qItem.optionA}</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="B" id={`${qItem.key}-B`} />
                                            <Label htmlFor={`${qItem.key}-B`} className="font-normal cursor-pointer text-sm leading-snug">{qItem.optionB}</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                            {errors.mbtiAnswers?.[`${dimKey}Answers`]?.[index] && <p className="text-destructive text-sm mt-2">{t(errors.mbtiAnswers?.[`${dimKey}Answers`]?.[index]?.message || "energyExplorationPage.questionnaire.validation.mbtiAnswerRequired")}</p>}
                        </div>
                    ))}
                </div>
                 {dimKey !== 'jp' && <Separator className="my-10" />}
            </div>
        ))}
    </div>
);


  const renderStatusSliders = () => (
    <div className="space-y-8">
      {statusSliders.map(slider => (
        <div key={slider.name}>
          <Label htmlFor={slider.name} className="block mb-2 text-base">{t(slider.labelKey)}</Label>
            <Controller
              name={slider.name}
              control={control}
              render={({ field: { value, onChange } }) => (
                <>
                  <Slider
                    id={slider.name}
                    min={1} max={5} step={1}
                    defaultValue={[typeof value === 'number' ? value : 3]}
                    onValueChange={(val) => onChange(val[0])}
                    className="my-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t("energyExplorationPage.questionnaire.status.low")}</span>
                    <span>{t("energyExplorationPage.questionnaire.status.moderate")}</span>
                    <span>{t("energyExplorationPage.questionnaire.status.high")}</span>
                  </div>
                </>
              )}
            />
        </div>
      ))}
    </div>
  );

  // 强制更新InstantFeedback的机制
  const updateFormDataSnapshot = () => {
    const currentData = getValues();
    setFormDataSnapshot({ ...currentData });
  };

  // 监听表单数据变化
  useEffect(() => {
    const subscription = watch(() => {
      updateFormDataSnapshot();
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // 初始化表单数据快照
  useEffect(() => {
    updateFormDataSnapshot();
  }, [currentStep]);

  const renderStepContent = () => {
    switch (stepsConfig[currentStep].id) {
      case "basicInfo":
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="basicInfo.name">{t('energyExplorationPage.questionnaire.basicInfo.nameLabel')}</Label>
              <Controller name="basicInfo.name" control={control} render={({ field }) => <Input id="basicInfo.name" {...field} placeholder={t('energyExplorationPage.questionnaire.basicInfo.namePlaceholder')} />} />
              {errors.basicInfo?.name && <p className="text-destructive text-sm mt-1">{t(errors.basicInfo.name.message || "")}</p>}
            </div>
            <div>
              <Label htmlFor="basicInfo.birthDate-input">{t('energyExplorationPage.questionnaire.basicInfo.birthDateLabel')}</Label>
              <Controller
                name="basicInfo.birthDate"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Input
                      id="basicInfo.birthDate-input"
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={field.value}
                      onChange={(e) => {
                        const newRawValue = e.target.value;
                        field.onChange(newRawValue);
                        if (/^\d{4}-\d{2}-\d{2}$/.test(newRawValue)) {
                           const parsed = parse(newRawValue, 'yyyy-MM-dd', new Date());
                           if (isValidDate(parsed)) {
                               setCalendarDisplayMonth(parsed);
                           }
                        } else if (newRawValue === "") {
                           setCalendarDisplayMonth(new Date());
                        }
                      }}
                      onBlur={() => trigger("basicInfo.birthDate")}
                      className="flex-grow"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant={"outline"} size="icon" className="shrink-0">
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value && /^\d{4}-\d{2}-\d{2}$/.test(field.value) && isValidDate(parse(field.value, 'yyyy-MM-dd', new Date())) ? parse(field.value, 'yyyy-MM-dd', new Date()) : undefined}
                          onSelect={(date) => {
                            const formattedDate = date ? format(date, "yyyy-MM-dd") : "";
                            field.onChange(formattedDate);
                            if (date) {
                              setCalendarDisplayMonth(date);
                            }
                            trigger("basicInfo.birthDate");
                          }}
                          month={calendarDisplayMonth}
                          onMonthChange={setCalendarDisplayMonth}
                          captionLayout="buttons"
                          fromYear={1920}
                          toYear={new Date().getFullYear()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              />
              {errors.basicInfo?.birthDate && <p className="text-destructive text-sm mt-1">{t(errors.basicInfo.birthDate.message || "")}</p>}
            </div>
            <div>
              <Label>{t('energyExplorationPage.questionnaire.basicInfo.genderLabel')}</Label>
              <Controller
                name="basicInfo.gender"
                control={control}
                render={({ field }) => (
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="mt-2 space-y-2">
                    {genderOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`gender-${option.value}`} />
                        <Label htmlFor={`gender-${option.value}`} className="font-normal">{option.label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.basicInfo?.gender && <p className="text-destructive text-sm mt-1">{t(errors.basicInfo.gender.message || "")}</p>}
            </div>
          </div>
        );
      case "chakraAnswers":
        return renderChakraAssessment();
      case "mbtiAnswers":
        return renderMbtiQuestions();
      case "lifestylePreferences":
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-base">{t('energyExplorationPage.questionnaire.lifestyle.colorPreferencesLabel')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('energyExplorationPage.questionnaire.lifestyle.selectAtLeastOne')}</p>
              <Controller
                name="lifestylePreferences.colorPreferences"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {colorOptions.map(option => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={field.value?.includes(option.value) ? "default" : "outline"}
                        style={field.value?.includes(option.value) ? { backgroundColor: option.value.split('_')[1], color: ['yellow', 'white', 'pink', 'orange'].includes(option.value.split('_')[1]) ? 'black' : 'white' } : { borderColor: option.value.split('_')[1] } }
                        onClick={() => {
                          const currentValues = field.value || [];
                          const newValues = currentValues.includes(option.value)
                            ? currentValues.filter(v => v !== option.value)
                            : [...currentValues, option.value];
                          field.onChange(newValues);
                        }}
                        className="h-16 text-xs p-1 flex items-center justify-center text-center"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                )}
              />
              {errors.lifestylePreferences?.colorPreferences && <p className="text-destructive text-sm mt-1">{t(errors.lifestylePreferences.colorPreferences.message || "")}</p>}
            </div>
             <div>
              <Label className="text-base">{t('energyExplorationPage.questionnaire.lifestyle.activityPreferencesLabel')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('energyExplorationPage.questionnaire.lifestyle.selectAtLeastOne')}</p>
              <Controller
                name="lifestylePreferences.activityPreferences"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {activityOptions.map(option => (
                      <div key={option.value} className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent/10 transition-colors">
                        <Checkbox
                          id={`activity-${option.value}`}
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            const newValues = checked
                              ? [...currentValues, option.value]
                              : currentValues.filter(v => v !== option.value);
                            return field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor={`activity-${option.value}`} className="font-normal cursor-pointer text-sm flex-1">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.lifestylePreferences?.activityPreferences && <p className="text-destructive text-sm mt-1">{t(errors.lifestylePreferences.activityPreferences.message || "")}</p>}
            </div>
            <div>
              <Label className="text-base">{t('energyExplorationPage.questionnaire.lifestyle.healingGoalsLabel')}</Label>
              <p className="text-sm text-muted-foreground mb-2">{t('energyExplorationPage.questionnaire.lifestyle.selectAtLeastOne')}</p>
               <Controller
                name="lifestylePreferences.healingGoals"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {healingGoalOptions.map(option => (
                       <div key={option.value} className="flex items-center space-x-2 p-2 rounded-md border border-input hover:bg-accent/10 transition-colors">
                        <Checkbox
                          id={`goal-${option.value}`}
                          checked={field.value?.includes(option.value)}
                          onCheckedChange={(checked) => {
                            const currentValues = field.value || [];
                            const newValues = checked
                              ? [...currentValues, option.value]
                              : currentValues.filter(v => v !== option.value);
                            return field.onChange(newValues);
                          }}
                        />
                        <Label htmlFor={`goal-${option.value}`} className="font-normal cursor-pointer text-sm flex-1">{option.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
              {errors.lifestylePreferences?.healingGoals && <p className="text-destructive text-sm mt-1">{t(errors.lifestylePreferences.healingGoals.message || "")}</p>}
            </div>
          </div>
        );
      case "currentStatus":
        return (
          <div className="space-y-8">
            {renderStatusSliders()}
            <div>
              <Label htmlFor="currentStatus.emotionalState">{t('energyExplorationPage.questionnaire.status.emotionalStateLabel')}</Label>
              <Controller name="currentStatus.emotionalState" control={control} render={({ field }) => <Textarea id="currentStatus.emotionalState" {...field} placeholder={t('energyExplorationPage.questionnaire.status.emotionalStatePlaceholder')} rows={4} />} />
              <p className="text-xs text-muted-foreground mt-1">{t('energyExplorationPage.questionnaire.status.emotionalStateHint')}</p>
              {errors.currentStatus?.emotionalState && <p className="text-destructive text-sm mt-1">{t(errors.currentStatus.emotionalState.message || "")}</p>}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="w-full shadow-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-center">{t('energyExplorationPage.questionnaire.title')}</CardTitle>
          <CardDescription className="text-center">{t('energyExplorationPage.questionnaire.description')}</CardDescription>

          <div className="flex items-center space-x-1 mt-4 pt-4 border-t overflow-x-auto pb-2">
            {stepsConfig.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center min-w-[70px] sm:min-w-[80px] flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === index ? 'border-primary bg-primary text-primary-foreground' : currentStep > index ? 'border-primary bg-primary/20 text-primary' : 'border-border bg-muted'}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <p className={`mt-1 text-xs text-center ${currentStep === index ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>{t(step.titleKey)}</p>
                </div>
                {index < stepsConfig.length - 1 && <div className={`flex-grow h-0.5 mt-5 ${currentStep > index ? 'bg-primary' : 'bg-border'}`} style={{minWidth: '20px'}} />}
              </React.Fragment>
            ))}
          </div>
          <Progress value={progressValue} className="mt-2" />

        </CardHeader>
        <CardContent className="min-h-[400px] py-6 px-4 md:px-6">
          <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                custom={direction}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {renderStepContent()}
                
                {/* 即时反馈组件 - 使用实时快照数据 */}
                <InstantFeedback 
                  step={currentStep} 
                  formData={formDataSnapshot} 
                  className="animate-fade-in"
                />
              </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleBack} disabled={currentStep === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" /> {t('common.backButton')}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={handleClearProgress}
                className="text-muted-foreground hover:text-destructive"
                title="清空所有答题进度"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            {currentStep < stepsConfig.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                {t('energyExplorationPage.questionnaire.nextButton')} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit(onSubmit)} disabled={!isFormValid}>
                {t('energyExplorationPage.questionnaire.submitButton')}
              </Button>
            )}
        </CardFooter>
      </Card>

      {/* 增强评估选择对话框 */}
      <Dialog open={showEnhancedAssessmentDialog} onOpenChange={setShowEnhancedAssessmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ✨ 发现更深层的自己
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              恭喜您完成了基础能量评估！🎉
              <br /><br />
              您现在可以选择进行<strong>深度增强评估</strong>，获得更全面的八维能量分析：
              <ul className="list-disc list-inside mt-3 space-y-1 text-sm">
                <li><strong>身体体质评估</strong> - 了解您的身体能量状态</li>
                <li><strong>生活节律分析</strong> - 发现您的自然生活模式</li>
                <li><strong>社交关系能量</strong> - 探索人际互动中的能量流动</li>
                <li><strong>财务能量评估</strong> - 理解金钱与丰盛的能量关系</li>
                <li><strong>情绪智能测试</strong> - 深化情绪管理和觉察能力</li>
              </ul>
              <p className="mt-3 text-primary font-medium">
                ⏱️ 大约需要额外 10-15 分钟完成
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleEnhancedAssessmentDecline}>
              暂时不需要
            </Button>
            <Button onClick={handleEnhancedAssessmentAccept}>
              开始深度评估 ✨
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 增强问卷组件 */}
      {showEnhancedQuestionnaire && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <EnhancedQuestionnaire onComplete={handleEnhancedAssessmentComplete} />
          </div>
        </div>
      )}
    </>
  );
};

export default PersonalizedQuestionnaire;
