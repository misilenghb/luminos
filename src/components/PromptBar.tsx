"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, Copy, Languages, Check, ImageIcon, Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { translateText } from "@/ai/flows/translate-flow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { buildDrawingPrompts } from "@/lib/prompt-builder";
import { useCreativeWorkshop } from "@/contexts/CreativeWorkshopContext";

interface PromptBarProps {
  prompt: string;
  onPromptChange: (newPrompt: string) => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  isImageMode: boolean;
  onToggleImageMode: () => void;
}

export default function PromptBar({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  isImageMode,
  onToggleImageMode,
}: PromptBarProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { designInput } = useCreativeWorkshop();
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const handleCopyPrompt = async (promptText: string) => {
    setIsCopied(true);
    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(promptText);
        toast({
          title: t('toasts.promptCopiedTitle'),
          description: t('toasts.promptCopiedDesc'),
        });
        setTimeout(() => setIsCopied(false), 2000);
        return;
      } catch (error) {
        console.error('使用 Clipboard API 复制失败, 尝试备用方法:', error);
      }
    }

    // 备用复制方法
    const textarea = document.createElement('textarea');
    textarea.value = promptText;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast({
        title: t('toasts.promptCopiedTitle'),
        description: t('toasts.promptCopiedDesc'),
      });
    } catch (err) {
      console.error('备用复制方法失败:', err);
      toast({
        variant: "destructive",
        title: t('toasts.promptCopyErrorTitle'),
        description: t('toasts.promptCopyErrorDesc'),
      });
    } finally {
      document.body.removeChild(textarea);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleTranslate = async () => {
    if (!prompt) return;
    setIsTranslating(true);
    try {
      const result = await translateText({ text: prompt, targetLanguage: 'Chinese' });
      onPromptChange(result.translatedText);
      toast({
        title: t('toasts.translationSuccessTitle'),
        description: t('toasts.translationSuccessDesc'),
      });
    } catch (error) {
      console.error("Translation failed:", error);
      toast({
        variant: "destructive",
        title: t('toasts.translationFailedTitle'),
        description: t('toasts.translationFailedDesc'),
      });
    } finally {
      setIsTranslating(false);
    }
  };

  // 生成基于当前参数的默认提示词
  const getDefaultPrompts = () => {
    try {
      return buildDrawingPrompts(designInput);
    } catch (error) {
      console.error('Error building default prompts:', error);
      return { en: '', zh: '' };
    }
  };

  const defaultPrompts = getDefaultPrompts();
  const currentDefaultPrompt = language === 'zh' ? defaultPrompts.zh : defaultPrompts.en;

  const handleUseDefaultPrompt = () => {
    onPromptChange(currentDefaultPrompt);
    setShowPromptPreview(false);
    toast({
      title: '已应用默认提示词',
      description: '基于当前设计参数生成的提示词已填入输入框',
    });
  };

  const handleCopyDefaultPrompt = (promptText: string) => {
    navigator.clipboard.writeText(promptText);
    toast({
      title: '提示词已复制',
      description: '默认提示词已复制到剪贴板',
    });
  };

  return (
    <div className="bg-card p-3 rounded-2xl shadow-lg border w-full flex items-center gap-2">
      <Textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder={t('promptInputBar.placeholder')}
        className="flex-grow resize-none border-0 shadow-none focus-visible:ring-0 text-base bg-transparent"
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isGenerating && prompt) {
              onGenerate(prompt);
            }
          }
        }}
      />
      
      {/* 提示词预览按钮 */}
      <Dialog open={showPromptPreview} onOpenChange={setShowPromptPreview}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" title="查看基于参数的默认提示词">
            <Eye className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>基于当前参数的默认提示词</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">中文提示词</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopyPrompt(defaultPrompts.zh)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      onPromptChange(defaultPrompts.zh);
                      setShowPromptPreview(false);
                    }}
                  >
                    使用此提示词
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                {defaultPrompts.zh || '无法生成提示词，请检查参数设置'}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">English Prompt</h4>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopyPrompt(defaultPrompts.en)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      onPromptChange(defaultPrompts.en);
                      setShowPromptPreview(false);
                    }}
                  >
                    Use This Prompt
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                {defaultPrompts.en || 'Unable to generate prompt, please check parameter settings'}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground">
              <p><strong>应用平台:</strong> {designInput.applicationPlatform || 'flux'}</p>
              <p><strong>设计类别:</strong> {designInput.designCategory || 'bracelet'}</p>
              <p><strong>整体风格:</strong> {designInput.overallDesignStyle || 'elegant'}</p>
              <p><strong>图像风格:</strong> {designInput.imageStyle || 'style_photo_realistic'}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button variant="ghost" size="icon" onClick={() => handleCopyPrompt(prompt)} disabled={!prompt} title={t('promptInputBar.copy')}>
        {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={handleTranslate} disabled={isTranslating || !prompt} title={t('promptInputBar.translate')}>
        {isTranslating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Languages className="h-5 w-5" />}
      </Button>
      <Button
        variant={isImageMode ? 'destructive' : 'ghost'}
        size="icon"
        onClick={onToggleImageMode}
        title={t('promptInputBar.imageMode')}
      >
        <ImageIcon className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        onClick={() => onGenerate(prompt)}
        disabled={isGenerating || !prompt}
        aria-label={t('promptInputBar.generate')}
      >
        {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowRight className="h-6 w-6" />}
      </Button>
    </div>
  );
}
