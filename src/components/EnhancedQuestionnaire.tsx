"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  User, Heart, Clock, Users, DollarSign, Brain, 
  Activity, Moon, Zap, Leaf, Compass 
} from 'lucide-react';

interface EnhancedQuestionnaireProps {
  onComplete: (data: any) => void;
  onAnalyzing?: (isAnalyzing: boolean) => void;
  basicProfile?: any;
}

const EnhancedQuestionnaire: React.FC<EnhancedQuestionnaireProps> = ({ onComplete, onAnalyzing, basicProfile }) => {
  const [currentTab, setCurrentTab] = useState('physical');
  const [formData, setFormData] = useState({
    physical: {
      height: '',
      weight: '',
      exerciseFrequency: 3,
      sleepQuality: 3,
      energyPeakTime: 'morning',
      stressResponse: 3,
      healthConcerns: [] as string[]
    },
    lifeRhythm: {
      wakeUpTime: '07:00',
      bedTime: '23:00',
      workSchedule: 'fixed',
      socialFrequency: 3,
      seasonalMood: 3,
      digitalUsage: 3,
      natureConnection: 3
    },
    social: {
      relationshipStatus: 'single',
      socialCircleSize: 3,
      conflictHandling: 3,
      empathyLevel: 3,
      communicationPreference: 'direct',
      energyDrain: [] as string[],
      energyBoost: [] as string[]
    },
    financial: {
      moneyRelationship: 'neutral',
      abundanceMindset: 3,
      financialStress: 3,
      generosity: 3,
      materialAttachment: 3,
      financialGoals: [] as string[]
    },
    emotional: {
      selfAwareness: 3,
      emotionRegulation: 3,
      socialAwareness: 3,
      relationshipManagement: 3,
      stressCoping: [] as string[],
      emotionalTriggers: [],
      moodPatterns: []
    }
  });

  // 加载本地存储的数据
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('enhanced_questionnaire_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
        console.log('✅ 已从本地存储加载增强问卷数据');
      }
    } catch (error) {
      console.error('❌ 加载本地存储数据失败:', error);
    }
  }, []);

  // 数据变化时保存到本地存储
  useEffect(() => {
    try {
      localStorage.setItem('enhanced_questionnaire_data', JSON.stringify(formData));
      // 不要在每次数据变化时都打印日志，避免控制台被刷屏
    } catch (error) {
      console.error('❌ 保存数据到本地存储失败:', error);
    }
  }, [formData]);
  
  // 自动保存到本地存储（定期备份）
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      try {
        localStorage.setItem('enhanced_questionnaire_data', JSON.stringify(formData));
        console.log('🔄 增强问卷数据已自动保存到本地存储');
      } catch (error) {
        console.error('❌ 自动保存到本地存储失败:', error);
      }
    }, 30000); // 每30秒自动保存一次
    
    return () => clearInterval(autoSaveInterval);
  }, []);

  const tabs = [
    { id: 'physical', label: '身体体质', icon: Activity, color: 'bg-green-500' },
    { id: 'lifeRhythm', label: '生活节律', icon: Clock, color: 'bg-blue-500' },
    { id: 'social', label: '社交关系', icon: Users, color: 'bg-purple-500' },
    { id: 'financial', label: '财务能量', icon: DollarSign, color: 'bg-yellow-500' },
    { id: 'emotional', label: '情绪智能', icon: Brain, color: 'bg-red-500' }
  ];

  const completedTabs = Object.keys(formData).filter(tab => {
    // 简单的完成度检查逻辑
    return true; // 为演示目的，假设都已完成
  }).length;

  const totalTabs = tabs.length;
  const progress = (completedTabs / totalTabs) * 100;

  const updateFormData = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const updateArrayField = (section: string, field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const sectionData = prev[section as keyof typeof prev] as any;
      const currentArray = (sectionData?.[field] as string[]) || [];
      const newArray = checked 
        ? [...currentArray, value]
        : currentArray.filter((item: string) => item !== value);
      
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [field]: newArray
        }
      };
    });
  };

  const renderPhysicalAssessment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="height">身高 (cm)</Label>
          <Input
            id="height"
            type="number"
            placeholder="170"
            value={formData.physical.height}
            onChange={(e) => updateFormData('physical', 'height', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="weight">体重 (kg)</Label>
          <Input
            id="weight"
            type="number"
            placeholder="65"
            value={formData.physical.weight}
            onChange={(e) => updateFormData('physical', 'weight', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>运动频率: {formData.physical.exerciseFrequency}/5</Label>
        <Slider
          value={[formData.physical.exerciseFrequency]}
          onValueChange={(value) => updateFormData('physical', 'exerciseFrequency', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>从不运动</span>
          <span>每天运动</span>
        </div>
      </div>

      <div>
        <Label>睡眠质量: {formData.physical.sleepQuality}/5</Label>
        <Slider
          value={[formData.physical.sleepQuality]}
          onValueChange={(value) => updateFormData('physical', 'sleepQuality', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>很差</span>
          <span>极佳</span>
        </div>
      </div>

      <div>
        <Label>精力最佳时段</Label>
        <RadioGroup
          value={formData.physical.energyPeakTime}
          onValueChange={(value) => updateFormData('physical', 'energyPeakTime', value)}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="morning" id="morning" />
            <Label htmlFor="morning">🌅 上午 (6-12点)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="afternoon" id="afternoon" />
            <Label htmlFor="afternoon">☀️ 下午 (12-18点)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="evening" id="evening" />
            <Label htmlFor="evening">🌆 傍晚 (18-22点)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="night" id="night" />
            <Label htmlFor="night">🌙 深夜 (22-6点)</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>健康关注点 (可多选)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['睡眠问题', '消化不良', '颈椎疼痛', '眼睛疲劳', '情绪波动', '免疫力低', '体重管理', '慢性疲劳'].map(concern => (
            <div key={concern} className="flex items-center space-x-2">
              <Checkbox
                id={concern}
                checked={formData.physical.healthConcerns.includes(concern)}
                onCheckedChange={(checked) => updateArrayField('physical', 'healthConcerns', concern, checked as boolean)}
              />
              <Label htmlFor={concern} className="text-sm">{concern}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLifeRhythmAssessment = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wakeUpTime">起床时间</Label>
          <Input
            id="wakeUpTime"
            type="time"
            value={formData.lifeRhythm.wakeUpTime}
            onChange={(e) => updateFormData('lifeRhythm', 'wakeUpTime', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="bedTime">就寝时间</Label>
          <Input
            id="bedTime"
            type="time"
            value={formData.lifeRhythm.bedTime}
            onChange={(e) => updateFormData('lifeRhythm', 'bedTime', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>工作时间规律性</Label>
        <RadioGroup
          value={formData.lifeRhythm.workSchedule}
          onValueChange={(value) => updateFormData('lifeRhythm', 'workSchedule', value)}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fixed" id="fixed" />
            <Label htmlFor="fixed">🕘 固定时间 (朝九晚五)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="flexible" id="flexible" />
            <Label htmlFor="flexible">🔄 弹性时间 (可调整)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="irregular" id="irregular" />
            <Label htmlFor="irregular">🌪️ 不规律 (经常变化)</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>社交活动频率: {formData.lifeRhythm.socialFrequency}/5</Label>
        <Slider
          value={[formData.lifeRhythm.socialFrequency]}
          onValueChange={(value) => updateFormData('lifeRhythm', 'socialFrequency', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>很少社交</span>
          <span>经常社交</span>
        </div>
      </div>

      <div>
        <Label>季节对情绪的影响: {formData.lifeRhythm.seasonalMood}/5</Label>
        <Slider
          value={[formData.lifeRhythm.seasonalMood]}
          onValueChange={(value) => updateFormData('lifeRhythm', 'seasonalMood', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>无影响</span>
          <span>影响很大</span>
        </div>
      </div>

      <div>
        <Label>与自然的连接频率: {formData.lifeRhythm.natureConnection}/5</Label>
        <Slider
          value={[formData.lifeRhythm.natureConnection]}
          onValueChange={(value) => updateFormData('lifeRhythm', 'natureConnection', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>几乎不接触</span>
          <span>经常在自然中</span>
        </div>
      </div>
    </div>
  );

  const renderSocialAssessment = () => (
    <div className="space-y-6">
      <div>
        <Label>感情状态</Label>
        <RadioGroup
          value={formData.social.relationshipStatus}
          onValueChange={(value) => updateFormData('social', 'relationshipStatus', value)}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single">💫 单身</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dating" id="dating" />
            <Label htmlFor="dating">💕 恋爱中</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="married" id="married" />
            <Label htmlFor="married">💍 已婚</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="complicated" id="complicated" />
            <Label htmlFor="complicated">🤷 复杂状态</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>社交圈大小: {formData.social.socialCircleSize}/5</Label>
        <Slider
          value={[formData.social.socialCircleSize]}
          onValueChange={(value) => updateFormData('social', 'socialCircleSize', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>很小圈子</span>
          <span>广泛人脉</span>
        </div>
      </div>

      <div>
        <Label>冲突处理能力: {formData.social.conflictHandling}/5</Label>
        <Slider
          value={[formData.social.conflictHandling]}
          onValueChange={(value) => updateFormData('social', 'conflictHandling', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>回避冲突</span>
          <span>善于解决</span>
        </div>
      </div>

      <div>
        <Label>共情能力: {formData.social.empathyLevel}/5</Label>
        <Slider
          value={[formData.social.empathyLevel]}
          onValueChange={(value) => updateFormData('social', 'empathyLevel', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>较少共情</span>
          <span>高度共情</span>
        </div>
      </div>

      <div>
        <Label>消耗能量的人际关系类型 (可多选)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['抱怨型朋友', '控制型伴侣', '竞争型同事', '依赖型家人', '戏剧型社交', '批评型上司'].map(type => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`drain-${type}`}
                checked={formData.social.energyDrain.includes(type)}
                onCheckedChange={(checked) => updateArrayField('social', 'energyDrain', type, checked as boolean)}
              />
              <Label htmlFor={`drain-${type}`} className="text-sm">{type}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFinancialAssessment = () => (
    <div className="space-y-6">
      <div>
        <Label>对金钱的态度</Label>
        <RadioGroup
          value={formData.financial.moneyRelationship}
          onValueChange={(value) => updateFormData('financial', 'moneyRelationship', value)}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="love" id="love" />
            <Label htmlFor="love">💰 热爱金钱</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="neutral" id="neutral" />
            <Label htmlFor="neutral">⚖️ 中性态度</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="stress" id="stress" />
            <Label htmlFor="stress">😰 金钱焦虑</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fear" id="fear" />
            <Label htmlFor="fear">😨 恐惧匮乏</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label>丰盛心态: {formData.financial.abundanceMindset}/5</Label>
        <Slider
          value={[formData.financial.abundanceMindset]}
          onValueChange={(value) => updateFormData('financial', 'abundanceMindset', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>匮乏思维</span>
          <span>丰盛思维</span>
        </div>
      </div>

      <div>
        <Label>财务压力水平: {formData.financial.financialStress}/5</Label>
        <Slider
          value={[formData.financial.financialStress]}
          onValueChange={(value) => updateFormData('financial', 'financialStress', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>无压力</span>
          <span>压力很大</span>
        </div>
      </div>

      <div>
        <Label>财务目标 (可多选)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['买房', '创业', '投资理财', '子女教育', '退休储蓄', '旅行基金', '应急储备', '奢侈品购买'].map(goal => (
            <div key={goal} className="flex items-center space-x-2">
              <Checkbox
                id={`goal-${goal}`}
                checked={formData.financial.financialGoals.includes(goal)}
                onCheckedChange={(checked) => updateArrayField('financial', 'financialGoals', goal, checked as boolean)}
              />
              <Label htmlFor={`goal-${goal}`} className="text-sm">{goal}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEmotionalAssessment = () => (
    <div className="space-y-6">
      <div>
        <Label>自我觉察能力: {formData.emotional.selfAwareness}/5</Label>
        <Slider
          value={[formData.emotional.selfAwareness]}
          onValueChange={(value) => updateFormData('emotional', 'selfAwareness', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>很少反思</span>
          <span>高度自知</span>
        </div>
      </div>

      <div>
        <Label>情绪调节能力: {formData.emotional.emotionRegulation}/5</Label>
        <Slider
          value={[formData.emotional.emotionRegulation]}
          onValueChange={(value) => updateFormData('emotional', 'emotionRegulation', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>情绪波动大</span>
          <span>情绪稳定</span>
        </div>
      </div>

      <div>
        <Label>社会觉察能力: {formData.emotional.socialAwareness}/5</Label>
        <Slider
          value={[formData.emotional.socialAwareness]}
          onValueChange={(value) => updateFormData('emotional', 'socialAwareness', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>社交盲区多</span>
          <span>善解人意</span>
        </div>
      </div>

      <div>
        <Label>关系管理能力: {formData.emotional.relationshipManagement}/5</Label>
        <Slider
          value={[formData.emotional.relationshipManagement]}
          onValueChange={(value) => updateFormData('emotional', 'relationshipManagement', value[0])}
          max={5}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>关系处理差</span>
          <span>关系专家</span>
        </div>
      </div>

      <div>
        <Label>压力应对方式 (可多选)</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {['运动发泄', '冥想静心', '找朋友倾诉', '听音乐', '购物消费', '独处思考', '工作转移', '睡觉逃避'].map(method => (
            <div key={method} className="flex items-center space-x-2">
              <Checkbox
                id={`coping-${method}`}
                checked={formData.emotional.stressCoping.includes(method)}
                onCheckedChange={(checked) => updateArrayField('emotional', 'stressCoping', method, checked as boolean)}
              />
              <Label htmlFor={`coping-${method}`} className="text-sm">{method}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (currentTab) {
      case 'physical': return renderPhysicalAssessment();
      case 'lifeRhythm': return renderLifeRhythmAssessment();
      case 'social': return renderSocialAssessment();
      case 'financial': return renderFinancialAssessment();
      case 'emotional': return renderEmotionalAssessment();
      default: return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-6 w-6" />
          增强版能量评估问卷
          <Badge variant="secondary">{completedTabs}/{totalTabs}</Badge>
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-5">
            {tabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex flex-col items-center gap-1 p-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-xs">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map(tab => (
            <TabsContent key={tab.id} value={tab.id} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <tab.icon className="h-5 w-5" />
                    {tab.label}评估
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderTabContent()}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={() => {
              const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
              if (currentIndex > 0) {
                setCurrentTab(tabs[currentIndex - 1].id);
              }
            }}
            disabled={currentTab === tabs[0].id}
          >
            上一步
          </Button>
          
          {currentTab === tabs[tabs.length - 1].id ? (
            <Button 
              onClick={() => {
                try {
                  // 清除本地存储的数据
                  localStorage.removeItem('enhanced_questionnaire_data');
                  console.log('✅ 已清除本地存储的增强问卷数据');
                } catch (error) {
                  console.error('❌ 清除本地存储数据失败:', error);
                }
                
                // 调用完成回调
                onComplete(formData);
              }}
              className=""
            >
              完成评估
            </Button>
          ) : (
            <Button 
              onClick={() => {
                const currentIndex = tabs.findIndex(tab => tab.id === currentTab);
                if (currentIndex < tabs.length - 1) {
                  setCurrentTab(tabs[currentIndex + 1].id);
                }
              }}
            >
              下一步
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedQuestionnaire; 