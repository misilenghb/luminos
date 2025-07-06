"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Sparkles, Copy, Check, Save, Heart, BookOpen } from 'lucide-react';
import type { DesignSuggestionsOutput } from '@/ai/schemas/design-schemas';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import { Skeleton } from './ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import Link from 'next/link';

interface GeneratedSuggestionsProps {
  suggestions: DesignSuggestionsOutput | null;
  isLoading?: boolean;
  designInput?: any; // 原始设计输入数据
}

const FormattedText: React.FC<{ text?: string; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  return (
    <>
      {text.split('\n\n').map((paragraph, pIndex) => (
        <p key={`p-${pIndex}`} className={`mb-2 last:mb-0 ${className || ''}`}>
          {paragraph.split('\n').map((line, lIndex) => {
            if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              return (
                <span key={`l-${lIndex}`} className="block ml-4 list-item" style={{ listStyleType: 'disc', listStylePosition: 'inside', textIndent: '-1.5em', paddingLeft: '1.5em' }}>
                  {line.trim().substring(2)}
                </span>
              );
            }
            return (
              <React.Fragment key={`l-${lIndex}`}>
                {line}
                {lIndex < paragraph.split('\n').length - 1 && <br />}
              </React.Fragment>
            );
          })}
        </p>
      ))}
    </>
  );
};

// 自动重试+手动重试AI图片组件
function AIImage({ src, alt, width = 256, height = 256, maxRetry = 5 }: { src: string; alt: string; width?: number; height?: number; maxRetry?: number }) {
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  const handleError = () => {
    if (retry < maxRetry - 1) {
      setTimeout(() => setRetry(r => r + 1), 3000);
    } else {
      setError(true);
    }
  };

  const handleManualRetry = () => {
    setError(false);
    setRetry(0);
  };

  if (error) {
    return (
      <div style={{ width, height, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexDirection: 'column' }}>
        <span style={{ color: '#d32f2f', fontWeight: 600, marginBottom: 8 }}>图片生成失败</span>
        <button onClick={handleManualRetry} style={{ color: '#1976d2', cursor: 'pointer', border: 'none', background: 'none' }}>点击重试</button>
      </div>
    );
  }

  return (
    <Image
      key={retry}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes="100vw"
      onError={handleError}
      style={{ objectFit: 'cover', borderRadius: 8 }}
    />
  );
}

const GeneratedSuggestions: React.FC<GeneratedSuggestionsProps> = ({ suggestions, isLoading, designInput }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedDesigns, setSavedDesigns] = useState<Set<number>>(new Set());

  const handleCopyPrompt = async (prompt: string) => {
    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(prompt);
        setCopiedPrompt(prompt);
        toast({
          title: t('toasts.promptCopiedTitle'),
          description: t('toasts.promptCopiedDesc'),
        });
        setTimeout(() => setCopiedPrompt(null), 2000);
        return;
      } catch (error) {
        console.error('使用 Clipboard API 复制失败, 尝试备用方法:', error);
      }
    }

    // 备用复制方法
    const textarea = document.createElement('textarea');
    textarea.value = prompt;
    textarea.style.position = 'fixed'; // 避免页面滚动
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      setCopiedPrompt(prompt);
      toast({
        title: t('toasts.promptCopiedTitle'),
        description: t('toasts.promptCopiedDesc'),
      });
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      console.error('备用复制方法失败:', err);
      toast({
        variant: "destructive",
        title: t('toasts.promptCopyErrorTitle'),
        description: t('toasts.promptCopyErrorDesc'),
      });
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleSaveDesign = async (schemeIndex: number, scheme: any) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "需要登录",
        description: "请先登录以保存设计作品到您的作品集",
        variant: "destructive"
      });
      return;
    }

    if (savedDesigns.has(schemeIndex)) {
      toast({
        title: "已保存",
        description: "该设计方案已经保存到您的作品集中",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // 准备保存的数据
      const saveData = {
        title: scheme.schemeTitle || `简易设计方案 ${schemeIndex + 1}`,
        description: [
          scheme.mainStoneDescription,
          scheme.auxiliaryStonesDescription,
          scheme.chainOrStructureDescription,
          scheme.otherDetails
        ].filter(Boolean).join('\n\n'),
        prompt: scheme.imageGenerationPrompt,
        imageUrl: `https://via.placeholder.com/400x300/e2e8f0/64748b?text=${encodeURIComponent(scheme.schemeTitle || '设计方案')}`, // 占位图片
        style: designInput?.overallDesignStyle || 'simple',
        category: designInput?.designCategory || 'jewelry',
        crystalsUsed: designInput?.mainCrystal1 ? [
          designInput.mainCrystal1,
          designInput.mainCrystal2
        ].filter(Boolean) : [],
        colors: designInput?.mainCrystal1Color ? [
          designInput.mainCrystal1Color,
          designInput.mainCrystal2Color
        ].filter(Boolean) : [],
        tags: ['简易设计', designInput?.designCategory, designInput?.overallDesignStyle].filter(Boolean),
        generationParams: {
          inputData: designInput,
          aiSuggestions: suggestions,
          schemeIndex: schemeIndex
        },
        aiAnalysis: {
          conceptDescription: suggestions?.designConcept,
          personalizedIntro: suggestions?.personalizedIntroduction,
          concludingRemarks: suggestions?.concludingRemarks
        },
        isPublic: false // 默认不公开设计
      };

      const response = await fetch('/api/save-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSavedDesigns(prev => new Set([...prev, schemeIndex]));
        toast({
          title: "保存成功 ✨",
          description: (
            <div className="flex items-center gap-2">
              <span>设计作品已保存到您的作品集</span>
              <Link href="/gallery" className="text-primary hover:underline font-medium">
                立即查看
              </Link>
            </div>
          ),
        });
      } else {
        throw new Error(result.error || '保存失败');
      }
    } catch (error) {
      console.error('保存设计失败:', error);
      toast({
        title: "保存失败",
        description: error instanceof Error ? error.message : "保存设计作品时发生错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full shadow-xl">
        <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-16 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-24 w-full" />
            </div>
        </CardContent>
      </Card>
    )
  }

  if (!suggestions) return null;
  
  const { 
    personalizedIntroduction, 
    designConcept, 
    designSchemes, 
    accessorySuggestions, 
    photographySettingSuggestions, 
    concludingRemarks 
  } = suggestions;

  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Lightbulb className="mr-3 h-7 w-7 text-accent" />
            {t('generatedSuggestions.title')}
          </CardTitle>
          <CardDescription>{t('generatedSuggestions.description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {personalizedIntroduction && (
            <div className="p-4 bg-muted/50 rounded-md border shadow-sm">
              <FormattedText text={personalizedIntroduction} className="text-lg italic text-primary" />
            </div>
          )}
          
          {designConcept && (
            <div className="p-4 bg-card/50 rounded-md border shadow-inner">
              <h3 className="text-xl font-semibold text-primary mb-2">
                {t('creativeWorkshopForm.designDetailsTitle')}
              </h3>
              <FormattedText text={designConcept} />
            </div>
          )}
          
          {designSchemes?.length > 0 && (
            <div className="space-y-6">
              {designSchemes.map((scheme, index) => (
                <Card key={index} className="p-4 md:p-6 bg-muted/50 shadow-md">
                  <CardHeader className="p-0 pb-3 mb-3 border-b border-primary/30">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center text-xl text-primary">
                        <Sparkles className="mr-2 h-5 w-5" />
                        {scheme.schemeTitle}
                      </CardTitle>
                      {isAuthenticated && (
                        <Button
                          onClick={() => handleSaveDesign(index, scheme)}
                          disabled={isSaving || savedDesigns.has(index)}
                          variant={savedDesigns.has(index) ? "secondary" : "default"}
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          {savedDesigns.has(index) ? (
                            <>
                              <Check className="h-4 w-4" />
                              已保存
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              {isSaving ? '保存中...' : '保存设计'}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground/90">主石描述</h4>
                      <FormattedText text={scheme.mainStoneDescription} className="text-sm" />
                    </div>
                    {scheme.auxiliaryStonesDescription && (
                      <div>
                        <h4 className="font-semibold text-foreground/90">辅助宝石描述</h4>
                        <FormattedText text={scheme.auxiliaryStonesDescription} className="text-sm" />
                      </div>
                    )}
                    {scheme.chainOrStructureDescription && (
                      <div>
                        <h4 className="font-semibold text-foreground/90">结构描述</h4>
                        <FormattedText text={scheme.chainOrStructureDescription} className="text-sm" />
                      </div>
                    )}
                    {scheme.otherDetails && (
                      <div>
                        <h4 className="font-semibold text-foreground/90">细节描述</h4>
                        <FormattedText text={scheme.otherDetails} className="text-sm" />
                      </div>
                    )}
                    {scheme.imageGenerationPrompt && (
                      <div className="pt-3 border-t mt-2">
                        <h4 className="font-semibold text-foreground/90 mb-1">图片生成提示词（英文）:</h4>
                        <p className="text-xs font-mono bg-background p-2 rounded-md text-muted-foreground break-all">
                          {scheme.imageGenerationPrompt}
                        </p>
                        <Button 
                          className="w-full mt-3" 
                          onClick={() => handleCopyPrompt(scheme.imageGenerationPrompt)}
                        >
                          {copiedPrompt === scheme.imageGenerationPrompt ? (
                            <Check className="mr-2 h-4 w-4" />
                          ) : (
                            <Copy className="mr-2 h-4 w-4"/>
                          )}
                          {copiedPrompt === scheme.imageGenerationPrompt ? t('toasts.promptCopiedTitle') : t('promptInputBar.copy')}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {accessorySuggestions && (
            <div className="p-4 bg-card/50 rounded-md border shadow-inner">
              <h3 className="text-xl font-semibold text-primary mb-2">
                {t('creativeWorkshopForm.accessoriesSystemTitle')}
              </h3>
              <FormattedText text={accessorySuggestions} />
            </div>
          )}
          
          {photographySettingSuggestions && (
            <div className="p-4 bg-card/50 rounded-md border shadow-inner">
              <h3 className="text-xl font-semibold text-primary mb-2">
                {t('creativeWorkshopForm.photographySettingsTitle')}
              </h3>
              <FormattedText text={photographySettingSuggestions} />
            </div>
          )}
          
          {concludingRemarks && (
            <div className="p-4 bg-muted/50 rounded-md border shadow-sm mt-6">
              <FormattedText text={concludingRemarks} className="italic" />
            </div>
          )}

          {/* 底部行动提示 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-purple-500" />
                <div>
                  <h4 className="font-medium text-foreground">喜欢这些设计吗？</h4>
                  <p className="text-sm text-muted-foreground">
                    {isAuthenticated 
                      ? '保存您喜欢的设计方案到作品集，随时回顾创作灵感'
                      : '登录后即可保存设计方案到个人作品集'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/gallery">
                    <BookOpen className="h-4 w-4 mr-1" />
                    我的作品集
                  </Link>
                </Button>
                {!isAuthenticated && (
                  <Button size="sm" asChild>
                    <Link href="/login">
                      立即登录
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratedSuggestions;
