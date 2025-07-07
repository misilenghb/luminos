'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Gem, 
  Heart, 
  Brain, 
  Zap, 
  Shield, 
  Eye, 
  Crown,
  Mountain,
  Droplets,
  Sun,
  Star,
  Sparkles,
  Target,
  Clock,
  BookOpen,
  CheckCircle
} from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

interface Crystal {
  name: string;
  englishName: string;
  color: string;
  chakra: string;
  properties: string[];
  energyType: 'calming' | 'energizing' | 'balancing' | 'protective' | 'healing';
  description: string;
  usageMethods: string[];
  benefits: string[];
  compatibility: number; // 与用户的匹配度 0-100
}

interface DailyRecommendation {
  primary: Crystal;
  secondary: Crystal[];
  reason: string;
  goals: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'all_day';
  duration: string;
}

interface ExtendedProfile extends UserProfileDataOutput {
  dominantChakra?: string;
  energyPattern?: string;
}

interface DailyCrystalRecommendationProps {
  profile?: ExtendedProfile;
  currentEnergy?: number;
  currentMood?: string;
  dailyGoals?: string[];
  className?: string;
}

const DailyCrystalRecommendation: React.FC<DailyCrystalRecommendationProps> = ({
  profile,
  currentEnergy = 3,
  currentMood = '平静',
  dailyGoals = ['提高专注力', '减少压力'],
  className
}) => {
  const [selectedCrystal, setSelectedCrystal] = useState<Crystal | null>(null);
  const [viewMode, setViewMode] = useState<'recommendation' | 'library'>('recommendation');

  // 水晶数据库
  const crystalDatabase: Crystal[] = useMemo(() => [
    {
      name: '紫水晶',
      englishName: 'Amethyst',
      color: '#9966CC',
      chakra: 'crown',
      properties: ['平静', '智慧', '直觉', '保护'],
      energyType: 'calming',
      description: '紫水晶是最受欢迎的水晶之一，以其平静和保护的能量而闻名。',
      usageMethods: ['冥想时握在手中', '放在枕头下', '佩戴为首饰', '放在工作桌上'],
      benefits: ['减少压力和焦虑', '提高睡眠质量', '增强直觉力', '促进精神成长'],
      compatibility: 85
    },
    {
      name: '白水晶',
      englishName: 'Clear Quartz',
      color: '#FFFFFF',
      chakra: 'crown',
      properties: ['净化', '放大', '平衡', '治愈'],
      energyType: 'balancing',
      description: '白水晶被称为"万能水晶"，能够放大其他水晶的能量。',
      usageMethods: ['与其他水晶组合使用', '制作水晶水', '放在房间中央', '握在手中冥想'],
      benefits: ['净化负能量', '增强专注力', '平衡所有脉轮', '提升整体能量'],
      compatibility: 90
    },
    {
      name: '粉水晶',
      englishName: 'Rose Quartz',
      color: '#FFB6C1',
      chakra: 'heart',
      properties: ['爱', '治愈', '同情', '和谐'],
      energyType: 'healing',
      description: '粉水晶是爱的石头，促进自爱和对他人的爱。',
      usageMethods: ['佩戴在心脏附近', '放在卧室', '制作爱的仪式', '与伴侣分享'],
      benefits: ['增强自爱', '改善人际关系', '治愈情感创伤', '带来内心平静'],
      compatibility: 75
    },
    {
      name: '黄水晶',
      englishName: 'Citrine',
      color: '#FFD700',
      chakra: 'solarPlexus',
      properties: ['丰盛', '自信', '创造力', '成功'],
      energyType: 'energizing',
      description: '黄水晶被称为"商人之石"，带来财富和成功的能量。',
      usageMethods: ['放在钱包中', '佩戴为首饰', '放在办公桌上', '握在手中设定意图'],
      benefits: ['增强自信心', '吸引财富', '提升创造力', '促进成功'],
      compatibility: 70
    },
    {
      name: '黑曜石',
      englishName: 'Black Obsidian',
      color: '#000000',
      chakra: 'root',
      properties: ['保护', '接地', '净化', '真相'],
      energyType: 'protective',
      description: '黑曜石是强大的保护石，能够吸收负能量。',
      usageMethods: ['佩戴为护身符', '放在入口处', '冥想时握在手中', '制作保护仪式'],
      benefits: ['强力保护', '接地稳定', '揭示真相', '净化负能量'],
      compatibility: 65
    },
    {
      name: '绿幽灵',
      englishName: 'Green Phantom Quartz',
      color: '#90EE90',
      chakra: 'heart',
      properties: ['财富', '事业', '成长', '治愈'],
      energyType: 'balancing',
      description: '绿幽灵被称为"事业水晶"，促进事业和财富的增长。',
      usageMethods: ['放在办公室', '冥想时观想目标', '制作财富网格', '佩戴为首饰'],
      benefits: ['促进事业发展', '吸引财富', '增强决策力', '带来机遇'],
      compatibility: 80
    }
  ], []);

  // 基于用户档案和当前状态生成推荐
  const dailyRecommendation = useMemo((): DailyRecommendation => {
    let primaryCrystal: Crystal;
    let secondaryCrystals: Crystal[] = [];
    let reason = '';
    let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'all_day' = 'all_day';

    // 基于能量水平选择主要水晶
    if (currentEnergy <= 2) {
      primaryCrystal = crystalDatabase.find(c => c.name === '黄水晶') || crystalDatabase[0];
      reason = '你的能量较低，黄水晶能帮助提升活力和自信心';
      timeOfDay = 'morning';
    } else if (currentEnergy >= 4) {
      primaryCrystal = crystalDatabase.find(c => c.name === '紫水晶') || crystalDatabase[0];
      reason = '你的能量很高，紫水晶能帮助保持平静和专注';
      timeOfDay = 'evening';
    } else {
      primaryCrystal = crystalDatabase.find(c => c.name === '白水晶') || crystalDatabase[0];
      reason = '白水晶能帮助平衡你的整体能量状态';
      timeOfDay = 'all_day';
    }

    // 基于MBTI类型添加辅助水晶
    if (profile?.mbtiLikeType?.includes('I')) {
      const amethyst = crystalDatabase.find(c => c.name === '紫水晶');
      if (amethyst && amethyst !== primaryCrystal) {
        secondaryCrystals.push(amethyst);
      }
    }

    // 基于主导脉轮添加水晶
    if (profile?.dominantChakra === 'heart') {
      const roseQuartz = crystalDatabase.find(c => c.name === '粉水晶');
      if (roseQuartz && roseQuartz !== primaryCrystal) {
        secondaryCrystals.push(roseQuartz);
      }
    }

    // 基于当前心情调整
    if (currentMood === '焦虑' || currentMood === '压力') {
      const amethyst = crystalDatabase.find(c => c.name === '紫水晶');
      if (amethyst && !secondaryCrystals.includes(amethyst) && amethyst !== primaryCrystal) {
        secondaryCrystals.push(amethyst);
      }
    }

    // 确保至少有一个辅助水晶
    if (secondaryCrystals.length === 0) {
      const backup = crystalDatabase.find(c => c !== primaryCrystal);
      if (backup) secondaryCrystals.push(backup);
    }

    return {
      primary: primaryCrystal,
      secondary: secondaryCrystals.slice(0, 2),
      reason,
      goals: dailyGoals,
      timeOfDay,
      duration: timeOfDay === 'all_day' ? '全天' : timeOfDay === 'morning' ? '上午' : timeOfDay === 'evening' ? '晚上' : '下午'
    };
  }, [crystalDatabase, currentEnergy, currentMood, profile, dailyGoals]);

  const getChakraIcon = (chakra: string) => {
    switch (chakra) {
      case 'root': return <Mountain className="h-4 w-4" />;
      case 'sacral': return <Droplets className="h-4 w-4" />;
      case 'solarPlexus': return <Sun className="h-4 w-4" />;
      case 'heart': return <Heart className="h-4 w-4" />;
      case 'throat': return <Sparkles className="h-4 w-4" />;
      case 'thirdEye': return <Eye className="h-4 w-4" />;
      case 'crown': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getEnergyTypeColor = (type: string) => {
    switch (type) {
      case 'calming': return 'bg-blue-100 text-blue-800';
      case 'energizing': return 'bg-yellow-100 text-yellow-800';
      case 'balancing': return 'bg-green-100 text-green-800';
      case 'protective': return 'bg-purple-100 text-purple-800';
      case 'healing': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CrystalCard: React.FC<{ crystal: Crystal; isPrimary?: boolean }> = ({ crystal, isPrimary = false }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isPrimary ? 'ring-2 ring-primary' : ''
      } ${selectedCrystal === crystal ? 'bg-primary/5' : ''}`}
      onClick={() => setSelectedCrystal(selectedCrystal === crystal ? null : crystal)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium flex items-center">
              <div 
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: crystal.color }}
              />
              {crystal.name}
              {isPrimary && <Badge className="ml-2">主推荐</Badge>}
            </h4>
            <p className="text-sm text-muted-foreground">{crystal.englishName}</p>
          </div>
          <div className="flex items-center space-x-1">
            {getChakraIcon(crystal.chakra)}
            <Badge className={getEnergyTypeColor(crystal.energyType)}>
              {crystal.energyType}
            </Badge>
          </div>
        </div>
        
        <p className="text-sm mb-3">{crystal.description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {crystal.properties.slice(0, 3).map((prop, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {prop}
              </Badge>
            ))}
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">匹配度:</span>
            <Progress value={crystal.compatibility} className="w-12" />
            <span className="text-xs">{crystal.compatibility}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Gem className="mr-2 h-5 w-5 text-primary" />
            每日水晶推荐
          </span>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'recommendation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('recommendation')}
            >
              今日推荐
            </Button>
            <Button
              variant={viewMode === 'library' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('library')}
            >
              水晶库
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="w-full">
          <TabsContent value="recommendation" className="space-y-4">
            {/* 推荐原因 */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center mb-2">
                  <Target className="mr-2 h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">推荐理由</span>
                </div>
                <p className="text-sm text-purple-700 mb-3">{dailyRecommendation.reason}</p>
                <div className="flex items-center space-x-4 text-xs text-purple-600">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    建议时间: {dailyRecommendation.duration}
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    目标: {dailyRecommendation.goals.join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 主要推荐 */}
            <div>
              <h4 className="font-medium mb-3">主要推荐</h4>
              <CrystalCard crystal={dailyRecommendation.primary} isPrimary={true} />
            </div>

            {/* 辅助推荐 */}
            {dailyRecommendation.secondary.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">辅助推荐</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dailyRecommendation.secondary.map((crystal, index) => (
                    <CrystalCard key={index} crystal={crystal} />
                  ))}
                </div>
              </div>
            )}

            {/* 使用指南 */}
            {selectedCrystal && (
              <Card className="border-primary/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="mr-2 h-4 w-4" />
                    {selectedCrystal.name} 使用指南
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">使用方法</h5>
                    <ul className="space-y-1">
                      {selectedCrystal.usageMethods.map((method, index) => (
                        <li key={index} className="text-sm flex items-center">
                          <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                          {method}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">预期效果</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedCrystal.benefits.map((benefit, index) => (
                        <Badge key={index} variant="secondary" className="justify-start">
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crystalDatabase.map((crystal, index) => (
                <CrystalCard key={index} crystal={crystal} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DailyCrystalRecommendation;
