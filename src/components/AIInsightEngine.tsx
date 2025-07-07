'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  Target,
  Zap,
  Heart,
  Shield,
  Sparkles,
  Clock,
  BarChart3,
  CheckCircle,
  XCircle,
  Info,
  Star,
  Flame,
  Droplets,
  Wind,
  Mountain
} from 'lucide-react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

interface ExtendedProfile extends UserProfileDataOutput {
  energyPattern?: string;
  dominantChakra?: string;
  personalityTraits?: string[];
  preferredActivities?: string[];
  chakraAssessment?: {
    root: number;
    sacral: number;
    solarPlexus: number;
    heart: number;
    throat: number;
    thirdEye: number;
    crown: number;
  };
}

interface AIInsight {
  id: string;
  type: 'energy' | 'personality' | 'wellness' | 'productivity' | 'relationships' | 'growth';
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-100
  title: string;
  description: string;
  recommendations: string[];
  timeframe: 'immediate' | 'short_term' | 'long_term';
  category: 'positive' | 'warning' | 'neutral' | 'opportunity';
  relatedFactors: string[];
  actionable: boolean;
}

interface EnergyPrediction {
  date: string;
  predictedLevel: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

interface PersonalityAnalysis {
  strengths: string[];
  challenges: string[];
  growthAreas: string[];
  compatibleTypes: string[];
  workStyle: string;
  communicationStyle: string;
}

interface WellnessRecommendation {
  category: 'physical' | 'mental' | 'emotional' | 'spiritual';
  priority: number;
  title: string;
  description: string;
  frequency: string;
  duration: string;
  benefits: string[];
}

interface AIInsightEngineProps {
  profile?: ExtendedProfile;
  currentEnergy?: number;
  recentActivities?: string[];
  stressLevel?: number;
  sleepQuality?: number;
  className?: string;
}

const AIInsightEngine: React.FC<AIInsightEngineProps> = ({
  profile,
  currentEnergy = 3,
  recentActivities = [],
  stressLevel = 2,
  sleepQuality = 3,
  className
}) => {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'overview' | 'detailed' | 'predictions'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  // 生成AI洞察
  const insights = useMemo((): AIInsight[] => {
    const results: AIInsight[] = [];

    // 能量模式分析
    if (profile?.energyPattern === 'morning_peak') {
      results.push({
        id: 'energy-pattern-1',
        type: 'energy',
        priority: 'high',
        confidence: 85,
        title: '晨型人优势发挥',
        description: '你是典型的晨型人，上午9-11点是你的黄金时间',
        recommendations: [
          '将最重要的决策安排在上午',
          '避免在下午安排创意工作',
          '利用早晨时间进行深度思考'
        ],
        timeframe: 'immediate',
        category: 'positive',
        relatedFactors: ['能量模式', '生物钟', '工作效率'],
        actionable: true
      });
    }

    // MBTI相关洞察
    if (profile?.mbtiLikeType?.includes('I')) {
      results.push({
        id: 'personality-1',
        type: 'personality',
        priority: 'medium',
        confidence: 78,
        title: '内向者能量管理',
        description: '作为内向者，你需要更多独处时间来恢复能量',
        recommendations: [
          '每天安排30-60分钟独处时间',
          '限制连续社交活动的数量',
          '选择小群体而非大型聚会'
        ],
        timeframe: 'short_term',
        category: 'neutral',
        relatedFactors: ['性格类型', '社交能量', '恢复方式'],
        actionable: true
      });
    }

    if (profile?.mbtiLikeType?.includes('N')) {
      results.push({
        id: 'personality-2',
        type: 'productivity',
        priority: 'medium',
        confidence: 82,
        title: '直觉型思维优势',
        description: '你擅长看到大局和未来可能性，但可能忽略细节',
        recommendations: [
          '使用思维导图整理想法',
          '设置提醒关注重要细节',
          '与感知型伙伴合作互补'
        ],
        timeframe: 'long_term',
        category: 'opportunity',
        relatedFactors: ['思维方式', '工作风格', '团队合作'],
        actionable: true
      });
    }

    // 能量水平分析
    if (currentEnergy <= 2) {
      results.push({
        id: 'energy-warning-1',
        type: 'wellness',
        priority: 'high',
        confidence: 90,
        title: '能量水平偏低警告',
        description: '当前能量水平较低，可能影响决策质量和工作效率',
        recommendations: [
          '优先安排休息和恢复活动',
          '推迟重要决策到能量恢复后',
          '检查睡眠质量和营养状况'
        ],
        timeframe: 'immediate',
        category: 'warning',
        relatedFactors: ['当前状态', '健康状况', '工作负荷'],
        actionable: true
      });
    }

    // 压力水平分析
    if (stressLevel >= 4) {
      results.push({
        id: 'stress-warning-1',
        type: 'wellness',
        priority: 'high',
        confidence: 88,
        title: '压力水平过高',
        description: '持续的高压力可能导致倦怠和健康问题',
        recommendations: [
          '练习深呼吸或冥想技巧',
          '重新评估当前的工作负荷',
          '寻求支持或专业帮助'
        ],
        timeframe: 'immediate',
        category: 'warning',
        relatedFactors: ['压力管理', '心理健康', '工作平衡'],
        actionable: true
      });
    }

    // 脉轮分析
    if (profile?.chakraAssessment) {
      const chakras = profile.chakraAssessment;
      const heartChakra = chakras.heart || 3;

      if (heartChakra >= 4) {
        results.push({
          id: 'chakra-heart-1',
          type: 'relationships',
          priority: 'medium',
          confidence: 75,
          title: '心轮能量强盛',
          description: '你的心轮能量很强，具有强烈的同理心和爱的能力',
          recommendations: [
            '考虑从事帮助他人的工作',
            '培养深度的人际关系',
            '注意避免过度付出导致的能量耗竭'
          ],
          timeframe: 'long_term',
          category: 'positive',
          relatedFactors: ['情感能力', '人际关系', '职业发展'],
          actionable: true
        });
      }
    }

    // 元素分析
    if (profile?.inferredElement) {
      const elementInsights = {
        fire: {
          title: '火元素特质分析',
          description: '你具有火元素的热情和行动力',
          recommendations: ['保持激情但避免冲动', '学会耐心等待时机', '平衡行动与思考']
        },
        water: {
          title: '水元素特质分析',
          description: '你具有水元素的直觉和适应性',
          recommendations: ['信任你的直觉', '保持情感的流动性', '避免过度情绪化']
        },
        earth: {
          title: '土元素特质分析',
          description: '你具有土元素的稳定和实用性',
          recommendations: ['发挥你的组织能力', '保持脚踏实地', '适度接受变化']
        },
        air: {
          title: '风元素特质分析',
          description: '你具有风元素的思维敏捷和沟通能力',
          recommendations: ['发挥你的沟通优势', '保持思维的灵活性', '注意落地执行']
        }
      };

      const elementKey = profile.inferredElement.toLowerCase() as keyof typeof elementInsights;
      const elementData = elementInsights[elementKey];

      if (elementData) {
        results.push({
          id: `element-${elementKey}`,
          type: 'personality',
          priority: 'medium',
          confidence: 70,
          title: elementData.title,
          description: elementData.description,
          recommendations: elementData.recommendations,
          timeframe: 'long_term',
          category: 'neutral',
          relatedFactors: ['元素特质', '个性发展', '生活方式'],
          actionable: true
        });
      }
    }

    return results.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [profile, currentEnergy, stressLevel]);

  // 生成能量预测
  const energyPredictions = useMemo((): EnergyPrediction[] => {
    const predictions: EnergyPrediction[] = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);

      let predictedLevel = currentEnergy;
      const factors: string[] = [];
      const recommendations: string[] = [];

      // 基于星期几调整
      const dayOfWeek = futureDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) { // 周末
        if (profile?.mbtiLikeType?.includes('I')) {
          predictedLevel += 0.5;
          factors.push('周末恢复时间');
          recommendations.push('利用周末进行深度恢复');
        } else {
          predictedLevel += 0.2;
          factors.push('周末社交机会');
          recommendations.push('平衡社交与休息');
        }
      } else { // 工作日
        predictedLevel -= 0.3;
        factors.push('工作日压力');
        recommendations.push('注意工作节奏管理');
      }

      // 基于能量模式调整
      if (profile?.energyPattern === 'morning_peak') {
        factors.push('晨型人模式');
        recommendations.push('安排重要任务在上午');
      }

      // 基于当前压力水平
      if (stressLevel >= 3) {
        predictedLevel -= 0.4;
        factors.push('当前压力水平');
        recommendations.push('实施压力管理策略');
      }

      predictions.push({
        date: futureDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        predictedLevel: Math.min(5, Math.max(1, predictedLevel)),
        confidence: 65 + Math.random() * 25,
        factors,
        recommendations: recommendations.slice(0, 2)
      });
    }

    return predictions;
  }, [profile, currentEnergy, stressLevel]);

  // 生成个性分析
  const personalityAnalysis = useMemo((): PersonalityAnalysis => {
    const analysis: PersonalityAnalysis = {
      strengths: [],
      challenges: [],
      growthAreas: [],
      compatibleTypes: [],
      workStyle: '',
      communicationStyle: ''
    };

    if (profile?.mbtiLikeType) {
      const type = profile.mbtiLikeType;

      // 基于MBTI分析优势
      if (type.includes('I')) {
        analysis.strengths.push('深度思考能力', '独立工作能力', '专注力强');
        analysis.challenges.push('大型社交场合', '快速决策压力');
        analysis.communicationStyle = '偏好一对一深度交流';
      } else {
        analysis.strengths.push('社交能力强', '团队协作', '快速适应');
        analysis.challenges.push('长时间独处', '深度专注');
        analysis.communicationStyle = '偏好群体讨论和头脑风暴';
      }

      if (type.includes('N')) {
        analysis.strengths.push('创新思维', '大局观', '未来导向');
        analysis.challenges.push('细节关注', '例行工作');
        analysis.workStyle = '偏好创新和变化的工作';
      } else {
        analysis.strengths.push('实用主义', '细节导向', '执行力强');
        analysis.challenges.push('抽象概念', '频繁变化');
        analysis.workStyle = '偏好稳定和具体的工作';
      }

      if (type.includes('T')) {
        analysis.strengths.push('逻辑分析', '客观决策', '批判思维');
        analysis.challenges.push('情感表达', '人际敏感度');
      } else {
        analysis.strengths.push('情感智慧', '人际和谐', '价值导向');
        analysis.challenges.push('客观分析', '困难决策');
      }

      if (type.includes('J')) {
        analysis.strengths.push('计划性强', '组织能力', '目标导向');
        analysis.challenges.push('灵活应变', '开放性');
      } else {
        analysis.strengths.push('适应性强', '开放心态', '灵活性');
        analysis.challenges.push('时间管理', '决策拖延');
      }

      // 成长领域
      analysis.growthAreas = analysis.challenges.map(challenge => `改善${challenge}`);
    }

    return analysis;
  }, [profile]);

  // 刷新分析
  const refreshAnalysis = async () => {
    setRefreshing(true);
    // 模拟AI分析延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'energy': return <Zap className="h-4 w-4" />;
      case 'personality': return <Brain className="h-4 w-4" />;
      case 'wellness': return <Heart className="h-4 w-4" />;
      case 'productivity': return <Target className="h-4 w-4" />;
      case 'relationships': return <Heart className="h-4 w-4" />;
      case 'growth': return <TrendingUp className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getInsightColor = (category: string) => {
    switch (category) {
      case 'positive': return 'border-green-200 bg-green-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'opportunity': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getElementIcon = (element: string) => {
    switch (element.toLowerCase()) {
      case 'fire': return <Flame className="h-4 w-4 text-red-500" />;
      case 'water': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'air': return <Wind className="h-4 w-4 text-gray-500" />;
      case 'earth': return <Mountain className="h-4 w-4 text-green-500" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Brain className="mr-2 h-5 w-5 text-primary" />
            AI洞察分析
          </span>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {insights.length} 个洞察
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAnalysis}
              disabled={refreshing}
            >
              {refreshing ? '分析中...' : '刷新分析'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={analysisMode} onValueChange={(value) => setAnalysisMode(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="detailed">详细分析</TabsTrigger>
            <TabsTrigger value="predictions">预测</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* 关键洞察 */}
            <div className="grid gap-3">
              {insights.slice(0, 3).map((insight) => (
                <Card
                  key={insight.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${getInsightColor(insight.category)} ${
                    selectedInsight?.id === insight.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedInsight(selectedInsight?.id === insight.id ? null : insight)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getInsightIcon(insight.type)}
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority === 'high' ? '高' : insight.priority === 'medium' ? '中' : '低'}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">置信度:</span>
                          <Progress value={insight.confidence} className="w-12" />
                          <span className="text-xs">{insight.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

                    {selectedInsight?.id === insight.id && (
                      <div className="space-y-3 border-t pt-3">
                        <div>
                          <h5 className="font-medium text-sm mb-2">建议行动:</h5>
                          <ul className="space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm flex items-center">
                                <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>时间框架: {
                            insight.timeframe === 'immediate' ? '立即' :
                            insight.timeframe === 'short_term' ? '短期' : '长期'
                          }</span>
                          <span>相关因素: {insight.relatedFactors.join(', ')}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 快速统计 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {insights.filter(i => i.category === 'positive').length}
                  </div>
                  <div className="text-xs text-muted-foreground">积极洞察</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {insights.filter(i => i.category === 'warning').length}
                  </div>
                  <div className="text-xs text-muted-foreground">注意事项</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {insights.filter(i => i.category === 'opportunity').length}
                  </div>
                  <div className="text-xs text-muted-foreground">成长机会</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)}%
                  </div>
                  <div className="text-xs text-muted-foreground">平均置信度</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            {/* 个性分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Brain className="mr-2 h-5 w-5" />
                  个性深度分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-700">优势特质</h4>
                    <div className="space-y-1">
                      {personalityAnalysis.strengths.map((strength, index) => (
                        <Badge key={index} variant="secondary" className="mr-1 mb-1">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-yellow-700">挑战领域</h4>
                    <div className="space-y-1">
                      {personalityAnalysis.challenges.map((challenge, index) => (
                        <Badge key={index} variant="outline" className="mr-1 mb-1">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">工作风格</h4>
                    <p className="text-sm text-muted-foreground">{personalityAnalysis.workStyle}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">沟通风格</h4>
                    <p className="text-sm text-muted-foreground">{personalityAnalysis.communicationStyle}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-blue-700">成长建议</h4>
                  <div className="grid gap-2">
                    {personalityAnalysis.growthAreas.map((area, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <TrendingUp className="mr-2 h-3 w-3 text-blue-500" />
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 元素分析 */}
            {profile?.inferredElement && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    {getElementIcon(profile.inferredElement)}
                    <span className="ml-2">元素特质分析</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-center">
                      {getElementIcon(profile.inferredElement)}
                      <div className="text-sm font-medium mt-1 capitalize">{profile.inferredElement}</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        {profile.inferredElement === 'fire' && '火元素代表热情、行动力和领导力。你天生具有推动事物前进的能力。'}
                        {profile.inferredElement === 'water' && '水元素代表直觉、情感和适应性。你具有深刻的洞察力和情感智慧。'}
                        {profile.inferredElement === 'earth' && '土元素代表稳定、实用和可靠。你是团队中的稳定力量。'}
                        {profile.inferredElement === 'air' && '风元素代表思维、沟通和创新。你具有敏锐的思维和表达能力。'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 所有洞察详情 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">完整洞察列表</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((insight) => (
                    <div key={insight.id} className={`p-3 rounded-lg border ${getInsightColor(insight.category)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getInsightIcon(insight.type)}
                          <h5 className="font-medium">{insight.title}</h5>
                        </div>
                        <Badge className={getPriorityColor(insight.priority)}>
                          {insight.priority === 'high' ? '高优先级' : insight.priority === 'medium' ? '中优先级' : '低优先级'}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>

                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium">建议行动:</span>
                          <ul className="mt-1 space-y-1">
                            {insight.recommendations.map((rec, index) => (
                              <li key={index} className="text-xs flex items-center">
                                <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>置信度: {insight.confidence}%</span>
                          <span>时间框架: {
                            insight.timeframe === 'immediate' ? '立即执行' :
                            insight.timeframe === 'short_term' ? '短期规划' : '长期发展'
                          }</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            {/* 能量预测 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  7天能量预测
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {energyPredictions.map((prediction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">{prediction.date}</div>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          prediction.predictedLevel >= 4 ? 'bg-green-100 text-green-800' :
                          prediction.predictedLevel >= 3 ? 'bg-blue-100 text-blue-800' :
                          prediction.predictedLevel >= 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {prediction.predictedLevel.toFixed(1)}/5
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-muted-foreground">
                          置信度: {prediction.confidence.toFixed(0)}%
                        </div>
                        <Progress value={prediction.confidence} className="w-16" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800">预测说明</h4>
                  <p className="text-sm text-blue-700">
                    基于你的个性特征、能量模式和当前状态，AI预测了未来7天的能量变化趋势。
                    这些预测可以帮助你更好地安排日程和活动。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 趋势分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">趋势分析</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">能量模式识别</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">晨型人特征</span>
                        <Progress value={profile?.energyPattern === 'morning_peak' ? 85 : 30} className="w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">夜型人特征</span>
                        <Progress value={profile?.energyPattern === 'evening_peak' ? 85 : 20} className="w-20" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">稳定型特征</span>
                        <Progress value={profile?.energyPattern === 'consistent' ? 85 : 45} className="w-20" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">风险因素</h4>
                    <div className="space-y-2">
                      {stressLevel >= 3 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            当前压力水平较高，建议关注压力管理
                          </AlertDescription>
                        </Alert>
                      )}
                      {currentEnergy <= 2 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            能量水平偏低，需要优先恢复
                          </AlertDescription>
                        </Alert>
                      )}
                      {sleepQuality <= 2 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            睡眠质量需要改善
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIInsightEngine;