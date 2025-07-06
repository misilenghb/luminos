"use client";

import React, { useState } from 'react';
import { Loader2, AlertCircle, Download, Share2, Save, MoreHorizontal, Sparkles, Send, Copy, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';

interface DesignPreviewProps {
  isGenerating?: boolean;
  imageUrls: string[] | null;
  error: string | null;
  prompt: string;
  onSave: (imageUrl: string, prompt: string) => Promise<void>;
  onRefine: (baseImage: string, refinePrompt: string, originalPrompt: string) => Promise<void>;
  onGenerateSimilar: (prompt: string) => Promise<void>;
  onEnhance: (baseImage: string, originalPrompt: string) => Promise<void>;
}

// 用于确保图片URL未被encode
function safeImageUrl(url: string) {
  try {
    // 如果包含转义字符，自动decode
    if (url.includes('%3A') || url.includes('%2F')) {
      return decodeURIComponent(url);
    }
    return url;
  } catch {
    return url;
  }
}

// 自动重试+手动重试AI图片组件 - 专门处理Pollinations API的504超时问题
function AIImage({ src, alt, className, onError, onLoad }: { 
  src: string; 
  alt: string; 
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const maxRetry = 8; // 增加重试次数，因为图片生成需要更长时间

  const handleError = () => {
    setLoading(false);
    if (retry < maxRetry - 1) {
      // 递增延迟重试：第一次3秒，第二次6秒，第三次9秒...
      const delay = (retry + 1) * 3000;
      setTimeout(() => {
        setRetry(r => r + 1);
        setLoading(true);
      }, delay);
    } else {
      setError(true);
      onError?.();
    }
  };

  const handleManualRetry = () => {
    setError(false);
    setLoading(true);
    setRetry(0);
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    onLoad?.();
  };

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-muted/50 border-2 border-dashed border-muted-foreground/25 rounded-lg ${className}`}>
        <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
        <span className="text-sm font-medium text-muted-foreground mb-2">图片生成超时</span>
        <Button variant="outline" size="sm" onClick={handleManualRetry} className="text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          重新加载
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">生成中...</span>
            {retry > 0 && (
              <span className="text-xs text-muted-foreground">重试 {retry}/{maxRetry}</span>
            )}
          </div>
        </div>
      )}
      <Image
        key={retry} // 强制重新渲染
        src={safeImageUrl(src)}
        alt={alt}
        fill
        className="object-contain transition-opacity duration-300"
        style={{ opacity: loading ? 0 : 1 }}
        onError={handleError}
        onLoad={handleLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

const DesignPreview: React.FC<DesignPreviewProps> = ({ isGenerating, imageUrls, error, prompt, onSave, onRefine, onGenerateSimilar, onEnhance }) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refinementPrompt, setRefinementPrompt] = useState("");

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `crystal_design_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        // 对于跨域图片，使用mode: 'cors'来处理
        const response = await fetch(imageUrl, { mode: 'cors' });
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        const file = new File([blob], `crystal_design_${Date.now()}.png`, { type: 'image/png' });

        await navigator.share({ title: t('galleryPage.shareTitle'), text: t('galleryPage.shareText'), files: [file] });
      } catch (err) {
        if (err && typeof err === 'object' && 'name' in err && err.name === 'AbortError') return;
        console.error('Share failed:', err);
        // 如果获取图片失败，尝试分享URL
        try {
          await navigator.share({ 
            title: t('galleryPage.shareTitle'), 
            text: t('galleryPage.shareText'), 
            url: imageUrl 
          });
        } catch (urlShareErr) {
          console.error('URL share also failed:', urlShareErr);
          toast({ variant: 'destructive', title: t('galleryPage.shareErrorTitle'), description: t('toasts.unknownError') });
        }
      }
    } else {
      // 如果不支持Web Share API，复制URL到剪贴板
      try {
        await navigator.clipboard.writeText(imageUrl);
        toast({ title: t('galleryPage.linkCopiedTitle'), description: t('galleryPage.linkCopiedDesc') });
      } catch (clipErr) {
        console.error('Clipboard copy failed:', clipErr);
        toast({ title: t('galleryPage.shareNotSupportedTitle'), description: t('galleryPage.shareNotSupportedDesc') });
      }
    }
  };
  
  const handleSaveClick = async (imageUrl: string) => {
    setIsSaving(true);
    await onSave(imageUrl, prompt);
    setIsSaving(false);
  };
  
  const handleRefineClick = async (imageUrl: string) => {
      if (!refinementPrompt) {
          toast({ variant: 'destructive', title: t('designPreview.promptEmptyTitle'), description: t('designPreview.promptEmptyDesc') });
          return;
      }
      setIsRefining(true);
      await onRefine(imageUrl, refinementPrompt, prompt);
      setIsRefining(false);
      setSelectedImage(null); // Close dialog
  };

  const handleGenerateVariations = async () => {
    await onGenerateSimilar(prompt);
    setSelectedImage(null);
  }

  const handleEnhanceImage = async (imageUrl: string) => {
    await onEnhance(imageUrl, prompt);
    setSelectedImage(null);
  }

  const handleCopyImageUrl = async (imageUrl: string) => {
    // 优先使用 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(imageUrl);
        toast({
          title: t('toasts.imageLinkCopiedTitle'),
          description: t('toasts.imageLinkCopiedDesc'),
        });
        return;
      } catch (error) {
        console.error('使用 Clipboard API 复制失败, 尝试备用方法:', error);
      }
    }

    // 备用复制方法
    const textarea = document.createElement('textarea');
    textarea.value = imageUrl;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      toast({
        title: t('toasts.imageLinkCopiedTitle'),
        description: t('toasts.imageLinkCopiedDesc'),
      });
    } catch (err) {
      console.error('备用复制方法失败:', err);
      toast({
        variant: "destructive",
        title: t('toasts.imageLinkCopyErrorTitle'),
        description: t('toasts.imageLinkCopyErrorDesc'),
      });
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const renderContent = () => {
    if (isGenerating) {
      return (
        <div className="w-full h-full p-2">
          <Skeleton className="w-full h-full rounded-md" />
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-destructive p-4">
          <AlertCircle className="h-12 w-12" />
          <p className="text-lg text-center">{t('designPreview.generationError')}</p>
           <p className="text-sm text-center text-muted-foreground">{error}</p>
        </div>
      );
    }
    
    if (imageUrls && imageUrls.length > 0) {
      // If only one image, show it large
      if (imageUrls.length === 1) {
        const url = imageUrls[0];
        return (
          <div className="w-full h-full p-2">
            <div
              className="relative w-full h-full rounded-md overflow-hidden bg-muted/30 cursor-pointer group"
              onClick={() => setSelectedImage(url)}
            >
              <AIImage src={url} alt={prompt} className="w-full h-full" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <MoreHorizontal className="text-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        );
      }
      // If multiple images, show a grid
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-2 w-full h-full p-2">
            {imageUrls.map((url, index) => (
              <div
                key={index}
                className="relative w-full h-full rounded-md overflow-hidden bg-muted/30 cursor-pointer group"
                onClick={() => setSelectedImage(url)}
              >
                <AIImage src={url} alt={`${prompt} ${index + 1}`} className="w-full h-full" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <MoreHorizontal className="text-white h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <div className="w-full h-full bg-card rounded-lg flex items-center justify-center overflow-hidden border border-border shadow-inner relative aspect-video">
        {renderContent()}
        <Dialog open={!!selectedImage} onOpenChange={(open) => { if (!open) setSelectedImage(null); }}>
          {selectedImage && (
              <DialogContent className="max-w-4xl h-[90vh] p-0 border-0 flex flex-col items-stretch">
                  <DialogHeader className="sr-only">
                    <DialogTitle>{t('galleryPage.imagePreviewTitle')}</DialogTitle>
                  </DialogHeader>
                  <div className="relative flex-grow my-4">
                      <AIImage src={selectedImage} alt={prompt} className="w-full h-full" />
                  </div>
                   <div className="flex-shrink-0 p-4 bg-background border-t space-y-4">
                       <div className="flex items-center gap-2">
                          <Input value={refinementPrompt} onChange={(e) => setRefinementPrompt(e.target.value)} placeholder={t('designPreview.refinePlaceholder')} disabled={isRefining} />
                          <Button onClick={() => handleRefineClick(selectedImage)} disabled={isRefining || !refinementPrompt}>
                              {isRefining ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4"/>}
                              <span className="hidden sm:inline ml-2">{t('designPreview.editButton')}</span>
                          </Button>
                       </div>
                       <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" onClick={handleGenerateVariations}><Copy className="mr-2"/>{t('designPreview.variationsButton')}</Button>
                          <Button variant="outline" onClick={() => handleEnhanceImage(selectedImage)}><Sparkles className="mr-2"/>{t('designPreview.enhanceButton')}</Button>
                       </div>
                       <p className="text-xs text-muted-foreground line-clamp-2"><span className="font-semibold">{t('designPreview.originalPromptLabel')}</span> {prompt}</p>
                   </div>
                  <div className="absolute top-4 right-14 flex items-center gap-2 bg-black/50 p-1.5 rounded-full">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full" onClick={() => handleSaveClick(selectedImage)} disabled={isSaving}>{isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}</Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full" onClick={() => handleDownload(selectedImage)}><Download className="h-5 w-5" /></Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white rounded-full" onClick={() => handleShare(selectedImage)}><Share2 className="h-5 w-5" /></Button>
                  </div>
              </DialogContent>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default DesignPreview;
