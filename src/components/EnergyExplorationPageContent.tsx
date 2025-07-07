"use client";

import React, { useState, useEffect } from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import PersonalizedQuestionnaire from "./PersonalizedQuestionnaire";
import EnhancedQuestionnaire from "./EnhancedQuestionnaire";
import UserProfileDisplay from "./UserProfileDisplay";
import CrystalFilteringSystem from "./CrystalFilteringSystem";
import FiveDimensionalEnergyChart from './FiveDimensionalEnergyChart';
import LifeScenarioGuidance from './LifeScenarioGuidance';
// 暂时移除统一的核心组件以解决水合错误
// import { EnergyAnalysisHub } from '@/components/core/EnergyCore';
// import { ProfileDisplayHub } from '@/components/core/ProfileCore';
import type { UserProfileDataOutput as UserProfileData } from "@/ai/schemas/user-profile-schemas";
import type { ChakraAssessmentScores } from "@/types/questionnaire";
import { supabase } from '@/lib/supabase';
import {
  Loader2, Star, Zap, Target, TrendingUp, CheckCircle,
  Brain, Lightbulb, Gem, Sparkles, Heart, User, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";



export default function EnergyExplorationPageContent() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [chakraScores, setChakraScores] = useState<ChakraAssessmentScores | null>(null);
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [hasUnsubmittedData, setHasUnsubmittedData] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  
  // 增强评估相关状态
  const [showEnhancedDialog, setShowEnhancedDialog] = useState(false);
  const [isEnhancedMode, setIsEnhancedMode] = useState(false);
  const [enhancedData, setEnhancedData] = useState<any>(null);
  const [hasCompletedBasic, setHasCompletedBasic] = useState(false);
  const [showEnhancedQuestionnaire, setShowEnhancedQuestionnaire] = useState(false);
  const [isAnalyzingEnhancedData, setIsAnalyzingEnhancedData] = useState(false);
  const [hasCompletedEnhancedAssessment, setHasCompletedEnhancedAssessment] = useState(false);

  // 添加重新测试确认的状态
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  // 添加Tab状态
  const [activeTab, setActiveTab] = useState("overview");
  // 添加5维/8维视图切换状态
  const [showEnhancedView, setShowEnhancedView] = useState(!!enhancedData);

  // 当增强数据变化时更新视图状态
  useEffect(() => {
    if (enhancedData && !showEnhancedView) {
      setShowEnhancedView(true);
    }
  }, [enhancedData]);

  // 在组件加载时检查本地存储和已保存的画像
  useEffect(() => {
    const checkDataAndLoadProfile = async () => {
      // 检查本地存储是否有未提交的数据
      if (typeof window !== 'undefined') {
        const storedData = localStorage.getItem('questionnaire_form_data');
        const hasLocalData = storedData && storedData !== 'null';
        setHasUnsubmittedData(!!hasLocalData);
        
        if (hasLocalData) {
          console.log('💾 发现本地存储的问卷数据，用户可以继续完成或重新提交');
        }
      }
      
      // 检查是否有已保存的画像
      if (isAuthenticated && user && user.email && !userProfile && !isAnalyzingProfile) {
        setIsLoadingProfile(true);
        try {
          const { profileService } = await import('@/lib/supabase');
          const savedProfile = await profileService.getUserProfileByEmail(user.email);
          
          if (savedProfile && savedProfile.personality_insights) {
            // 从星座推导主宰行星的辅助函数
            const getZodiacPlanet = (zodiac: string): string => {
              const zodiacPlanetMap: Record<string, string> = {
                '白羊座': '火星', '白羊': '火星',
                '金牛座': '金星', '金牛': '金星', 
                '双子座': '水星', '双子': '水星',
                '巨蟹座': '月亮', '巨蟹': '月亮',
                '狮子座': '太阳', '狮子': '太阳',
                '处女座': '水星', '处女': '水星',
                '天秤座': '金星', '天秤': '金星',
                '天蝎座': '冥王星', '天蝎': '冥王星',
                '射手座': '木星', '射手': '木星',
                '摩羯座': '土星', '摩羯': '土星',
                '水瓶座': '天王星', '水瓶': '天王星',
                '双鱼座': '海王星', '双鱼': '海王星'
              };
              
              for (const [sign, planet] of Object.entries(zodiacPlanetMap)) {
                if (zodiac && zodiac.includes(sign.replace('座', ''))) {
                  return planet;
                }
              }
              return '太阳'; // 默认主宰行星
            };

            // 将数据库格式转换为UserProfileData格式
            const profileData: UserProfileData = {
              name: savedProfile.name,
              coreEnergyInsights: savedProfile.personality_insights,
              inferredZodiac: savedProfile.zodiac_sign || '',
              inferredChineseZodiac: savedProfile.chinese_zodiac || '',
              inferredElement: savedProfile.element || '',
              inferredPlanet: getZodiacPlanet(savedProfile.zodiac_sign || ''),
              mbtiLikeType: savedProfile.mbti || '',
              chakraAnalysis: savedProfile.chakra_analysis && typeof savedProfile.chakra_analysis === 'object' ? 
                '您的脉轮能量分析已完成，请查看下方的脉轮能量图谱了解详细信息。' : 
                (typeof savedProfile.chakra_analysis === 'string' ? savedProfile.chakra_analysis : ''),
            };

            setUserProfile(profileData);
            setProfileLoaded(true);
            
            // 处理脉轮评分数据
            if (savedProfile.chakra_analysis && typeof savedProfile.chakra_analysis === 'object') {
              setChakraScores(savedProfile.chakra_analysis as ChakraAssessmentScores);
            } else {
              setChakraScores(null);
            }
            
            // 检查是否有增强评估数据
            if (savedProfile.enhanced_assessment) {
              setEnhancedData(savedProfile.enhanced_assessment);
              // 不自动设置为增强模式，让用户看到完整的结果界面
            }
            
            // 标记已有基础评估完成
            setHasCompletedBasic(true);
            
            // 如果数据库中有画像，可以清除本地存储的问卷数据
            if (hasUnsubmittedData) {
              console.log('🔄 数据库中已有完整画像，本地问卷数据可能是旧数据');
            }
          }
        } catch (error) {
          console.error('Error loading saved profile:', error);
        } finally {
          setIsLoadingProfile(false);
        }
      }
    };

    checkDataAndLoadProfile();
  }, [isAuthenticated, user, userProfile, isAnalyzingProfile, hasUnsubmittedData]);

  // 从本地存储加载增强评估数据
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('enhanced_assessment_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setEnhancedData(parsedData);
        console.log('✅ 已从本地存储加载增强评估数据');
      }
    } catch (error) {
      console.error('❌ 加载本地存储数据失败:', error);
    }
  }, []);

  // 处理基础评估完成事件
  const handleBasicProfileComplete = (profileData: UserProfileData | null) => {
    if (!profileData) return; // 如果是null就直接返回
    
    setUserProfile(profileData);
    setHasCompletedBasic(true);
    
    // 只有在新完成基础评估且没有增强评估数据时才显示弹窗
    if (!enhancedData && !isEnhancedMode && profileData) {
      setTimeout(() => {
        setShowEnhancedDialog(true);
      }, 1000); // 延迟1秒显示弹窗，让用户先看到基础结果
    }
  };

  // 处理增强评估选择
  const handleEnhancedChoice = (choice: boolean) => {
    setShowEnhancedDialog(false);
    if (choice) {
      setIsEnhancedMode(true);
    }
  };

  // 处理增强评估完成
  const handleEnhancedAssessmentComplete = async (data: any) => {
    console.log('✅ 增强评估完成:', data);
    setEnhancedData(data);
    setShowEnhancedQuestionnaire(false);
    setIsAnalyzingEnhancedData(true);
    
    // 保存到数据库
    await saveEnhancedDataToDatabase(data);
    
    // 清除本地存储的增强问卷数据
    try {
      localStorage.removeItem('enhanced_questionnaire_data');
      console.log('✅ 已清除本地存储的增强问卷数据');
    } catch (error) {
      console.error('❌ 清除本地存储数据失败:', error);
    }
    
    // 分析增强数据
    setTimeout(() => {
      setIsAnalyzingEnhancedData(false);
      setHasCompletedEnhancedAssessment(true);
      setActiveTab('results');
    }, 2000);
  };

  // 保存增强评估数据到数据库
  const saveEnhancedDataToDatabase = async (data: any) => {
    try {
      console.log('🔄 开始保存增强评估数据...');
      
      // 先保存到本地存储作为备份
      try {
        localStorage.setItem('enhanced_assessment_data', JSON.stringify(data));
        console.log('✅ 增强评估数据已保存到本地存储');
      } catch (localError) {
        console.error('❌ 保存到本地存储失败:', localError);
      }
      
      if (!user?.email) {
        console.error('❌ 用户邮箱不存在，无法保存增强评估数据');
        return;
      }
      
      // 先测试数据库字段是否存在且可以更新
      const { testEnhancedAssessmentSaving } = await import('@/lib/database-fix');
      const testResult = await testEnhancedAssessmentSaving(user.email);
      
      if (!testResult.success) {
        console.error('❌ 数据库字段测试失败:', testResult.message);
        
        // 显示用户友好的错误提示
        alert(`⚠️ ${testResult.message}\n\n数据已临时保存在本地，您可以：\n1. 刷新页面重新尝试\n2. 稍后再次提交\n3. 联系技术支持获取帮助`);
        
        return;
      }
      
      // 直接使用 Supabase 客户端保存数据，不进行预先测试
      const { supabase } = await import('@/lib/supabase');
      
      console.log('📝 查找现有用户档案...');
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ 查找用户档案失败:', fetchError);
        return;
      }
      
      if (existingProfile) {
        console.log('📝 找到现有用户档案，准备更新增强评估数据');
        
        // 尝试直接更新
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            enhanced_assessment: data,
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);
        
        if (updateError) {
          // 详细的错误信息记录
          console.error('❌ 增强评估数据更新失败:', {
            error: updateError,
            errorString: JSON.stringify(updateError, null, 2),
            message: updateError.message || '未知错误',
            code: updateError.code || '无错误代码',
            details: updateError.details || '无详细信息',
            hint: updateError.hint || '无提示信息'
          });
          
          // 用户友好的错误提示
          let userMessage = '保存增强评估数据失败。';
          let solution = '';
          
          // 根据错误类型提供解决方案
          if (updateError.code === '42501') {
            userMessage = '数据库权限不足，无法保存增强评估数据。';
            solution = `
              🔒 数据库行级安全策略（RLS）问题
              
              解决方案：
              1. 请确保您已正确登录
              2. 刷新页面重新尝试
              3. 如果问题持续，请联系技术支持
            `;
          } else if (updateError.message?.includes('column') && updateError.message?.includes('enhanced_assessment')) {
            userMessage = '数据库结构不完整，缺少增强评估字段。';
            solution = `
              📋 数据库字段缺失问题
              
              请联系管理员在数据库中执行：
              ALTER TABLE profiles ADD COLUMN enhanced_assessment JSONB;
            `;
          } else if (updateError.code === '23505') {
            userMessage = '数据重复，请稍后重试。';
            solution = '🔄 数据重复冲突，请刷新页面后重新提交。';
          } else {
            userMessage = `数据库操作失败：${updateError.message || '未知错误'}`;
            solution = '🛠️ 请检查网络连接并重试，或联系技术支持。';
          }
          
          console.log(solution);
          
          // 显示用户友好的错误提示
          alert(`⚠️ ${userMessage}\n\n数据已临时保存在本地，您可以：\n1. 刷新页面重新尝试\n2. 稍后再次提交\n3. 联系技术支持获取帮助`);
          
          return;
        }
        
        console.log('✅ 增强评估数据保存成功');
      } else {
        console.log('⚠️ 未找到现有用户档案，数据将暂存在本地');
        // 如果没有找到档案，数据仍然保存在 enhancedData 状态中
        // 用户下次登录时可以重新尝试保存
      }
    } catch (error) {
      console.error('❌ 保存增强评估数据失败:', {
        message: error instanceof Error ? error.message : '未知错误',
        error: error,
        userEmail: user?.email || '邮箱不存在'
      });
      
      // 显示用户友好的错误提示
      alert(`⚠️ 保存增强评估数据时发生错误\n\n数据已临时保存在本地，您可以：\n1. 刷新页面重新尝试\n2. 稍后再次提交\n3. 联系技术支持获取帮助`);
    }
  };

  // 重新开始问卷的功能
  const handleRestartQuestionnaire = async () => {
    try {
      console.log('🔄 开始重新测试，清空所有数据...');
      
      // 显示处理状态
      setIsLoadingProfile(true);
      setShowRestartConfirm(false); // 隐藏确认对话框
      
      // 1. 清空组件状态
      setUserProfile(null);
      setChakraScores(null);
      setIsAnalyzingProfile(false);
      setHasCompletedBasic(false);
      setIsEnhancedMode(false);
      setEnhancedData(null);
      setShowEnhancedDialog(false);
      setProfileLoaded(false);
      
      // 2. 清空本地存储
      if (typeof window !== 'undefined') {
        console.log('🗑️ 清空本地存储数据...');
        const keysToRemove = [
          'questionnaire_form_data',
          'questionnaire_progress',
          'questionnaire_current_step',
          'enhanced_questionnaire_data',
          'chakra_assessment_scores',
          'user_profile_cache',
          'meditation_reminders',
          'crystal_preferences',
          'energy_history',
          'daily_insights_cache',
          'personalized_recommendations'
        ];
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
            console.log(`✅ 已清空: ${key}`);
          } catch (error) {
            console.warn(`⚠️ 清空失败: ${key}`, error);
          }
        });
        
        setHasUnsubmittedData(false);
      }
      
      // 3. 清空数据库中的用户数据
      try {
        console.log('🗄️ 清空数据库用户数据...');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // 删除用户档案数据
          const { error: profileError } = await supabase
            .from('user_profiles')
            .delete()
            .eq('user_id', user.id);
          
          if (profileError) {
            console.warn('⚠️ 清空档案数据时出现警告:', profileError);
          } else {
            console.log('✅ 数据库用户档案已清空');
          }
          
          // 删除能量记录
          const { error: energyError } = await supabase
            .from('energy_records')
            .delete()
            .eq('user_id', user.id);
          
          if (energyError) {
            console.warn('⚠️ 清空能量记录时出现警告:', energyError);
          } else {
            console.log('✅ 数据库能量记录已清空');
          }
        }
      } catch (dbError) {
        console.warn('⚠️ 数据库清理过程中出现警告:', dbError);
      }
      
      // 4. 状态重置完成
      setIsLoadingProfile(false);
      console.log('🎉 重新测试准备完成！');
      
    } catch (error) {
      console.error('❌ 重新测试过程中发生错误:', error);
      setIsLoadingProfile(false);
    }
  };

  return (
    <div className="container-center space-section">
      <div className="max-w-6xl mx-auto">

        {/* 主要内容区域 */}
        <div className="space-content">


            {/* 能量画像完成状态 - 直接显示详细内容 */}
            {profileLoaded && (userProfile || enhancedData) && (
              <div className="space-y-6">
                {/* 深度能量画像卡片 - 整合功能按钮 */}
                <div className="quantum-card energy-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary rounded-full p-2">
                        <Brain className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold heading-enhanced">
                          {enhancedData ? '您的深度能量画像' : '您的能量画像'}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {enhancedData ? '基于八维深度评估的完整分析' : '基于五维能量评估的个性化分析'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* 五维/八维切换按钮 - 统一样式 */}
                      {enhancedData && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant={!showEnhancedView ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowEnhancedView(false)}
                            className="h-8 px-3 text-xs"
                          >
                            五维
                          </Button>
                          <Button
                            variant={showEnhancedView ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowEnhancedView(true)}
                            className="h-8 px-3 text-xs"
                          >
                            八维
                          </Button>
                        </div>
                      )}

                      {/* 重新测试按钮 */}
                      <Button
                        onClick={() => setShowRestartConfirm(true)}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs"
                      >
                        🔄 重新测试
                      </Button>
                    </div>
                  </div>



                  {/* 核心能量洞察 - 合并到画像卡片中 */}
                  {userProfile?.coreEnergyInsights && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="hierarchy-secondary rounded-lg p-4">
                        <div className="text-foreground leading-relaxed text-sm">
                          {userProfile.coreEnergyInsights.split('\n\n').map((paragraph, pIndex) => (
                            <p key={`p-${pIndex}`} className="mb-3 last:mb-0">
                              {paragraph.split('\n').map((line, lIndex) => (
                                <React.Fragment key={`l-${lIndex}`}>
                                  {line}
                                  {lIndex < paragraph.split('\n').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>



                {/* 深度分析结果展示（修复对象渲染问题） */}
                {enhancedData?.deepAnalysisResults && Array.isArray(enhancedData.deepAnalysisResults) && enhancedData.deepAnalysisResults.length > 0 && (
                  <Card className="quantum-card">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center heading-enhanced">
                        <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                        深度个性化分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {enhancedData.deepAnalysisResults.map((item: any, idx: number) => (
                          <div key={idx} className="border-b pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0">
                            <div className="font-semibold text-primary mb-1">{item.area}</div>
                            <div className="text-foreground mb-1">建议：{item.suggestion}</div>
                            <div className="text-muted-foreground text-sm">行动建议：{item.actionStep}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 统一的能量分析组件 - 暂时移除以解决水合错误 */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <EnergyAnalysisHub
                    profile={userProfile}
                    mode="exploration"
                    layout="chart"
                    showAdvanced={true}
                  />

                  <ProfileDisplayHub
                    profile={userProfile}
                    mode="detailed"
                    showElements={['mbti', 'zodiac', 'chakra', 'energy', 'element', 'planet']}
                    interactive={true}
                  />
                </div> */}

                {/* 八维度能量画像 */}
                <div data-chart="five-dimensional">
                  <FiveDimensionalEnergyChart
                    profileData={userProfile}
                    chakraScores={chakraScores}
                    className="mt-6"
                    physicalAssessment={showEnhancedView ? enhancedData?.physicalAssessment : undefined}
                    lifeRhythm={showEnhancedView ? enhancedData?.lifeRhythm : undefined}
                    socialAssessment={showEnhancedView ? enhancedData?.socialAssessment : undefined}
                    financialEnergyAssessment={showEnhancedView ? enhancedData?.financialEnergyAssessment : undefined}
                    emotionalIntelligenceAssessment={showEnhancedView ? enhancedData?.emotionalIntelligenceAssessment : undefined}
                  />
                </div>

                {/* 生活场景水晶指导 */}
                <div data-section="life-guidance">
                  <LifeScenarioGuidance
                    userProfile={userProfile ?? {} as any}
                    className="mt-6"
                  />
                </div>

                {/* 推荐水晶详细信息 */}
                <div data-section="crystal-filtering">
                  {userProfile?.recommendedCrystals && userProfile.recommendedCrystals.length > 0 && (
                    <Card className="bg-background shadow-inner">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Sparkles className="mr-2 h-6 w-6 text-accent" />
                        推荐水晶详解
                      </CardTitle>
                      <CardDescription>
                        根据您的能量特质为您精心推荐的水晶及其作用原理
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      {userProfile.recommendedCrystals.map((crystal, index) => (
                        <Card key={index} className="p-4 bg-card/50 shadow">
                          <CardHeader className="p-0 pb-2 mb-2 border-b">
                            <CardTitle className="text-lg text-primary">{crystal.name}</CardTitle>
                            {crystal.matchScore && (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground mt-1 w-fit">
                                匹配度: {Math.round(crystal.matchScore * 10)}/10
                              </div>
                            )}
                          </CardHeader>
                          <CardContent className="p-0 space-y-3">
                            {Object.entries(crystal.reasoningDetails).map(([reasonKey, reasonText]) => (
                              <div key={reasonKey}>
                                <h5 className="font-semibold text-sm text-foreground/90 mb-1">
                                  {reasonKey === 'personalityFit' && '🧠 个性匹配'}
                                  {reasonKey === 'chakraSupport' && '⚡ 脉轮支持'}
                                  {reasonKey === 'goalAlignment' && '🎯 目标对齐'}
                                  {reasonKey === 'holisticSynergy' && '🤝 整体协同'}
                                </h5>
                                <div className="text-xs text-foreground/80 ml-1 pl-4 border-l-2 border-accent/50 my-1">
                                  {reasonText.split('\n\n').map((paragraph, pIndex) => (
                                    <p key={`p-${pIndex}`} className="mb-2 last:mb-0">
                                      {paragraph.split('\n').map((line, lIndex) => (
                                        <React.Fragment key={`l-${lIndex}`}>
                                          {line}
                                          {lIndex < paragraph.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                      ))}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 水晶组合 */}
                {userProfile?.crystalCombinations && userProfile.crystalCombinations.length > 0 && (
                  <Card className="bg-background shadow-inner">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Gem className="mr-2 h-5 w-5 text-accent" /> 
                        水晶疗愈组合
                      </CardTitle>
                      <CardDescription>
                        多种水晶协同作用，放大疗愈效果的专属组合建议
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                      {userProfile.crystalCombinations.map((combo, index) => (
                        <div key={index} className="p-3 border rounded-md bg-card/50">
                          <p className="font-medium text-primary">{combo.combination.join(' + ')}</p>
                          <div className="text-sm text-foreground leading-relaxed mt-2">
                            {combo.synergyEffect.split('\n\n').map((paragraph, pIndex) => (
                              <p key={`p-${pIndex}`} className="mb-2 last:mb-0">
                                {paragraph.split('\n').map((line, lIndex) => (
                                  <React.Fragment key={`l-${lIndex}`}>
                                    {line}
                                    {lIndex < paragraph.split('\n').length - 1 && <br />}
                                  </React.Fragment>
                                ))}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  )}
                </div>
              </div>
            )}

            {/* 基础评估模式 */}
            {!isEnhancedMode && !userProfile && !isAnalyzingProfile && !isLoadingProfile && !enhancedData && (
              <PersonalizedQuestionnaire 
                setProfileData={handleBasicProfileComplete} 
                setIsAnalyzing={setIsAnalyzingProfile}
                enhancedData={enhancedData}
              />
            )}

            {/* 分析状态 */}
            {(isAnalyzingProfile || isLoadingProfile) && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-lg font-medium text-foreground">
                  {isLoadingProfile ? '加载您的档案数据...' : '正在分析您的能量画像...'}
                </p>
                <p className="text-muted-foreground mt-2">
                  {isLoadingProfile ? '请稍候，正在获取您的个人数据' : '这可能需要几秒钟时间，请耐心等待'}
                </p>
              </div>
            )}

                         {/* 增强评估选择对话框 */}
             {showEnhancedDialog && !isEnhancedMode && (
               <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                 <div className="quantum-card p-6 max-w-md mx-4">
                   <h3 className="text-lg font-semibold mb-4 text-center flex items-center gap-2 justify-center heading-enhanced">
                     <Star className="h-5 w-5 text-primary" />
                     想要更深入了解自己吗？
                   </h3>
                   <div className="space-y-3 mb-6 text-muted-foreground">
                     <p>🎉 恭喜完成基础五维能量评估！</p>
                     <p>现在您可以选择升级到<strong>深度八维评估</strong>，获得更全面的能量分析</p>
                   </div>
                   <div className="flex gap-3 justify-center">
                     <Button
                       variant="outline"
                       onClick={() => setShowEnhancedDialog(false)}
                       className="flex-1"
                     >
                       暂时跳过
                     </Button>
                     <Button
                       onClick={() => {
                         setIsEnhancedMode(true);
                         setShowEnhancedDialog(false);
                       }}
                       className="flex-1"
                     >
                       <Star className="w-4 h-4 mr-1" />
                       开始深度评估
                     </Button>
                   </div>
                 </div>
               </div>
             )}

            {/* 增强评估模式 */}
            {isEnhancedMode && !enhancedData && !isAnalyzingProfile && (
              <EnhancedQuestionnaire 
                basicProfile={userProfile}
                onComplete={handleEnhancedAssessmentComplete}
                onAnalyzing={setIsAnalyzingProfile}
              />
            )}
        </div>





        {/* 重新测试确认对话框 */}
        {showRestartConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="quantum-card p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4 text-center heading-enhanced">
                🔄 确认重新测试
              </h3>
              <p className="text-muted-foreground mb-6 text-center">
                这将清空您的所有评估数据，需要重新完成问卷。
                <br /><br />
                您确定要继续吗？
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowRestartConfirm(false)}
                  className="flex-1"
                >
                  取消
                </Button>
                <Button
                  onClick={handleRestartQuestionnaire}
                  variant="destructive"
                  className="flex-1"
                  disabled={isLoadingProfile}
                >
                  {isLoadingProfile ? '处理中...' : '确认重新测试'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
