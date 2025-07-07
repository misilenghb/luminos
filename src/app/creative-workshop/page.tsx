"use client";

import React, { useRef, useEffect, useState } from 'react';
import CreativeWorkshopParametersSidebar from '@/components/CreativeWorkshopParametersSidebar';
import ParametersSummary from '@/components/ParametersSummary';
import GeneratedSuggestions from '@/components/GeneratedSuggestions';
import PromptBar from '@/components/PromptBar';
import DesignPreview from '@/components/DesignPreview';
import { useCreativeWorkshop } from '@/contexts/CreativeWorkshopContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Wand2, User, RefreshCw, Lightbulb, Images, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function CreativeWorkshopPage() {
  const { 
    history, 
    prompt, 
    setPrompt, 
    isGenerating,
    designInput,
    handleGenerateSuggestions,
    handleSendMessage,
    handleRefineImage,
    handleGenerateSimilar,
    handleEnhance,
    handleSaveImage,
    clearHistory,
    isImageMode,
    toggleImageMode,
    sendInitialGreeting,
  } = useCreativeWorkshop();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const historyEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to send an initial greeting if the user is idle
  useEffect(() => {
    if (history.length === 0) {
      idleTimerRef.current = setTimeout(() => {
        sendInitialGreeting();
      }, 60000); // 1 minute
    }

    // Cleanup function to clear the timer
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [history.length, sendInitialGreeting]);
  
  // Effect to clear the idle timer if the user starts interacting
  useEffect(() => {
    if (prompt || history.length > 0) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    }
  }, [prompt, history.length]);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleSidebarGenerate = async (data: any) => {
    await handleGenerateSuggestions(data);
  };
  
  const renderHistory = () => (
    <>
      {/* 参数摘要 - 只在侧边栏关闭时显示 */}
      {!isSidebarOpen && (
        <ParametersSummary designInput={designInput} className="mb-6" />
      )}
      
      {history.map(item => {
        switch (item.type) {
          case 'suggestions':
            return (
               <div key={item.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 size-9 rounded-full bg-muted flex items-center justify-center">
                  <Wand2 className="size-5 text-muted-foreground" />
                </div>
                <div className="w-full max-w-xl">
                  <GeneratedSuggestions suggestions={item.content} isLoading={item.isLoading} />
                </div>
              </div>
            );
          case 'images':
             if (item.content?.isSaving) {
               return null;
             }
            return (
               <div key={item.id} className="flex items-start gap-4">
                 <div className="flex-shrink-0 size-9 rounded-full bg-muted flex items-center justify-center">
                  <Wand2 className="size-5 text-muted-foreground" />
                </div>
                 <div className="w-full max-w-xl">
                   <DesignPreview prompt={item.content?.prompt} imageUrls={item.content?.imageUrls} error={item.content?.error} isGenerating={item.isLoading} onSave={handleSaveImage} onRefine={handleRefineImage} onGenerateSimilar={handleGenerateSimilar} onEnhance={handleEnhance} />
                 </div>
              </div>
            );
          case 'user-prompt':
            return (
               <div key={item.id} className="flex items-start gap-3 justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xl order-1">
                  <p className="text-sm">{item.content}</p>
                </div>
                <div className="flex-shrink-0 size-9 rounded-full bg-card flex items-center justify-center order-2 border">
                  <User className="size-5 text-muted-foreground" />
                </div>
              </div>
            );
          case 'ai-response':
              return (
                  <div key={item.id} className="flex items-start gap-4">
                  <div className="flex-shrink-0 size-9 rounded-full bg-muted flex items-center justify-center">
                      <Wand2 className="size-5 text-muted-foreground" />
                  </div>
                  <div className="w-full max-w-xl">
                      {item.isLoading ? (
                          <Skeleton className="h-10 w-48 rounded-lg" />
                      ) : (
                          <div className="bg-muted p-3 rounded-lg">
                              <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                          </div>
                      )}
                  </div>
                  </div>
              );
          default:
            return null;
        }
      })}
    </>
  );

  const WelcomeCanvas = () => (
    <div className="space-y-8">
      {/* 参数摘要 */}
      {!isSidebarOpen && (
        <ParametersSummary designInput={designInput} />
      )}
      
      {/* 欢迎内容 */}
      <div className="text-center flex flex-col items-center justify-center h-full text-muted-foreground p-8">
        <Wand2 className="w-16 h-16 text-primary mb-6" />
        <h1 className="text-4xl md:text-5xl font-bold energy-gradient mb-4">{t('creativeWorkshopPage.title')}</h1>
        <p className="max-w-md mb-8">{t('creativeWorkshopPage.description')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
          <div className="quantum-card p-4 text-left">
            <h3 className="font-semibold text-foreground flex items-center mb-2"><Lightbulb className="w-5 h-5 mr-2 text-primary"/>{t('creativeWorkshopPage.welcome.getSuggestionsTitle')}</h3>
            <p className="text-sm">{t('creativeWorkshopPage.welcome.getSuggestionsDesc')}</p>
          </div>
          <div className="quantum-card p-4 text-left">
            <h3 className="font-semibold text-foreground flex items-center mb-2"><Images className="w-5 h-5 mr-2 text-primary"/>{t('creativeWorkshopPage.welcome.generateDirectlyTitle')}</h3>
            <p className="text-sm">{t('creativeWorkshopPage.welcome.generateDirectlyDesc')}</p>
          </div>
        </div>
        
        {/* 测试默认提示词按钮 */}
        <div className="mt-8">
          <Button 
            variant="outline" 
            onClick={() => {
              try {
                const { buildDrawingPrompts } = require('@/lib/prompt-builder');
                const prompts = buildDrawingPrompts(designInput);
                const currentPrompt = language === 'zh' ? prompts.zh : prompts.en;
                setPrompt(currentPrompt);
                toast({
                  title: '默认提示词已生成',
                  description: `基于当前参数生成的${language === 'zh' ? '中文' : '英文'}提示词已填入输入框`,
                });
              } catch (error) {
                console.error('生成默认提示词失败:', error);
                toast({
                  variant: 'destructive',
                  title: '生成失败',
                  description: '无法生成默认提示词，请检查参数设置',
                });
              }
            }}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            生成基于参数的默认提示词
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* 主内容区域 */}
      <div className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'flex-1' : 'w-full'}`}>
        {/* 聊天历史区域 */}
        <div className="flex-grow overflow-y-auto min-h-0 pr-4 pl-2 pb-4 space-y-6 hide-scrollbar">
          {history.length === 0 ? <WelcomeCanvas /> : renderHistory()}
          <div ref={historyEndRef} />
        </div>
        
        {/* 底部输入栏 */}
        <div className="pt-4 flex items-center gap-2">
          <div className="flex-grow">
            <PromptBar
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleSendMessage}
              isGenerating={isGenerating}
              isImageMode={isImageMode}
              onToggleImageMode={toggleImageMode}
            />
          </div>
          
          {/* 侧边栏切换按钮 */}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="shrink-0"
            title={isSidebarOpen ? "隐藏参数面板" : "显示参数面板"}
          >
            {isSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          
          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0" title={t('creativeWorkshopPage.clearSession.title')}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('creativeWorkshopPage.clearSession.title')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('creativeWorkshopPage.clearSession.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancelButton')}</AlertDialogCancel>
                  <AlertDialogAction onClick={clearHistory}>
                    {t('creativeWorkshopPage.clearSession.confirmButton')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* 右侧参数面板 */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 384 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-l bg-background overflow-hidden"
          >
            <div className="w-96 h-full">
              <CreativeWorkshopParametersSidebar onGenerateSuggestions={handleSidebarGenerate} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
