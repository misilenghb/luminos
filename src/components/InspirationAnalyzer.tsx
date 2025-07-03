"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import React from 'react';

interface InspirationAnalyzerProps {
  onAnalyze: (photoDataUri: string) => Promise<void>;
}

const InspirationAnalyzer: React.FC<InspirationAnalyzerProps> = ({ onAnalyze }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 4 * 1024 * 1024) { 
        setError(t('inspirationAnalyzer.errorFileSize'));
        setFile(null);
        setPreview(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
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
    setIsLoading(true);
    setError(null);
    try {
      await onAnalyze(preview); 
    } catch (err) {
      console.error("Error analyzing image:", err);
      setError(err instanceof Error ? err.message : t('inspirationAnalyzer.unknownError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="space-y-4 flex-grow">
        <div>
          <label htmlFor="imageUpload" className="block text-sm font-medium text-foreground mb-1">
            {t('inspirationAnalyzer.uploadLabel')}
          </label>
          <Input
            id="imageUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:text-primary file:font-semibold hover:file:bg-primary/10"
          />
        </div>

        {preview && (
          <div className="mt-4 border border-dashed border-border rounded-lg p-4 flex justify-center items-center bg-muted/30">
            <Image src={preview} alt="Image preview" width={200} height={200} className="max-h-48 w-auto rounded-md object-contain" data-ai-hint="inspiration image" />
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>{t('inspirationAnalyzer.errorTitle')}</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="mt-auto">
        <Button onClick={handleSubmit} disabled={!file || isLoading} className="w-full text-base py-3">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {t('inspirationAnalyzer.analyzingButton')}
            </>
          ) : (
            t('inspirationAnalyzer.analyzeButton')
          )}
        </Button>
      </div>
    </div>
  );
};

export default InspirationAnalyzer;
