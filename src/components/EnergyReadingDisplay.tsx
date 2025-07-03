
"use client";

import type { EnergyReadingWithId } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Gem, Sparkles, Brain, BarChartHorizontalBig, Wind, Star, Sun, Droplets, Lightbulb } from "lucide-react";
import React from 'react';

interface EnergyReadingDisplayProps {
  readingData: EnergyReadingWithId | null;
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

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div>
    <h4 className="font-semibold text-lg text-primary flex items-center mb-2">
      <Icon className="mr-2 h-5 w-5" />
      {title}
    </h4>
    <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed p-3 bg-card rounded-md border">
      {children}
    </div>
  </div>
);

const EnergyReadingDisplay: React.FC<EnergyReadingDisplayProps> = ({ readingData }) => {
  const { t } = useLanguage();

  if (!readingData) {
    return null;
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Lightbulb className="mr-3 h-7 w-7 text-primary" />
          {t('energyExplorationPage.imageAnalyzer.resultsTitle')}
        </CardTitle>
        <CardDescription>
          {readingData.createdAt ? t('galleryPage.profileCard.date', { date: new Date(readingData.createdAt).toLocaleDateString() }) : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Section title={t('common.summary')} icon={Sparkles}>
          <FormattedText text={readingData.holisticSummary} />
        </Section>
        <Section title={t('energyExplorationPage.imageAnalyzer.results.energyField')} icon={Wind}>
          <FormattedText text={readingData.energyFieldAnalysis} />
        </Section>
        <Section title={t('energyExplorationPage.imageAnalyzer.results.chakraAnalysis')} icon={BarChartHorizontalBig}>
          <FormattedText text={readingData.chakraAnalysis} />
        </Section>
        <Section title={t('energyExplorationPage.imageAnalyzer.results.metaphysicalAssociations')} icon={Gem}>
          <div className="space-y-4">
            <div>
              <h5 className="font-semibold flex items-center text-sm mb-1"><Star className="mr-1.5 h-4 w-4 text-muted-foreground" />{t('energyExplorationPage.imageAnalyzer.results.zodiac')}</h5>
              <FormattedText text={readingData.metaphysicalAssociations.zodiacSigns} className="text-xs ml-6" />
            </div>
            <div>
              <h5 className="font-semibold flex items-center text-sm mb-1"><Sun className="mr-1.5 h-4 w-4 text-muted-foreground" />{t('energyExplorationPage.imageAnalyzer.results.westernElements')}</h5>
              <FormattedText text={readingData.metaphysicalAssociations.westernElements} className="text-xs ml-6" />
            </div>
            <div>
              <h5 className="font-semibold flex items-center text-sm mb-1"><Droplets className="mr-1.5 h-4 w-4 text-muted-foreground" />{t('energyExplorationPage.imageAnalyzer.results.fiveElements')}</h5>
              <FormattedText text={readingData.metaphysicalAssociations.fiveElements} className="text-xs ml-6" />
            </div>
            <div>
              <h5 className="font-semibold flex items-center text-sm mb-1"><Brain className="mr-1.5 h-4 w-4 text-muted-foreground" />{t('energyExplorationPage.imageAnalyzer.results.mbtiProfile')}</h5>
              <FormattedText text={readingData.metaphysicalAssociations.mbtiProfile} className="text-xs ml-6" />
            </div>
          </div>
        </Section>
      </CardContent>
    </Card>
  );
};

export default EnergyReadingDisplay;
