"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Briefcase, 
  Heart, 
  Activity, 
  DollarSign, 
  Home, 
  BookOpen, 
  Shield, 
  Sparkles 
} from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

interface LifeScenarioGuidanceProps {
  userProfile: UserProfileDataOutput;
  className?: string;
}

// 生活场景配置
const LIFE_SCENARIOS = {
  work: {
    icon: Briefcase,
    title: '工作场景',
    titleEn: 'Work & Career',
    color: 'bg-primary',
    description: '提升专注力、缓解压力、增强领导力',
    scenarios: [
      {
        situation: '重要会议/演讲',
        crystals: ['青金石', '蓝宝石', '透明水晶'],
        guidance: '佩戴于胸前或放置在桌面，增强沟通能力和自信心',
        duration: '会议前30分钟开始佩戴'
      },
      {
        situation: '创意工作/头脑风暴',
        crystals: ['紫水晶', '萤石', '月光石'],
        guidance: '放置在工作台左侧，激发创意思维和直觉洞察',
        duration: '工作期间持续使用'
      },
      {
        situation: '高压工作环境',
        crystals: ['黑曜石', '红碧玺', '绿幽灵'],
        guidance: '佩戴于左手腕，形成保护能量场，缓解压力',
        duration: '工作日全天佩戴'
      }
    ]
  },
  love: {
    icon: Heart,
    title: '感情场景',
    titleEn: 'Love & Relationships',
    color: 'bg-pink-500',
    description: '增强魅力、改善关系、促进和谐',
    scenarios: [
      {
        situation: '约会/相亲',
        crystals: ['粉水晶', '月光石', '石榴石'],
        guidance: '佩戴在心轮附近，增强个人魅力和吸引力',
        duration: '约会前2小时开始佩戴'
      },
      {
        situation: '关系修复/沟通',
        crystals: ['绿幽灵', '海蓝宝', '玫瑰石英'],
        guidance: '双方各持一颗，促进理解和情感交流',
        duration: '沟通过程中握在手中'
      },
      {
        situation: '增进亲密关系',
        crystals: ['红碧玺', '橙月亮石', '粉水晶'],
        guidance: '放置在卧室或共同活动空间，增强情感连接',
        duration: '长期摆放，定期净化'
      }
    ]
  },
  health: {
    icon: Activity,
    title: '健康场景',
    titleEn: 'Health & Wellness',
    color: 'bg-primary',
    description: '促进睡眠、增强免疫、平衡身心',
    scenarios: [
      {
        situation: '改善睡眠质量',
        crystals: ['紫水晶', '月光石', '蓝色方解石'],
        guidance: '放置在枕头下方或床头柜，促进深度睡眠',
        duration: '每晚使用，月圆时净化'
      },
      {
        situation: '增强免疫力',
        crystals: ['绿幽灵', '透明水晶', '红碧玺'],
        guidance: '佩戴在太阳轮或心轮位置，增强生命力',
        duration: '换季时节重点佩戴'
      },
      {
        situation: '缓解焦虑/压力',
        crystals: ['薰衣草水晶', '海蓝宝', '绿松石'],
        guidance: '握在手中或佩戴于喉轮，平静心情',
        duration: '感到压力时随时使用'
      }
    ]
  },
  wealth: {
    icon: DollarSign,
    title: '财运场景',
    titleEn: 'Wealth & Prosperity',
    color: 'bg-primary',
    description: '招财聚富、投资决策、事业发展',
    scenarios: [
      {
        situation: '商务谈判/签约',
        crystals: ['黄水晶', '绿幽灵', '虎眼石'],
        guidance: '佩戴在左手或放置在桌面，增强商业敏锐度',
        duration: '谈判期间持续佩戴'
      },
      {
        situation: '投资理财决策',
        crystals: ['绿幽灵', '黄水晶', '透明水晶'],
        guidance: '冥想时握在手中，增强直觉和判断力',
        duration: '决策前冥想15-30分钟'
      },
      {
        situation: '财富积累/储蓄',
        crystals: ['绿幽灵', '黄水晶', '金发晶'],
        guidance: '放置在财位或保险箱附近，聚集财运',
        duration: '长期摆放，每月净化一次'
      }
    ]
  }
};

const LifeScenarioGuidance: React.FC<LifeScenarioGuidanceProps> = ({ userProfile, className = "" }) => {
  const { language, t } = useLanguage();

  // 根据用户画像推荐最适合的水晶
  const getPersonalizedCrystalRecommendation = (crystals: string[]) => {
    if (!userProfile.recommendedCrystals) return crystals;
    
    const userCrystals = userProfile.recommendedCrystals.map(c => c.name);
    const matchedCrystals = crystals.filter(crystal => 
      userCrystals.some(userCrystal => 
        userCrystal.includes(crystal) || crystal.includes(userCrystal)
      )
    );
    
    return matchedCrystals.length > 0 ? matchedCrystals : crystals;
  };

  // 根据用户特质调整建议
  const getPersonalizedGuidance = (scenario: string, originalGuidance: string) => {
    const isIntrovert = userProfile.mbtiLikeType?.includes('内向');
    const dominantChakra = userProfile.chakraAnalysis?.includes('根轮') ? '根轮' : 
                          userProfile.chakraAnalysis?.includes('心轮') ? '心轮' : '太阳轮';
    
    let personalizedGuidance = originalGuidance;
    
    // 根据性格调整
    if (isIntrovert && scenario.includes('会议')) {
      personalizedGuidance += "。作为内向者，建议提前在安静环境中充能10分钟";
    }
    
    // 根据脉轮状态调整
    if (dominantChakra === '根轮' && scenario.includes('压力')) {
      personalizedGuidance += "。你的根轮较强，可以重点关注稳定性和安全感";
    }
    
    return personalizedGuidance;
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 heading-enhanced">
          <Sparkles className="h-6 w-6 text-primary" />
          {language === 'zh' ? '生活场景水晶指南' : 'Life Scenario Crystal Guide'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {language === 'zh' 
            ? '基于你的个人能量画像，为不同生活场景提供专属水晶指导'
            : 'Personalized crystal guidance for different life scenarios based on your energy profile'
          }
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="work" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {Object.entries(LIFE_SCENARIOS).map(([key, scenario]) => {
              const Icon = scenario.icon;
              return (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  className="flex items-center gap-2 text-xs"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {language === 'zh' ? scenario.title : scenario.titleEn}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {Object.entries(LIFE_SCENARIOS).map(([key, scenario]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <div className="text-center p-4 quantum-card">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <scenario.icon className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold heading-enhanced">
                    {t(`energyExplorationPage.lifeScenarios.${key}.title`)}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">{t(`energyExplorationPage.lifeScenarios.${key}.description`)}</p>
              </div>

              <div className="grid gap-4">
                {scenario.scenarios.map((item, index) => {
                  const personalizedCrystals = getPersonalizedCrystalRecommendation(item.crystals);
                  const personalizedGuidance = getPersonalizedGuidance(item.situation, item.guidance);
                  
                  return (
                    <Card key={index} className="border-l-4 border-primary">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                          <span>{item.situation}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.duration}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">推荐水晶：</p>
                            <div className="flex flex-wrap gap-2">
                              {personalizedCrystals.map((crystal, idx) => (
                                <Badge 
                                  key={idx} 
                                  className={`${scenario.color} text-white`}
                                >
                                  {crystal}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">使用方法：</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {personalizedGuidance}
                            </p>
                          </div>

                          {/* 个性化提示 */}
                          {userProfile.recommendedCrystals && personalizedCrystals.some(crystal => 
                            userProfile.recommendedCrystals!.some(rec => rec.name.includes(crystal))
                          ) && (
                            <div className="mt-3 p-3 hierarchy-tertiary rounded-lg border border-border">
                              <p className="text-xs text-foreground">
                                ⭐ 这些水晶特别适合你的能量特质！建议优先使用。
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* 使用贴士 */}
        <div className="mt-6 p-4 hierarchy-secondary rounded-lg">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {language === 'zh' ? '使用贴士' : 'Usage Tips'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>首次使用前请进行水晶净化和充能</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>根据个人感受调整佩戴时间和位置</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>定期清洁和重新充能以保持效果</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-primary font-semibold">•</span>
              <span>相信直觉，选择最有共鸣的水晶</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LifeScenarioGuidance; 