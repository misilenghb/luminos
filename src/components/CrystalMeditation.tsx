import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlayCircle, Zap, Brain, Heart, Wind, Loader2, Gem, Sparkles, Clock, Star, AlertCircle } from 'lucide-react';
import meditationScriptFlow from '@/ai/flows/meditation-script-flow';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import type { DailyEnergyState } from '@/types/daily-focus';
import { cn } from '@/lib/utils';

interface CrystalMeditationProps {
  profile?: UserProfileDataOutput | null;
  energyState?: DailyEnergyState;
}

const SCENARIOS = [
  { id: 'relax', label: '放松与疗愈', icon: Heart, color: 'text-pink-500', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  { id: 'focus', label: '提升专注力', icon: Brain, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { id: 'energy', label: '补充能量', icon: Zap, color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30' },
  { id: 'clarity', label: '思绪清晰', icon: Wind, color: 'text-cyan-500', bgColor: 'bg-cyan-50 dark:bg-cyan-950/30' },
];

// 冥想时长选项
const DURATION_OPTIONS = [
  { value: 5, label: '5分钟' },
  { value: 10, label: '10分钟' },
  { value: 15, label: '15分钟' },
  { value: 20, label: '20分钟' },
];

const CrystalMeditation: React.FC<CrystalMeditationProps> = ({ profile, energyState }) => {
  const [generatedScript, setGeneratedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScript = async (scenario: string) => {
    setSelectedScenario(scenario);
    setIsLoading(true);
    setGeneratedScript('');
    setIsDialogOpen(true);
    
    try {
      // 创建安全的参数对象，避免传递 null 或 undefined
      const safeProfile: UserProfileDataOutput = profile || {
        name: '默认用户',
        mbtiLikeType: 'ENFP',
        inferredZodiac: 'Aries',
        inferredChineseZodiac: 'Dragon',
        inferredElement: 'Fire',
        inferredPlanet: 'Mars',
        chakraAnalysis: '心轮平衡',
        coreEnergyInsights: '能量平衡'
      };
      
      const safeEnergyState = energyState || {
        date: new Date(),
        energyLevel: 3,
        dominantChakra: 'heart',
        recommendedCrystal: '白水晶',
        energyColor: '#3b82f6',
        mbtiMood: '平衡状态',
        elementBalance: '和谐平衡'
      };
      
      console.log('🔄 正在生成冥想脚本，参数:', {
        profile: safeProfile,
        energyState: {
          ...safeEnergyState,
          date: safeEnergyState.date.toISOString(), // 仅日志用
        },
        scenario: scenario,
        duration: String(selectedDuration)
      });
      
      const script = await meditationScriptFlow({
        profile: safeProfile,
        energyState: {
          date: safeEnergyState.date,
          energyLevel: safeEnergyState.energyLevel,
          dominantChakra: safeEnergyState.dominantChakra,
          recommendedCrystal: safeEnergyState.recommendedCrystal,
          energyColor: safeEnergyState.energyColor || '#6366f1',
          mbtiMood: safeEnergyState.mbtiMood,
          elementBalance: safeEnergyState.elementBalance,
          isSpecialDay: safeEnergyState.isSpecialDay || false,
          specialType: safeEnergyState.specialType || '',
        },
        scenario: scenario,
        duration: String(selectedDuration)
      });
      
      console.log('✅ 成功生成冥想脚本:', script);
      setGeneratedScript(script.script);
    } catch (error) {
      console.error('❌ 生成冥想脚本失败:', error);
      setGeneratedScript('抱歉，生成冥想脚本时出现了问题。请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取基于能量状态的推荐冥想类型
  const getRecommendedMeditation = () => {
    if (!energyState) return null;
    
    // 根据主导脉轮推荐冥想类型
    const chakraMeditations: Record<string, string> = {
      'root': '接地冥想',
      'sacral': '创造力冥想',
      'solarPlexus': '自信冥想',
      'heart': '爱与疗愈冥想',
      'throat': '表达冥想',
      'thirdEye': '直觉冥想',
      'crown': '灵性连接冥想'
    };
    
    return chakraMeditations[energyState.dominantChakra] || '平衡冥想';
  };

  // 如果没有用户档案，显示提示信息
  if (!profile) {
    return (
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            水晶冥想引导
          </CardTitle>
          <CardDescription>
            完成个人档案评估后解锁个性化冥想体验
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground opacity-50" />
          <p className="text-center text-muted-foreground">
            请先完成个人能量档案评估，以获取专属于您的冥想引导。
          </p>
          <Button variant="outline">前往完成评估</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 冥想场景选择卡片 */}
      <Card className="overflow-hidden border-0 shadow-md">
        <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="text-xl flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            情景式水晶冥想
          </CardTitle>
          <CardDescription>
            选择一个场景，为您生成专属的冥想引导语
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* 错误提示 */}
          {error && (
            <div className="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}
          
          {/* 冥想时长选择 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">冥想时长</span>
            </div>
            <div className="flex gap-2">
              {DURATION_OPTIONS.map(option => (
                <Button 
                  key={option.value}
                  size="sm"
                  variant={selectedDuration === option.value ? "default" : "outline"}
                  className={cn(
                    "h-8 px-3",
                    selectedDuration === option.value && "shadow-sm"
                  )}
                  onClick={() => setSelectedDuration(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 冥想场景卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SCENARIOS.map(({ id, label, icon: Icon, color, bgColor }) => (
              <Button 
                key={id} 
                variant="outline" 
                className={cn(
                  "meditation-scenario-card flex flex-col h-32 transition-all hover:scale-105",
                  bgColor
                )}
                onClick={() => handleGenerateScript(label)}
              >
                <Icon className={`h-10 w-10 mb-3 ${color}`} />
                <span className="font-medium">{label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 基于能量状态的推荐冥想 */}
      {energyState && (
        <Card className="overflow-hidden border-0 shadow-md">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="flex items-center">
              <Gem className="mr-2 h-5 w-5 text-primary" />
              今日推荐冥想
            </CardTitle>
            <CardDescription>
              基于您的能量状态定制的水晶冥想建议
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 推荐水晶冥想 */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center">
                    <Star className="h-4 w-4 mr-2 text-amber-500 fill-amber-500" />
                    {energyState.recommendedCrystal} 冥想
                  </h4>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    energyState.dominantChakra === 'root' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    energyState.dominantChakra === 'sacral' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                    energyState.dominantChakra === 'solarPlexus' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    energyState.dominantChakra === 'heart' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    energyState.dominantChakra === 'throat' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    energyState.dominantChakra === 'thirdEye' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' :
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                  )}>
                    {energyState.dominantChakra === 'root' ? '海底轮' :
                    energyState.dominantChakra === 'sacral' ? '脐轮' :
                    energyState.dominantChakra === 'solarPlexus' ? '太阳轮' :
                    energyState.dominantChakra === 'heart' ? '心轮' :
                    energyState.dominantChakra === 'throat' ? '喉轮' :
                    energyState.dominantChakra === 'thirdEye' ? '眉心轮' : '顶轮'}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  今日推荐使用{energyState.recommendedCrystal}进行冥想，可以帮助平衡您的能量，增强{energyState.mbtiMood}状态。
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleGenerateScript(`${energyState.recommendedCrystal}冥想`)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  生成专属引导语
                </Button>
              </div>
              
              {/* 推荐脉轮冥想 */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-muted/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-primary" />
                    {getRecommendedMeditation()}
                  </h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    推荐
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  基于您今日的能量状态，建议进行{getRecommendedMeditation()}，有助于提升内在平衡与和谐。
                </p>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleGenerateScript(getRecommendedMeditation() || '')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  生成专属引导语
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* 冥想引导对话框 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedScenario} 冥想引导
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {selectedDuration}分钟
              </span>
            </DialogTitle>
            <DialogDescription>
              根据您的能量状态和水晶选择，为您定制的冥想引导体验
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">正在生成您的个性化冥想引导...</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {generatedScript ? (
                <div className="space-y-4">
                  <div className="meditation-script prose dark:prose-invert max-w-none">
                    {typeof generatedScript === 'string' ? generatedScript.split('\n\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    )) : (
                      <p>无法显示冥想脚本，请稍后再试</p>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      关闭
                    </Button>
                    <Button className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      开始冥想
                    </Button>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                  <p className="text-red-500">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    关闭
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrystalMeditation; 