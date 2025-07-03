"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Lightbulb, Loader2, ScanSearch, BarChartHorizontalBig, Sparkles, Wind, Gem, Brain, Star, Sun, Droplets } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CrystalEnergyReadingInput, CrystalEnergyReadingOutput } from '@/ai/schemas/energy-image-analysis-schemas';
import { analyzeEnergyImage } from '@/ai/flows/energy-image-analysis';
import { useToast } from "@/hooks/use-toast";
import React from 'react';


// Helper to render text with preserved newlines and basic list formatting
const FormattedText: React.FC<{ text?: string; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  return (
    <>
      {text.split('\n\n').map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className={`mb-2 last:mb-0 ${className || ''}`}>
          {paragraph.split('\n').map((line, lIndex) => {
             if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              return (
                <span key={`l-${lIndex}`} className="block ml-4" style={{ textIndent: '-1em' }}>
                  {line}
                </span>
              );
            }
            return (
            <React.Fragment key={`l-${lIndex}`}>
              {line}
              {lIndex < paragraph.split('\n').length - 1 && <br />}
            </React.Fragment>
          )})}
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


const EnergyImageAnalyzer: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [crystalTypes, setCrystalTypes] = useState('');
  const [analysisResult, setAnalysisResult] = useState<CrystalEnergyReadingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { // 4MB limit
        setError(t('energyExplorationPage.imageAnalyzer.errorFileSize'));
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setAnalysisResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || !preview) {
      setError(t('inspirationAnalyzer.errorNoFile')); 
      return;
    }
     if (!crystalTypes.trim()) {
      setError(t('energyExplorationPage.imageAnalyzer.errorNoCrystals'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const input: CrystalEnergyReadingInput = {
        photoDataUri: preview,
        crystalTypes: crystalTypes,
        language: language
      };
      const result = await analyzeEnergyImage(input);
      setAnalysisResult(result);
      toast({
        title: t('toasts.energyImageAnalysisCompleteTitle'),
        description: t('toasts.energyImageAnalysisCompleteDesc'),
      });

    } catch (err) {
      console.error("Error analyzing crystal energy:", err);
      const errorMessage = err instanceof Error ? err.message : t('toasts.unknownError');
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: t('toasts.errorAnalyzingEnergyImageTitle'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <ScanSearch className="mr-3 h-7 w-7 text-accent" />
          {t('energyExplorationPage.imageAnalyzer.title')}
        </CardTitle>
        <CardDescription>
          {t('energyExplorationPage.imageAnalyzer.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="crystalTypesInput" className="mb-1 block">
              {t('energyExplorationPage.imageAnalyzer.crystalTypesLabel')}
            </Label>
            <Input
              id="crystalTypesInput"
              value={crystalTypes}
              onChange={(e) => setCrystalTypes(e.target.value)}
              placeholder={t('energyExplorationPage.imageAnalyzer.crystalTypesPlaceholder')}
            />
          </div>
          <div>
            <Label htmlFor="imageUploadEnergy" className="block mb-1">
              {t('energyExplorationPage.imageAnalyzer.uploadLabel')}
            </Label>
            <Input
              id="imageUploadEnergy"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file:text-primary file:font-semibold hover:file:bg-primary/10"
            />
          </div>
        </div>

        {preview && (
          <div className="mt-4 border border-dashed border-border rounded-lg p-4 flex justify-center items-center bg-muted/30">
            <Image src={preview} alt={t('energyExplorationPage.imageAnalyzer.title')} width={200} height={200} className="max-h-64 w-auto rounded-md object-contain" data-ai-hint="energy analysis" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t('inspirationAnalyzer.errorTitle')}</AlertTitle> 
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <Card className="mt-6 bg-background shadow-inner">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                {t('energyExplorationPage.imageAnalyzer.resultsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Section title={t('common.summary')} icon={Sparkles}>
                <FormattedText text={analysisResult.holisticSummary} />
              </Section>
              <Section title={t('energyExplorationPage.imageAnalyzer.results.energyField')} icon={Wind}>
                <FormattedText text={analysisResult.energyFieldAnalysis} />
              </Section>
              <Section title={t('energyExplorationPage.imageAnalyzer.results.chakraAnalysis')} icon={BarChartHorizontalBig}>
                <FormattedText text={analysisResult.chakraAnalysis} />
              </Section>
              <Section title={t('energyExplorationPage.imageAnalyzer.results.metaphysicalAssociations')} icon={Gem}>
                 <div className="space-y-4">
                    <div>
                        <h5 className="font-semibold flex items-center text-sm mb-1"><Star className="mr-1.5 h-4 w-4 text-muted-foreground" />{t('energyExplorationPage.imageAnalyzer.results.zodiac')}</h5>
                        <FormattedText text={analysisResult.metaphysicalAssociations.zodiacSigns} className="text-xs ml-6"/>
                    </div>
                    <div>
                        <h5 className="font-semibold flex items-center text-sm mb-1"><Sun className="mr-1.5 h-4 w-4 text-muted-foreground" />{t('energyExplorationPage.imageAnalyzer.results.westernElements')}</h5>
                        <FormattedText text={analysisResult.metaphysicalAssociations.westernElements} className="text-xs ml-6"/>
                    </div>
                     <div>
                        <h5 className="font-semibold flex items-center text-sm mb-1"><Droplets className="mr-1.5 h-4 w-4 text-muted-foreground" />{t('energyExplorationPage.imageAnalyzer.results.fiveElements')}</h5>
                        <FormattedText text={analysisResult.metaphysicalAssociations.fiveElements} className="text-xs ml-6"/>
                    </div>
                     <div>
                        <h5 className="font-semibold flex items-center text-sm mb-1"><Brain className="mr-1.5 h-4 w-4 text-muted-foreground" />{t('energyExplorationPage.imageAnalyzer.results.mbtiProfile')}</h5>
                        <FormattedText text={analysisResult.metaphysicalAssociations.mbtiProfile} className="text-xs ml-6"/>
                    </div>
                 </div>
              </Section>
            </CardContent>
          </Card>
        )}
         {!analysisResult && !isLoading && !error && preview && (
            <div className="text-center text-muted-foreground p-4">
                {t('energyExplorationPage.imageAnalyzer.noResults')}
            </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!file || !crystalTypes.trim() || isLoading} className="w-full text-base py-3">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('energyExplorationPage.imageAnalyzer.analyzingButton')}
            </>
          ) : (
            t('energyExplorationPage.imageAnalyzer.analyzeButton')
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnergyImageAnalyzer;
