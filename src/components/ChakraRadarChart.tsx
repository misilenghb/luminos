"use client";

import { useState } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronDown, ChevronUp, Lightbulb, Target, AlertTriangle, CheckCircle } from 'lucide-react';

// 脉轮数据类型定义
interface ChakraData {
  chakra: string;
  energy: number;
  color: string;
  description: string;
  element: string;
}

// 脉轮能量雷达图组件属性
interface ChakraRadarChartProps {
  chakraScores: Record<string, number>;
  className?: string;
}

// 脉轮配置信息
const CHAKRA_CONFIG = {
  rootChakra: {
    name: '根轮',
    nameEn: 'Root Chakra',
    color: '#dc2626', // 红色
    element: '土',
    description: '安全感、稳定性、生存本能',
    descriptionEn: 'Security, Stability, Survival Instincts'
  },
  sacralChakra: {
    name: '骶轮', 
    nameEn: 'Sacral Chakra',
    color: '#ea580c', // 橙色
    element: '水',
    description: '创造力、情感、性能量',
    descriptionEn: 'Creativity, Emotions, Sexual Energy'
  },
  solarPlexusChakra: {
    name: '太阳轮',
    nameEn: 'Solar Plexus Chakra', 
    color: '#eab308', // 黄色
    element: '火',
    description: '个人力量、自信、意志力',
    descriptionEn: 'Personal Power, Confidence, Willpower'
  },
  heartChakra: {
    name: '心轮',
    nameEn: 'Heart Chakra',
    color: '#16a34a', // 绿色
    element: '风',
    description: '爱、同情心、联系',
    descriptionEn: 'Love, Compassion, Connection'
  },
  throatChakra: {
    name: '喉轮',
    nameEn: 'Throat Chakra',
    color: '#2563eb', // 蓝色
    element: '以太',
    description: '沟通、表达、真实',
    descriptionEn: 'Communication, Expression, Truth'
  },
  thirdEyeChakra: {
    name: '第三眼轮',
    nameEn: 'Third Eye Chakra',
    color: '#7c3aed', // 紫色
    element: '光',
    description: '直觉、洞察力、智慧',
    descriptionEn: 'Intuition, Insight, Wisdom'
  },
  crownChakra: {
    name: '顶轮',
    nameEn: 'Crown Chakra',
    color: '#a855f7', // 淡紫色
    element: '思想',
    description: '精神连接、觉知、启发',
    descriptionEn: 'Spiritual Connection, Awareness, Enlightenment'
  }
};

const ChakraRadarChart: React.FC<ChakraRadarChartProps> = ({ chakraScores, className = "" }) => {
  const { language } = useLanguage();
  const [showDetails, setShowDetails] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true); // 默认显示分析
  
  // 调试信息
  console.log('🔍 ChakraRadarChart - 接收到的脉轮评分:', chakraScores);
  
  // 确保有有效的脉轮数据，如果没有则使用默认值
  const validChakraScores = chakraScores && Object.keys(chakraScores).length > 0 ? chakraScores : {
    rootChakra: 3,
    sacralChakra: 3,
    solarPlexusChakra: 3,
    heartChakra: 3,
    throatChakra: 3,
    thirdEyeChakra: 3,
    crownChakra: 3
  };

  // 处理脉轮数据
  const chakraData: ChakraData[] = Object.entries(CHAKRA_CONFIG).map(([key, config]) => {
    const score = validChakraScores[key] || 3; // 默认中等评分
    return {
      chakra: language === 'zh' ? config.name : config.nameEn,
      energy: Math.round(score * 20), // 转换为0-100分制 (1-5分制转为0-100)
      color: config.color,
      description: language === 'zh' ? config.description : config.descriptionEn,
      element: config.element
    };
  });

  console.log('🔍 ChakraRadarChart - 处理后的脉轮数据:', chakraData);

  // 深度脉轮分析
  const analyzeChakras = () => {
    const totalEnergy = chakraData.reduce((sum, chakra) => sum + chakra.energy, 0);
    const averageEnergy = totalEnergy / chakraData.length;
    
    // 识别主导脉轮
    const dominantChakra = chakraData.reduce((prev, current) => 
      prev.energy > current.energy ? prev : current
    );
    
    // 识别最弱脉轮
    const weakestChakra = chakraData.reduce((prev, current) => 
      prev.energy < current.energy ? prev : current
    );
    
    // 计算能量平衡度
    const energyVariance = chakraData.reduce((sum, chakra) => 
      sum + Math.pow(chakra.energy - averageEnergy, 2), 0
    ) / chakraData.length;
    const balanceScore = Math.max(0, 100 - Math.sqrt(energyVariance));
    
    // 分析能量模式
    const upperChakras = chakraData.slice(4); // 喉轮、第三眼轮、顶轮
    const lowerChakras = chakraData.slice(0, 3); // 根轮、骶轮、太阳轮
    const heartChakra = chakraData[3]; // 心轮
    
    const upperAverage = upperChakras.reduce((sum, c) => sum + c.energy, 0) / upperChakras.length;
    const lowerAverage = lowerChakras.reduce((sum, c) => sum + c.energy, 0) / lowerChakras.length;
    
    let energyPattern = '';
    if (upperAverage > lowerAverage + 20) {
      energyPattern = language === 'zh' ? '精神导向型' : 'Spiritually Oriented';
    } else if (lowerAverage > upperAverage + 20) {
      energyPattern = language === 'zh' ? '物质导向型' : 'Materially Oriented';
    } else {
      energyPattern = language === 'zh' ? '平衡型' : 'Balanced';
    }
    
    return {
      averageEnergy: Math.round(averageEnergy),
      dominantChakra,
      weakestChakra,
      balanceScore: Math.round(balanceScore),
      energyPattern,
      upperAverage: Math.round(upperAverage),
      lowerAverage: Math.round(lowerAverage),
      heartEnergy: heartChakra.energy
    };
  };

  const analysis = analyzeChakras();

  // 生成个性化建议
  const generateRecommendations = () => {
    const recommendations = [];
    
    if (analysis.balanceScore < 60) {
      recommendations.push({
        type: 'balance',
        title: language === 'zh' ? '🎯 能量平衡建议' : '🎯 Energy Balance Recommendation',
        content: language === 'zh' 
          ? '您的脉轮能量分布不够均衡，建议通过冥想和瑜伽练习来平衡各个脉轮。每日10-15分钟的脉轮冥想可以有效改善能量分布。'
          : 'Your chakra energy distribution is unbalanced. Consider meditation and yoga to balance your chakras. 10-15 minutes of daily chakra meditation can effectively improve energy distribution.',
        icon: Target
      });
    } else {
      recommendations.push({
        type: 'balance',
        title: language === 'zh' ? '✅ 能量分布良好' : '✅ Good Energy Distribution',
        content: language === 'zh' 
          ? '您的脉轮能量分布相对平衡，继续保持当前的精神实践，定期检查和调整。'
          : 'Your chakra energy distribution is relatively balanced. Continue your current spiritual practices and regularly check and adjust.',
        icon: CheckCircle
      });
    }
    
    if (analysis.weakestChakra.energy < 40) {
      recommendations.push({
        type: 'strengthen',
        title: language === 'zh' ? `⚠️ 加强${analysis.weakestChakra.chakra}` : `⚠️ Strengthen ${analysis.weakestChakra.chakra}`,
        content: language === 'zh'
          ? `${analysis.weakestChakra.chakra}能量较弱，建议通过相应的颜色冥想、水晶疗愈或特定瑜伽姿势来加强。可以尝试想象${analysis.weakestChakra.color}的光芒充满这个区域。`
          : `${analysis.weakestChakra.chakra} energy is low. Consider color meditation, crystal healing, or specific yoga poses. Try visualizing ${analysis.weakestChakra.color} light filling this area.`,
        icon: AlertTriangle
      });
    }
    
    if (analysis.dominantChakra.energy > 80) {
      recommendations.push({
        type: 'channel',
        title: language === 'zh' ? `💫 引导${analysis.dominantChakra.chakra}能量` : `💫 Channel ${analysis.dominantChakra.chakra} Energy`,
        content: language === 'zh'
          ? `${analysis.dominantChakra.chakra}能量充沛，可以将这股能量用于创造性活动或帮助他人。这是您的优势能量中心。`
          : `${analysis.dominantChakra.chakra} energy is abundant. Channel this energy into creative activities or helping others. This is your strength energy center.`,
        icon: CheckCircle
      });
    }

    // 根据能量模式添加建议
    if (analysis.energyPattern === (language === 'zh' ? '精神导向型' : 'Spiritually Oriented')) {
      recommendations.push({
        type: 'grounding',
        title: language === 'zh' ? '🌱 接地建议' : '🌱 Grounding Recommendation',
        content: language === 'zh'
          ? '您偏向精神能量，建议加强接地练习，多接触自然，进行身体锻炼来平衡物质世界的连接。'
          : 'You tend toward spiritual energy. Consider strengthening grounding practices, connecting with nature, and physical exercise to balance material world connections.',
        icon: Target
      });
    } else if (analysis.energyPattern === (language === 'zh' ? '物质导向型' : 'Materially Oriented')) {
      recommendations.push({
        type: 'spiritual',
        title: language === 'zh' ? '✨ 精神提升建议' : '✨ Spiritual Enhancement Recommendation',
        content: language === 'zh'
          ? '您偏向物质能量，建议增加冥想、祈祷或其他精神实践来提升上层脉轮的能量。'
          : 'You tend toward material energy. Consider increasing meditation, prayer, or other spiritual practices to enhance upper chakra energy.',
        icon: Lightbulb
      });
    }
    
    return recommendations;
  };

  const recommendations = generateRecommendations();

  // 获取能量等级标签
  const getEnergyLevel = (energy: number) => {
    if (energy >= 80) return { label: language === 'zh' ? '极强' : 'Excellent', color: 'bg-emerald-600', textColor: 'text-white' };
    if (energy >= 60) return { label: language === 'zh' ? '良好' : 'Good', color: 'bg-blue-600', textColor: 'text-white' };
    if (energy >= 40) return { label: language === 'zh' ? '中等' : 'Average', color: 'bg-amber-600', textColor: 'text-white' };
    if (energy >= 20) return { label: language === 'zh' ? '偏弱' : 'Low', color: 'bg-orange-600', textColor: 'text-white' };
    return { label: language === 'zh' ? '需要关注' : 'Needs Attention', color: 'bg-red-600', textColor: 'text-white' };
  };

  // 自定义工具提示
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const level = getEnergyLevel(data.energy);
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border-2 border-gray-200">
          <p className="font-bold text-gray-900 text-lg mb-1">{data.chakra}</p>
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">{data.description}</p>
          <div className="flex items-center gap-3">
            <Badge className={`${level.color} ${level.textColor} px-3 py-1 text-sm font-medium`}>
              {level.label}
            </Badge>
            <span className="text-lg font-bold text-gray-900">{data.energy}/100</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`w-full ${className} shadow-lg`}>
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardTitle className="flex items-center gap-3 text-gray-900">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 shadow-md"></div>
          <span className="text-xl font-bold">{language === 'zh' ? '脉轮能量图谱' : 'Chakra Energy Map'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* 雷达图 */}
        <div className="h-96 w-full mb-8 bg-white rounded-lg p-4 shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chakraData} margin={{ top: 30, right: 50, bottom: 30, left: 50 }}>
              <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
              <PolarAngleAxis 
                dataKey="chakra" 
                tick={{ fontSize: 14, fill: '#1f2937', fontWeight: 600 }}
                className="text-sm font-semibold"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 500 }}
                tickCount={6}
              />
              <Radar
                name={language === 'zh' ? '能量等级' : 'Energy Level'}
                dataKey="energy"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.25}
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 深度脉轮分析 - 始终显示核心指标 */}
        <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl border border-purple-200 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-xl text-gray-900 flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              {language === 'zh' ? '🧘‍♀️ 能量模式分析' : '🧘‍♀️ Energy Pattern Analysis'}
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnalysis(!showAnalysis)}
              className="text-purple-700 hover:text-purple-800 hover:bg-purple-100 font-medium"
            >
              {showAnalysis ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              <span className="ml-2">{language === 'zh' ? '详细分析' : 'Detailed Analysis'}</span>
            </Button>
          </div>
          
          {/* 核心指标 - 始终显示 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center bg-white/80 p-4 rounded-lg shadow-sm border border-purple-100">
              <p className="text-3xl font-bold text-purple-600 mb-1">{analysis.averageEnergy}</p>
              <p className="text-sm font-medium text-gray-700">{language === 'zh' ? '平均能量' : 'Average Energy'}</p>
            </div>
            <div className="text-center bg-white/80 p-4 rounded-lg shadow-sm border border-green-100">
              <p className="text-3xl font-bold text-green-600 mb-1">{analysis.balanceScore}</p>
              <p className="text-sm font-medium text-gray-700">{language === 'zh' ? '平衡度' : 'Balance Score'}</p>
            </div>
            <div className="text-center bg-white/80 p-4 rounded-lg shadow-sm border border-blue-100">
              <p className="text-lg font-bold text-blue-600 mb-1 truncate">{analysis.energyPattern}</p>
              <p className="text-sm font-medium text-gray-700">{language === 'zh' ? '能量类型' : 'Energy Type'}</p>
            </div>
            <div className="text-center bg-white/80 p-4 rounded-lg shadow-sm border border-orange-100">
              <p className="text-lg font-bold text-orange-600 mb-1 truncate">{analysis.dominantChakra.chakra}</p>
              <p className="text-sm font-medium text-gray-700">{language === 'zh' ? '主导脉轮' : 'Dominant Chakra'}</p>
            </div>
          </div>

          <Collapsible open={showAnalysis} onOpenChange={setShowAnalysis}>
            <CollapsibleContent className="space-y-6">
              {/* 详细能量分析 */}
              <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-gray-200">
                <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  📊 {language === 'zh' ? '能量分布详情' : 'Energy Distribution Details'}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{language === 'zh' ? '上层脉轮平均:' : 'Upper Chakras Avg:'}</span>
                      <span className="font-bold text-blue-700 text-lg">{analysis.upperAverage}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{language === 'zh' ? '精神、直觉、沟通' : 'Spiritual, Intuition, Communication'}</p>
                  </div>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{language === 'zh' ? '下层脉轮平均:' : 'Lower Chakras Avg:'}</span>
                      <span className="font-bold text-orange-700 text-lg">{analysis.lowerAverage}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{language === 'zh' ? '安全、创造、力量' : 'Security, Creativity, Power'}</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{language === 'zh' ? '心轮能量:' : 'Heart Energy:'}</span>
                      <span className="font-bold text-green-700 text-lg">{analysis.heartEnergy}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{language === 'zh' ? '爱与连接中心' : 'Center of Love & Connection'}</p>
                  </div>
                </div>
              </div>

              {/* 个性化建议 */}
              {recommendations.length > 0 && (
                <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-gray-200">
                  <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                    💡 {language === 'zh' ? '个性化建议' : 'Personalized Recommendations'}
                  </h5>
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => {
                      const Icon = rec.icon;
                      return (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                          <Icon className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h6 className="font-bold text-gray-900 text-base mb-2">{rec.title}</h6>
                            <p className="text-sm text-gray-700 leading-relaxed">{rec.content}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* 可折叠的脉轮详细信息 */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full mb-6 h-12 text-base font-medium border-2 hover:bg-gray-50">
              {showDetails ? <ChevronUp className="w-5 h-5 mr-3" /> : <ChevronDown className="w-5 h-5 mr-3" />}
              {language === 'zh' ? '查看每个脉轮的详细信息' : 'View Detailed Information for Each Chakra'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {chakraData.map((chakra, index) => {
                const level = getEnergyLevel(chakra.energy);
                return (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                    <div 
                      className="w-6 h-6 rounded-full flex-shrink-0 shadow-md"
                      style={{ backgroundColor: chakra.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-base text-gray-900 truncate">
                          {chakra.chakra}
                        </p>
                        <Badge className={`${level.color} ${level.textColor} text-sm font-medium px-2 py-1`}>
                          {chakra.energy}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {chakra.description}
                      </p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          {level.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default ChakraRadarChart; 