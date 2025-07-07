"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Star, Gem, Heart, Brain, Palette, Activity } from 'lucide-react';
import type { QuestionnaireFormValues } from '@/types/questionnaire';

interface InstantFeedbackProps {
  step: number;
  formData: Partial<QuestionnaireFormValues> | any;
  className?: string;
}

// 根据生日计算星座
const getZodiacSign = (birthDate: string) => {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const monthDay = month * 100 + day;
  
  const signs = [
    { name: '水瓶座', nameEn: 'Aquarius', start: 120, end: 218, element: '风', trait: '独立创新' },
    { name: '双鱼座', nameEn: 'Pisces', start: 219, end: 320, element: '水', trait: '感性直觉' },
    { name: '白羊座', nameEn: 'Aries', start: 321, end: 419, element: '火', trait: '热情冲劲' },
    { name: '金牛座', nameEn: 'Taurus', start: 420, end: 520, element: '土', trait: '稳重务实' },
    { name: '双子座', nameEn: 'Gemini', start: 521, end: 620, element: '风', trait: '聪明多变' },
    { name: '巨蟹座', nameEn: 'Cancer', start: 621, end: 722, element: '水', trait: '温柔体贴' },
    { name: '狮子座', nameEn: 'Leo', start: 723, end: 822, element: '火', trait: '自信领导' },
    { name: '处女座', nameEn: 'Virgo', start: 823, end: 922, element: '土', trait: '完美主义' },
    { name: '天秤座', nameEn: 'Libra', start: 923, end: 1022, element: '风', trait: '和谐平衡' },
    { name: '天蝎座', nameEn: 'Scorpio', start: 1023, end: 1121, element: '水', trait: '深沉神秘' },
    { name: '射手座', nameEn: 'Sagittarius', start: 1122, end: 1221, element: '火', trait: '自由探索' },
    { name: '摩羯座', nameEn: 'Capricorn', start: 1222, end: 119, element: '土', trait: '踏实进取' }
  ];

  for (const sign of signs) {
    if (sign.start <= sign.end) {
      if (monthDay >= sign.start && monthDay <= sign.end) return sign;
    } else {
      if (monthDay >= sign.start || monthDay <= sign.end) return sign;
    }
  }
  return signs[0]; // 默认返回水瓶座
};

// 分析脉轮能量状态
const analyzeChakraState = (chakraAnswers: Record<string, number>) => {
  const chakraNames = {
    root: { name: '根轮', color: 'chakra-root' },
    sacral: { name: '骶轮', color: 'chakra-sacral' },
    solarPlexus: { name: '太阳轮', color: 'chakra-solar-plexus' },
    heart: { name: '心轮', color: 'chakra-heart' },
    throat: { name: '喉轮', color: 'chakra-throat' },
    thirdEye: { name: '第三眼轮', color: 'chakra-third-eye' },
    crown: { name: '顶轮', color: 'chakra-crown' }
  };

  const scores = Object.entries(chakraAnswers);
  if (scores.length === 0) return null;

  const strongest = scores.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );
  const weakest = scores.reduce((min, current) => 
    current[1] < min[1] ? current : min
  );

  return {
    strongest: {
      name: chakraNames[strongest[0] as keyof typeof chakraNames]?.name || strongest[0],
      score: strongest[1],
      color: chakraNames[strongest[0] as keyof typeof chakraNames]?.color || 'chakra-crown'
    },
    weakest: {
      name: chakraNames[weakest[0] as keyof typeof chakraNames]?.name || weakest[0],
      score: weakest[1],
      color: chakraNames[weakest[0] as keyof typeof chakraNames]?.color || 'chakra-root'
    },
    average: scores.reduce((sum, [, score]) => sum + score, 0) / scores.length
  };
};

// 分析MBTI倾向
const analyzeMBTITendency = (mbtiAnswers: any) => {
  if (!mbtiAnswers || Object.keys(mbtiAnswers).length === 0) return null;

  // 检查是否有有效答案
  const hasAnswers = Object.values(mbtiAnswers).some((answers: any) => 
    Array.isArray(answers) && answers.some(answer => answer === 'A' || answer === 'B')
  );

  if (!hasAnswers) return null;

  // 简化的倾向分析
  const dimensions = ['能量来源', '信息处理', '决策方式', '生活方式'];
  return { dimensions, hasData: true };
};

// 分析当前状态
const analyzeCurrentStatus = (currentStatus: any) => {
  if (!currentStatus) return null;
  
  const { stressLevel, energyLevel, emotionalState } = currentStatus;
  if (!stressLevel && !energyLevel && !emotionalState) return null;

  const getStatusLevel = (level: number) => {
    if (level <= 2) return { text: '较低', color: 'bg-primary' };
    if (level <= 3) return { text: '中等', color: 'bg-accent' };
    return { text: '较高', color: 'bg-destructive' };
  };

  return {
    stress: stressLevel ? getStatusLevel(stressLevel) : null,
    energy: energyLevel ? getStatusLevel(energyLevel) : null,
    emotional: emotionalState ? emotionalState.substring(0, 50) : null
  };
};

const InstantFeedback: React.FC<InstantFeedbackProps> = ({ step, formData, className = "" }) => {
  const { language, t } = useLanguage();

  // 根据步骤渲染不同的反馈内容
  const renderStepFeedback = () => {
    switch (step) {
      case 0: // 基本信息完成
        if (formData.basicInfo?.birthDate) {
          const zodiac = getZodiacSign(formData.basicInfo.birthDate);
          if (zodiac) {
            return (
              <Card className="quantum-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 heading-enhanced text-lg">
                    <Star className="h-5 w-5 text-primary" />
                    {t('energyExplorationPage.instantFeedback.zodiacAnalysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary text-white px-3 py-1 text-sm font-medium shadow-sm">
                      {language === 'zh' ? zodiac.name : zodiac.nameEn}
                    </Badge>
                    <Badge className={`element-${zodiac.element === '火' ? 'fire' : zodiac.element === '水' ? 'water' : zodiac.element === '土' ? 'earth' : 'air'} px-2 py-1 text-xs shadow-sm`}>
                      {zodiac.element}元素
                    </Badge>
                  </div>
                  <div className="p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                    <p className="text-sm text-foreground mb-1">
                      <span className="font-semibold text-primary">特质：</span>{zodiac.trait}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      💎 你的星座能量将影响水晶的选择和搭配方式
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }
        }
        break;

      case 1: // 脉轮测试完成
        if (formData.chakraAnswers && Object.keys(formData.chakraAnswers).length > 0) {
          // 检查脉轮答案是否有实际数据
          const hasData = Object.values(formData.chakraAnswers).some(answers => 
            Array.isArray(answers) && answers.some(answer => 
              typeof answer === 'number' && answer >= 1 && answer <= 5
            )
          );
          
          if (hasData) {
            // 计算脉轮分数
            const chakraScores: Record<string, number> = {};
            Object.entries(formData.chakraAnswers).forEach(([key, answers]) => {
              if (Array.isArray(answers)) {
                const validAnswers = answers.filter(a => 
                  typeof a === 'number' && a >= 1 && a <= 5
                );
                if (validAnswers.length > 0) {
                  chakraScores[key] = validAnswers.reduce((sum: number, val: number) => sum + val, 0) / validAnswers.length;
                }
              }
            });

            const chakraState = analyzeChakraState(chakraScores);
            if (chakraState) {
              return (
                <Card className="quantum-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 heading-enhanced text-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {t('energyExplorationPage.instantFeedback.chakraPreview')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                      <span className="text-sm font-medium text-foreground">整体能量水平</span>
                      <Badge className="bg-primary text-white px-3 py-1 shadow-sm">
                        {Math.round(chakraState.average * 20)}/100
                      </Badge>
                    </div>
                    <Progress value={chakraState.average * 20} className="h-3 energy-flow" />
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg hierarchy-tertiary border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-4 h-4 rounded-full ${chakraState.strongest.color} shadow-sm`}></div>
                          <span className="font-semibold text-foreground">✨ 最强脉轮</span>
                        </div>
                        <p className="text-foreground font-medium">{chakraState.strongest.name}</p>
                      </div>
                      <div className="p-3 rounded-lg hierarchy-tertiary border border-border shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-4 h-4 rounded-full ${chakraState.weakest.color} shadow-sm`}></div>
                          <span className="font-semibold text-foreground">🎯 需要关注</span>
                        </div>
                        <p className="text-foreground font-medium">{chakraState.weakest.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground hierarchy-quaternary p-2 rounded border border-border text-center">
                      💎 基于脉轮分析为您推荐个性化水晶组合
                    </p>
                  </CardContent>
                </Card>
              );
            }
          }
        }
        break;

      case 2: // MBTI测试完成
        if (formData.mbtiAnswers && Object.keys(formData.mbtiAnswers).length > 0) {
          const mbtiTendency = analyzeMBTITendency(formData.mbtiAnswers);
          
          if (mbtiTendency) {
            return (
              <Card className="quantum-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 heading-enhanced text-lg">
                    <Brain className="h-5 w-5 text-primary" />
                    {t('energyExplorationPage.instantFeedback.personalityInsights')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      {mbtiTendency.dimensions.map((dimension, idx) => (
                        <div key={idx} className="p-2 rounded hierarchy-tertiary text-center border border-border shadow-sm">
                          <Badge variant="outline" className="text-xs">
                            {dimension}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="text-center p-2 hierarchy-quaternary rounded border border-border">
                      <span className="text-xs text-muted-foreground">
                        🔮 正在分析您的性格维度特征...
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      💎 个性化水晶推荐将根据您的性格类型定制
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }
        }
        break;

      case 3: // 生活偏好完成
        if (formData.lifestylePreferences) {
          const { colorPreferences, activityPreferences, healingGoals } = formData.lifestylePreferences;
          const hasAnyData = (colorPreferences && colorPreferences.length > 0) || 
                           (activityPreferences && activityPreferences.length > 0) || 
                           (healingGoals && healingGoals.length > 0);
          
          if (hasAnyData) {
            return (
              <Card className="quantum-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 heading-enhanced text-lg">
                    <Palette className="h-5 w-5 text-primary" />
                    {t('energyExplorationPage.instantFeedback.lifestyleAnalysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {colorPreferences && colorPreferences.length > 0 && (
                      <div className="p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                        <div className="text-sm font-semibold mb-2 text-foreground flex items-center gap-1">
                          🌈 偏好色彩
                          <Badge className="bg-accent text-accent-foreground text-xs ml-1">
                            {colorPreferences.length}项
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {colorPreferences.slice(0, 4).map((color: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs shadow-sm">
                              {color}
                            </Badge>
                          ))}
                          {colorPreferences.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{colorPreferences.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {activityPreferences && activityPreferences.length > 0 && (
                      <div className="p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                        <div className="text-sm font-semibold mb-2 text-foreground flex items-center gap-1">
                          🏃 活动偏好
                          <Badge className="bg-accent text-accent-foreground text-xs ml-1">
                            {activityPreferences.length}项
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activityPreferences.slice(0, 3).map((activity: string, idx: number) => (
                            <Badge key={idx} className="bg-primary text-white text-xs shadow-sm">
                              {activity}
                            </Badge>
                          ))}
                          {activityPreferences.length > 3 && (
                            <Badge className="bg-primary text-white text-xs">
                              +{activityPreferences.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {healingGoals && healingGoals.length > 0 && (
                      <div className="p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                        <div className="text-sm font-semibold mb-2 text-foreground flex items-center gap-1">
                          🎯 疗愈目标
                          <Badge className="bg-accent text-accent-foreground text-xs ml-1">
                            {healingGoals.length}项
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {healingGoals.slice(0, 3).map((goal: string, idx: number) => (
                            <Badge key={idx} className="bg-primary text-white text-xs shadow-sm">
                              {goal}
                            </Badge>
                          ))}
                          {healingGoals.length > 3 && (
                            <Badge className="bg-primary text-white text-xs">
                              +{healingGoals.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground hierarchy-quaternary p-2 rounded border border-border text-center shadow-sm">
                      💎 基于您的生活风格，将为您匹配最合适的水晶能量组合
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }
        }
        break;

      case 4: // 当前状态完成
        if (formData.currentStatus) {
          const statusAnalysis = analyzeCurrentStatus(formData.currentStatus);
          
          if (statusAnalysis) {
            return (
              <Card className="quantum-card">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 heading-enhanced text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    {t('energyExplorationPage.instantFeedback.currentStatusAnalysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {statusAnalysis.stress && (
                        <div className="p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${statusAnalysis.stress.color}`}></div>
                            <span className="text-xs font-semibold text-foreground">💢 压力水平</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{statusAnalysis.stress.text}</p>
                        </div>
                      )}
                      
                      {statusAnalysis.energy && (
                        <div className="p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${statusAnalysis.energy.color}`}></div>
                            <span className="text-xs font-semibold text-foreground">⚡ 能量水平</span>
                          </div>
                          <p className="text-sm font-medium text-foreground">{statusAnalysis.energy.text}</p>
                        </div>
                      )}
                    </div>
                    
                    {statusAnalysis.emotional && (
                      <div className="p-3 rounded-lg hierarchy-secondary border border-border shadow-sm">
                        <p className="text-xs font-semibold text-foreground mb-2">💭 情感状态</p>
                        <p className="text-sm text-muted-foreground italic">"{statusAnalysis.emotional}..."</p>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground hierarchy-quaternary p-2 rounded border border-border text-center shadow-sm">
                      🔮 根据您的当前状态，推荐适合的水晶疗愈方案
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          }
        }
        break;

      default:
        return null;
    }
    return null;
  };

  const feedback = renderStepFeedback();
  if (!feedback) return null;

  return (
    <div className={`mt-6 transition-crystal animate-fade-in ${className}`}>
      {feedback}
    </div>
  );
};

export default InstantFeedback; 