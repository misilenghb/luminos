"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, Target, TrendingUp, CheckCircle, 
  AlertTriangle, Info, Zap 
} from 'lucide-react';
import EnhancedQuestionnaire from '@/components/EnhancedQuestionnaire';
import FiveDimensionalEnergyChart from '@/components/FiveDimensionalEnergyChart';

// Mock profile data for demonstration
const mockProfileData = {
  name: "张三",
  coreEnergyInsights: "您展现出独特的能量特质，根据增强版评估分析，您拥有强大的适应能力和深刻的自我觉察。",
  inferredZodiac: "白羊座",
  inferredChineseZodiac: "龙",
  inferredElement: "火",
  inferredPlanet: "火星",
  mbtiLikeType: "ENFP - 充满热情的激励者，善于激发他人潜能，追求个人成长和意义",
  chakraAnalysis: "您的脉轮能量分布相对均衡，心轮和脐轮表现尤为活跃，显示出强烈的创造力和情感表达能力。建议适度加强根轮和顶轮的平衡练习。"
};

const mockChakraScores = {
  rootChakraFocus: 3.5,
  sacralChakraFocus: 4.2,
  solarPlexusChakraFocus: 3.8,
  heartChakraFocus: 4.5,
  throatChakraFocus: 3.9,
  thirdEyeChakraFocus: 4.1,
  crownChakraFocus: 3.7
};

export default function EnhancedAssessmentPage() {
  const [step, setStep] = useState<'intro' | 'questionnaire' | 'results'>('intro');
  const [assessmentData, setAssessmentData] = useState<any>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleAssessmentComplete = (data: any) => {
    setAssessmentData(data);
    setStep('results');
  };

  const renderIntroduction = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-8 w-8 text-purple-600" />
            增强版能量评估系统
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              Beta版本
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            基于您的反馈，我们开发了这个增强版能量评估系统，新增了<strong>5个关键维度</strong>的深度分析，
            让您的能量画像更加完整和精确。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-purple-700">🆕 新增维度：</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-600" />
                  <span>💪 身体体质评估</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span>⏰ 生活节律分析</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>👥 社交关系能量</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-yellow-600" />
                  <span>💰 财务能量评估</span>
                </li>
                <li className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-600" />
                  <span>🧠 情绪智能测试</span>
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-lg text-purple-700">🔧 核心改进：</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>修复了数据关联问题</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>新增生命数字学计算</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>增强了计算维度覆盖</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>提供更精确的建议</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>完善的理论依据</span>
                </li>
              </ul>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>评估时间：</strong>约15-20分钟 | 
              <strong>问题数量：</strong>5个模块，共约50个问题 |
              <strong>结果深度：</strong>八维能量分析
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={() => setStep('questionnaire')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 flex-1"
            >
              <Zap className="h-4 w-4 mr-2" />
              开始增强版评估
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowComparison(true)}
              className="flex-1"
            >
              查看功能对比
            </Button>
          </div>
        </CardContent>
      </Card>

      {showComparison && (
        <Card>
          <CardHeader>
            <CardTitle>功能对比：标准版 vs 增强版</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left">评估维度</th>
                    <th className="border border-gray-300 p-3 text-center">标准版</th>
                    <th className="border border-gray-300 p-3 text-center">增强版</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 p-3">🧠 MBTI人格类型</td>
                    <td className="border border-gray-300 p-3 text-center">✅</td>
                    <td className="border border-gray-300 p-3 text-center">✅ 增强</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">⭐ 星座能量分析</td>
                    <td className="border border-gray-300 p-3 text-center">✅</td>
                    <td className="border border-gray-300 p-3 text-center">✅ 增强</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">🌈 脉轮平衡评估</td>
                    <td className="border border-gray-300 p-3 text-center">✅</td>
                    <td className="border border-gray-300 p-3 text-center">✅ 增强</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">🔥 五行元素强度</td>
                    <td className="border border-gray-300 p-3 text-center">✅</td>
                    <td className="border border-gray-300 p-3 text-center">✅ 增强</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 p-3">🪐 行星影响力</td>
                    <td className="border border-gray-300 p-3 text-center">✅</td>
                    <td className="border border-gray-300 p-3 text-center">✅ 增强</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 p-3">🔢 生命数字学</td>
                    <td className="border border-gray-300 p-3 text-center">❌</td>
                    <td className="border border-gray-300 p-3 text-center">🆕 新增</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 p-3">💪 身体能量评估</td>
                    <td className="border border-gray-300 p-3 text-center">❌</td>
                    <td className="border border-gray-300 p-3 text-center">🆕 新增</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 p-3">👥 社交能量分析</td>
                    <td className="border border-gray-300 p-3 text-center">❌</td>
                    <td className="border border-gray-300 p-3 text-center">🆕 新增</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 p-3">💰 财务能量评估</td>
                    <td className="border border-gray-300 p-3 text-center">❌</td>
                    <td className="border border-gray-300 p-3 text-center">🆕 新增</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 p-3">🧠 情绪智能测试</td>
                    <td className="border border-gray-300 p-3 text-center">❌</td>
                    <td className="border border-gray-300 p-3 text-center">🆕 新增</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 p-3">⏰ 生活节律分析</td>
                    <td className="border border-gray-300 p-3 text-center">❌</td>
                    <td className="border border-gray-300 p-3 text-center">🆕 新增</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowComparison(false)}
              className="mt-4"
            >
              收起对比
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderQuestionnaire = () => (
    <div className="max-w-6xl mx-auto">
      <EnhancedQuestionnaire onComplete={handleAssessmentComplete} />
    </div>
  );

  const renderResults = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6 text-green-600" />
            增强版能量评估结果
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              评估完成
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              恭喜！您已完成增强版能量评估。以下是基于新增维度的分析结果：
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-green-700">新增维度覆盖</h4>
              <p className="text-2xl font-bold text-green-600">8维度</p>
              <p className="text-sm text-gray-600">相比标准版增加3个维度</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-blue-700">数据关联度</h4>
              <p className="text-2xl font-bold text-blue-600">95%</p>
              <p className="text-sm text-gray-600">解决了数据空白问题</p>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-purple-700">分析精度</h4>
              <p className="text-2xl font-bold text-purple-600">+150%</p>
              <p className="text-sm text-gray-600">相比标准版大幅提升</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 使用增强版数据显示能量图谱 */}
      <FiveDimensionalEnergyChart 
        profileData={mockProfileData}
        chakraScores={mockChakraScores}
        physicalAssessment={assessmentData?.physical}
        lifeRhythm={assessmentData?.lifeRhythm}
        socialAssessment={assessmentData?.social}
        financialEnergyAssessment={assessmentData?.financial}
        emotionalIntelligenceAssessment={assessmentData?.emotional}
      />

      <Card>
        <CardHeader>
          <CardTitle>评估数据概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">身体体质评估</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>运动频率: {assessmentData?.physical?.exerciseFrequency}/5</div>
                <div>睡眠质量: {assessmentData?.physical?.sleepQuality}/5</div>
                <div>精力时段: {assessmentData?.physical?.energyPeakTime}</div>
                <div>压力应对: {assessmentData?.physical?.stressResponse}/5</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">社交关系评估</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>关系状态: {assessmentData?.social?.relationshipStatus}</div>
                <div>社交圈: {assessmentData?.social?.socialCircleSize}/5</div>
                <div>冲突处理: {assessmentData?.social?.conflictHandling}/5</div>
                <div>共情能力: {assessmentData?.social?.empathyLevel}/5</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">财务能量评估</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>金钱态度: {assessmentData?.financial?.moneyRelationship}</div>
                <div>丰盛心态: {assessmentData?.financial?.abundanceMindset}/5</div>
                <div>财务压力: {assessmentData?.financial?.financialStress}/5</div>
                <div>慷慨程度: {assessmentData?.financial?.generosity}/5</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          onClick={() => setStep('questionnaire')}
          variant="outline"
          className="flex-1"
        >
          重新评估
        </Button>
        <Button 
          onClick={() => setStep('intro')}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          返回首页
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="container mx-auto">
        {step === 'intro' && renderIntroduction()}
        {step === 'questionnaire' && renderQuestionnaire()}
        {step === 'results' && renderResults()}
      </div>
    </div>
  );
} 