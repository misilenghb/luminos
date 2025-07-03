"use client";

import React, { useState } from 'react';
import type { UserProfileDataOutput as UserProfileData, CrystalReasoningDetails } from "@/ai/schemas/user-profile-schemas"; 
import type { ChakraAssessmentScores } from "@/types/questionnaire";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Gem, Sparkles, Brain, BarChartHorizontalBig as ChakraIconUi, Zap as ElementIconUi, Lightbulb, Target, Users, HeartHandshake, Star, ToggleLeft, ToggleRight } from "lucide-react"; 
import FiveDimensionalEnergyChart from './FiveDimensionalEnergyChart';
import LifeScenarioGuidance from './LifeScenarioGuidance';

interface UserProfileDisplayProps {
  profileData: UserProfileData | null;
  chakraScores?: ChakraAssessmentScores | null;
  enhancedData?: any; // 增强评估数据
}

const FormattedText: React.FC<{ text?: string; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  return (
    <>
      {text.split('\n\n').map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className={`mb-2 last:mb-0 ${className || ''}`}>
          {paragraph.split('\n').map((line, lIndex) => (
            <React.Fragment key={`l-${lIndex}`}>
              {line}
              {lIndex < paragraph.split('\n').length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
};

const UserProfileDisplay: React.FC<UserProfileDisplayProps> = ({ profileData, chakraScores, enhancedData }) => {
  const { t } = useLanguage();
  
  // 添加视图切换状态
  const [showEnhancedView, setShowEnhancedView] = useState(!!enhancedData);

  if (!profileData) {
    return null; 
  }

  // Chakra
  const chakraSkipped = !profileData.chakraAnalysis || profileData.chakraAnalysis.toLowerCase().includes("skipped") || profileData.chakraAnalysis.toLowerCase().includes("无法") || profileData.chakraAnalysis.toLowerCase().includes("could not be generated");


  
  const renderCustomTitledSection = (
    titleKey: string, // Now this is a translation key
    description: string | undefined | null,
    Icon?: React.ElementType,
    isSkippedOrEmpty?: boolean,
    contentClassName?: string
  ) => {
    const effectiveDescription = isSkippedOrEmpty 
        ? (description || t('energyExplorationPage.userProfile.infoNotAvailable', { field: t(titleKey).toLowerCase() }))
        : description;

    return (
      <Card className="bg-card/50 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            {Icon && <Icon className="mr-2 h-5 w-5 text-accent" />}
            {t(titleKey)} 
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormattedText text={effectiveDescription || undefined} className={`${isSkippedOrEmpty ? 'text-muted-foreground italic' : 'text-foreground'} ml-1 leading-relaxed ${contentClassName || 'text-sm'}`} />
        </CardContent>
      </Card>
    );
  };

  // MBTI
  const mbtiSkipped = !profileData.mbtiLikeType || profileData.mbtiLikeType.toLowerCase().includes("skipped") || profileData.mbtiLikeType.toLowerCase().includes("无法") || profileData.mbtiLikeType.toLowerCase().includes("could not be generated");

  // Element & Planet
  let elementPlanetCombinedDesc = "";
  const elementText = profileData.inferredElement && !profileData.inferredElement.includes("cannot be determined") && !profileData.inferredElement.includes("无法") && !profileData.inferredElement.includes("could not be generated") && profileData.inferredElement.trim() !== "" ? profileData.inferredElement : null;
  const planetText = profileData.inferredPlanet && !profileData.inferredPlanet.includes("cannot be determined") && !profileData.inferredPlanet.includes("无法") && !profileData.inferredPlanet.includes("could not be generated") && profileData.inferredPlanet.trim() !== "" ? profileData.inferredPlanet : null;

  if (elementText) elementPlanetCombinedDesc += `${t('energyExplorationPage.userProfile.inferredElement')} ${elementText}`;
  if (planetText) {
      if (elementPlanetCombinedDesc) elementPlanetCombinedDesc += "\n\n"; // Use \n\n for paragraph break
      elementPlanetCombinedDesc += `${t('energyExplorationPage.userProfile.inferredPlanet')} ${planetText}`;
  }
  const isElementPlanetSectionSkipped = !elementPlanetCombinedDesc.trim(); // Check if the combined string is empty after trimming
  const finalElementPlanetDescription = isElementPlanetSectionSkipped
      ? t('energyExplorationPage.userProfile.infoNotAvailable', { field: t('energyExplorationPage.userProfile.elementPlanetTitle').toLowerCase() })
      : elementPlanetCombinedDesc;


  const reasoningTitles = {
    personalityFit: t('energyExplorationPage.userProfile.reasoning.personalityFit'),
    chakraSupport: t('energyExplorationPage.userProfile.reasoning.chakraSupport'),
    goalAlignment: t('energyExplorationPage.userProfile.reasoning.goalAlignment'),
    holisticSynergy: t('energyExplorationPage.userProfile.reasoning.holisticSynergy')
  };

  const reasoningIcons = {
    personalityFit: Users,
    chakraSupport: ChakraIconUi,
    goalAlignment: Target,
    holisticSynergy: HeartHandshake
  };


  return (
    <div className="w-full space-y-6">
      {/* 5维与8维切换按钮 - 移到顶部 */}
      {enhancedData && (
        <div className="flex justify-end">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <span className={!showEnhancedView ? 'text-primary font-medium' : ''}>5维</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEnhancedView(!showEnhancedView)}
                className="mx-1 p-1 h-auto"
              >
                {showEnhancedView ? (
                  <ToggleRight className="h-5 w-5 text-primary" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              <span className={showEnhancedView ? 'text-primary font-medium' : ''}>8维</span>
            </div>
            <div className="flex items-center gap-1">
              {showEnhancedView && <Star className="h-4 w-4 text-yellow-500" />}
              <span className="text-xs text-muted-foreground">
                {showEnhancedView ? '深度视图' : '基础视图'}
              </span>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        
        {profileData.coreEnergyInsights && (
            renderCustomTitledSection(
                'energyExplorationPage.userProfile.coreEnergyInsightsTitle',
                profileData.coreEnergyInsights,
                Lightbulb,
                false,
                'text-base' 
            )
        )}

        {/* 能量与灵性方面板块已隐藏 */}
        {/* 
        <Card className="bg-background shadow-inner">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Lightbulb className="mr-2 h-6 w-6 text-accent" /> 
              {t('energyExplorationPage.userProfile.energeticSpiritualTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm pt-4">
            {renderCustomTitledSection(
                'energyExplorationPage.userProfile.mbtiTitleSkipped', 
                profileData.mbtiLikeType,
                Brain,
                mbtiSkipped
            )}
            {renderCustomTitledSection(
                'energyExplorationPage.userProfile.chakraTitleSkipped', 
                profileData.chakraAnalysis,
                ChakraIconUi,
                chakraSkipped
            )}
            {renderCustomTitledSection(
                'energyExplorationPage.userProfile.elementPlanetTitle',
                finalElementPlanetDescription,
                ElementIconUi,
                isElementPlanetSectionSkipped
            )}
          </CardContent>
        </Card>
        */}
        
        {profileData.recommendedCrystals && profileData.recommendedCrystals.length > 0 && (
          <Card className="bg-background shadow-inner">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Sparkles className="mr-2 h-6 w-6 text-accent" />
                {t('energyExplorationPage.userProfile.recommendedCrystalsTitle')}
              </CardTitle>
              <CardDescription>
                {t('energyExplorationPage.userProfile.recommendationsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {profileData.recommendedCrystals.map((crystal, index) => (
                <Card key={index} className="p-4 bg-card/50 shadow">
                  <CardHeader className="p-0 pb-2 mb-2 border-b">
                    <CardTitle className="text-lg text-primary">{crystal.name}</CardTitle>
                    {crystal.matchScore && (
                        <Badge variant="secondary" className="mt-1 w-fit">
                        {t('energyExplorationPage.userProfile.matchScore', { score: Math.round(crystal.matchScore * 10) })}
                        </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="p-0 space-y-3">
                    {(Object.keys(crystal.reasoningDetails) as Array<keyof CrystalReasoningDetails>).map(reasonKey => {
                       const ReasoningIcon = reasoningIcons[reasonKey];
                       return (
                        <div key={reasonKey}>
                            <h5 className="font-semibold text-sm text-foreground/90 flex items-center">
                                {ReasoningIcon && <ReasoningIcon className="mr-1.5 h-4 w-4 text-muted-foreground" />}
                                {reasoningTitles[reasonKey]}
                            </h5>
                            <FormattedText text={crystal.reasoningDetails[reasonKey]} className="text-xs text-foreground/80 ml-1 pl-4 border-l-2 border-accent/50 my-1" />
                        </div>
                       );
                    })}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {profileData.crystalCombinations && profileData.crystalCombinations.length > 0 && (
          <Card className="bg-background shadow-inner">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Gem className="mr-2 h-5 w-5 text-accent" /> 
                {t('energyExplorationPage.userProfile.crystalHealingTitle')}
              </CardTitle>
               <CardDescription>
                {t('energyExplorationPage.userProfile.crystalHealingDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {profileData.crystalCombinations.map((combo, index) => (
                <div key={index} className="p-3 border rounded-md bg-card/50">
                  <p className="font-medium text-primary">{combo.combination.join(' + ')}</p>
                  <FormattedText text={combo.synergyEffect} className="text-sm text-foreground leading-relaxed" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* 五维能量图谱 - 系统核心能量分析 */}
        <FiveDimensionalEnergyChart 
          profileData={profileData}
          chakraScores={chakraScores}
          className="mt-6"
          physicalAssessment={showEnhancedView ? enhancedData?.physicalAssessment : undefined}
          lifeRhythm={showEnhancedView ? enhancedData?.lifeRhythm : undefined}
          socialAssessment={showEnhancedView ? enhancedData?.socialAssessment : undefined}
          financialEnergyAssessment={showEnhancedView ? enhancedData?.financialEnergyAssessment : undefined}
          emotionalIntelligenceAssessment={showEnhancedView ? enhancedData?.emotionalIntelligenceAssessment : undefined}
        />

        {/* 生活场景水晶指导 */}
        <LifeScenarioGuidance 
          userProfile={profileData}
          className="mt-6"
        />
      </div>
    </div>
  );
};

export default UserProfileDisplay;
