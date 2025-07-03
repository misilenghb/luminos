'use client';

import type React from 'react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { DesignStateInput } from '@/types/design';
import { designSuggestions } from '@/ai/flows/design-suggestions';
import { generateImage } from '@/ai/flows/image-generation-flow';
import { refineImage } from '@/ai/flows/refine-image-flow';
import { translateText } from '@/ai/flows/translate-flow';
import { getCreativeGuidance } from '@/ai/flows/creative-conversation-flow';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { compressImage } from '@/lib/image-utils';


// State and types
export interface HistoryItem {
  id: string;
  type: 'suggestions' | 'images' | 'user-prompt' | 'ai-response';
  content: any;
  isLoading?: boolean;
}

interface CreativeWorkshopContextType {
  history: HistoryItem[];
  prompt: string;
  setPrompt: (prompt: string) => void;
  designInput: DesignStateInput;
  setDesignInput: (data: DesignStateInput) => void;
  isGenerating: boolean;
  isImageMode: boolean;
  toggleImageMode: () => void;
  sendInitialGreeting: () => void;

  // Actions
  handleGenerateSuggestions: (data: DesignStateInput) => Promise<void>;
  handleSendMessage: (prompt: string) => Promise<void>;
  handleRefineImage: (baseImageDataUri: string, refinementPrompt: string, originalPrompt: string) => Promise<void>;
  handleGenerateSimilar: (originalPrompt: string) => Promise<void>;
  handleEnhance: (baseImage: string, originalPrompt: string) => Promise<void>;
  handleSaveImage: (imageUrl: string, promptForImage: string) => Promise<void>;
  clearHistory: () => void;
}

const CreativeWorkshopContext = createContext<CreativeWorkshopContextType | undefined>(undefined);

const defaultDesignInput: DesignStateInput = {
    designCategory: "bracelet",
    overallDesignStyle: "minimalist",
    userIntent: "personalTalisman",
    imageStyle: "style_photo_realistic",
    applicationPlatform: "flux",
    aspectRatio: "ratio_3_4",
    mainStones: [{ id: crypto.randomUUID(), crystalType: "", shape: "", color: "", inclusions: [] }],
    accessories: "",
    compositionalAesthetics: { style: "symmetrical", overallStructure: "single_strand" },
    colorSystem: { mainHue: "cool_tones" },
};

// Serializer function moved here for consistency
const serializeDesignInputForAI = (data: DesignStateInput) => {
  const mainStonesDescription = data.mainStones
    ?.map((stone) => {
      if (!stone.crystalType) return null;
      
      const details: string[] = [];
      if (stone.shape) details.push(`Shape: ${stone.shape}`);
      if (stone.color) details.push(`Color: ${stone.color}`);
      if (stone.inclusions && stone.inclusions.length > 0) {
        details.push(`Inclusions: ${stone.inclusions.join(', ')}`);
      }

      return `${stone.crystalType}${details.length > 0 ? ` (${details.join(', ')})` : ''}`;
    })
    .filter(Boolean)
    .join('; ');
    
  return {
    designCategory: data.designCategory || 'bracelet',
    overallDesignStyle: data.overallDesignStyle || 'elegant',
    userIntent: data.userIntent || undefined,
    imageStyle: data.imageStyle || 'style_photo_realistic',
    applicationPlatform: data.applicationPlatform || 'flux',
    aspectRatio: data.aspectRatio || 'ratio_3_4',
    mainStones: mainStonesDescription || 'mixed gemstones',
    metalType: undefined, // 暂时设为undefined，后续可以添加到UI
    compositionalAesthetics: {
      style: data.compositionalAesthetics?.style || 'symmetrical',
      overallStructure: data.compositionalAesthetics?.overallStructure || 'appropriate_for_category',
    },
    colorSystem: { mainHue: data.colorSystem?.mainHue || 'any' },
    accessories: data.accessories || 'Minimalist silver accents',
    language: 'zh', // 添加语言参数
  };
};

export const CreativeWorkshopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [designInput, setDesignInput] = useState<DesignStateInput>(defaultDesignInput);
  const [isImageMode, setIsImageMode] = useState(false);
  
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  const isGenerating = history.some(item => item.isLoading);

  const addHistoryItem = useCallback((item: Omit<HistoryItem, 'id'>) => {
    const newItem = { id: crypto.randomUUID(), ...item };
    setHistory(prev => [...prev, newItem]);
    return newItem;
  }, []);

  const updateHistoryItem = useCallback((id: string, updates: Partial<HistoryItem>) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);
  
  const clearHistory = useCallback(() => {
    setHistory([]);
    setDesignInput(defaultDesignInput);
    setPrompt("");
    setIsImageMode(false);
  }, []);

  const toggleImageMode = useCallback(() => {
    setIsImageMode(prev => !prev);
  }, []);
  
  const sendInitialGreeting = useCallback(() => {
      // Prevent sending if a message is already being generated or exists
      if (isGenerating || history.length > 0) return;
      
      addHistoryItem({
        type: 'ai-response',
        content: t('creativeWorkshopPage.welcome.autoGreeting'),
        isLoading: false,
      });
  }, [addHistoryItem, t, isGenerating, history.length]);


  const handleGenerateSuggestions = useCallback(async (data: DesignStateInput) => {
    const tempItem = addHistoryItem({ type: 'suggestions', content: null, isLoading: true });
    const tempId = tempItem.id;

    try {
      const serializedData = serializeDesignInputForAI(data);
      const result = await designSuggestions({...serializedData, language });
      updateHistoryItem(tempId, { content: result, isLoading: false });
      toast({
        title: t('toasts.aiSuggestionsGeneratedTitle'),
        description: t('toasts.aiSuggestionsGeneratedDesc'),
      });
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      updateHistoryItem(tempId, { content: { error: error instanceof Error ? error.message : t('toasts.unknownError') }, isLoading: false });
      toast({
        variant: "destructive",
        title: t('toasts.errorGeneratingSuggestionsTitle'),
        description: error instanceof Error ? error.message : t('toasts.unknownError'),
      });
    }
  }, [addHistoryItem, updateHistoryItem, language, toast, t]);

  const handleGenerateImageWithPrompt = useCallback(async (generationPrompt: string) => {
    const tempItem = addHistoryItem({ type: 'images', content: { imageUrls: null, error: null, prompt: generationPrompt }, isLoading: true });
    const tempId = tempItem.id;
    
    try {
      const result = await generateImage({ 
        prompt: generationPrompt, 
        language, 
        applicationPlatform: designInput.applicationPlatform 
      });
      updateHistoryItem(tempId, { content: { ...result, prompt: generationPrompt, error: null }, isLoading: false });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : t('designPreview.generationError');
      updateHistoryItem(tempId, { content: { imageUrls: null, error: errorMessage, prompt: generationPrompt }, isLoading: false });
      toast({
        variant: "destructive",
        title: t('toasts.errorGeneratingImageTitle'),
        description: errorMessage,
            });
    }
  }, [addHistoryItem, updateHistoryItem, language, t, toast, designInput.applicationPlatform]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isGenerating) return;

    const newUserPromptItem: HistoryItem = { id: crypto.randomUUID(), type: 'user-prompt', content: message };
    setHistory(prev => [...prev, newUserPromptItem]);
    setPrompt(""); // Clear input after sending

    const tempItem = addHistoryItem({ type: 'ai-response', content: null, isLoading: true });
    const tempId = tempItem.id;
    
    try {
        if (isImageMode) {
             const result = await generateImage({ 
               prompt: message, 
               language, 
               applicationPlatform: designInput.applicationPlatform 
             });
             updateHistoryItem(tempId, { type: 'images', content: { ...result, prompt: message, error: null }, isLoading: false });
        } else {
            // Build history for conversational AI
            const conversationHistory = [...history, newUserPromptItem]
                .filter(item => item.type === 'user-prompt' || (item.type === 'ai-response' && !item.isLoading))
                .map(item => ({
                    role: (item.type === 'user-prompt' ? 'user' : 'model') as 'user' | 'model',
                    content: item.content as string,
                }));

            const result = await getCreativeGuidance({ history: conversationHistory, language });
            updateHistoryItem(tempId, { content: result.response, isLoading: false });
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : t('toasts.unknownError');
        updateHistoryItem(tempId, { content: errorMessage, isLoading: false });
        toast({ variant: "destructive", title: t('toasts.errorGeneratingSuggestionsTitle'), description: errorMessage });
    }
  }, [history, isGenerating, isImageMode, language, addHistoryItem, updateHistoryItem, t, toast, designInput.applicationPlatform]);


  const handleRefineImage = useCallback(async (baseImageDataUri: string, refinementPrompt: string, originalPrompt: string) => {
    addHistoryItem({ type: 'user-prompt', content: refinementPrompt });
    const tempItem = addHistoryItem({ type: 'images', content: { imageUrls: null, error: null, prompt: refinementPrompt }, isLoading: true });
    const tempId = tempItem.id;

    try {
        const containsChinese = /[\u4e00-\u9fa5]/.test(refinementPrompt);
        let englishPrompt = refinementPrompt;

        if (containsChinese) {
            const translationResult = await translateText({ text: refinementPrompt, targetLanguage: 'English' });
            englishPrompt = translationResult.translatedText;
        }

        const result = await refineImage({ baseImageDataUri, prompt: englishPrompt, language });
        updateHistoryItem(tempId, { content: { imageUrls: [result.imageUrl], error: null, prompt: refinementPrompt }, isLoading: false });
    } catch(e) {
        const errorMessage = e instanceof Error ? e.message : t('designPreview.generationError');
        updateHistoryItem(tempId, { content: { imageUrls: null, error: errorMessage, prompt: refinementPrompt }, isLoading: false });
        toast({
            variant: "destructive",
            title: t('toasts.errorGeneratingImageTitle'),
            description: errorMessage,
        });
    }
  }, [addHistoryItem, updateHistoryItem, language, t, toast]);

  const handleGenerateSimilar = useCallback(async (originalPrompt: string) => {
      addHistoryItem({ type: 'user-prompt', content: `Generate variations for: ${originalPrompt}` });
      await handleGenerateImageWithPrompt(originalPrompt);
  }, [handleGenerateImageWithPrompt, addHistoryItem]);

  const handleEnhance = useCallback(async (baseImageDataUri: string, originalPrompt: string) => {
      const enhanceAIPrompt = `Enhance this image with higher details, better lighting, and more realism, while keeping the original design concept: ${originalPrompt}`;
      await handleRefineImage(baseImageDataUri, enhanceAIPrompt, originalPrompt);
  }, [handleRefineImage]);

  const handleSaveImage = useCallback(async (imageUrl: string, promptForImage: string) => {
    if (!isAuthenticated || !user) {
        toast({
            variant: "destructive",
            title: t('galleryPage.saveErrorTitle'),
            description: t('galleryPage.notLoggedInToSave'),
        });
        return;
    }
    
    const tempItem = addHistoryItem({ type: 'images', content: { isSaving: true }, isLoading: true });
    const tempId = tempItem.id;

    try {
        // 对于Pollinations图片，直接保存原始URL，不进行压缩
        // 因为这些图片已经是优化过的，而且压缩跨域图片会有安全限制
        let imageUrlToSave = imageUrl;
        
        // 只对data URL格式的图片进行压缩
        if (imageUrl.startsWith('data:')) {
            try {
                imageUrlToSave = await compressImage(imageUrl);
            } catch (compressionError) {
                console.warn('Image compression failed, using original URL:', compressionError);
                imageUrlToSave = imageUrl;
            }
        }
        
        const designToSave = { prompt: promptForImage, imageUrl: imageUrlToSave };
        // Replace this with actual supabase save logic
        console.log('Saving design:', designToSave);
        
        toast({ 
            title: t('galleryPage.saveSuccessTitle'), 
            description: t('galleryPage.saveSuccessDesc') 
        });
    } catch (error) {
        console.error("Error saving design:", error);
        toast({ 
            variant: "destructive", 
            title: t('galleryPage.saveErrorTitle'), 
            description: error instanceof Error ? error.message : t('toasts.unknownError')
        });
    } finally {
        setHistory(prev => prev.filter(item => item.id !== tempId));
    }
  }, [isAuthenticated, user, toast, t, addHistoryItem]);

  const value = {
    history,
    prompt,
    setPrompt,
    designInput,
    setDesignInput,
    isGenerating,
    isImageMode,
    toggleImageMode,
    sendInitialGreeting,
    handleGenerateSuggestions,
    handleSendMessage,
    handleRefineImage,
    handleGenerateSimilar,
    handleEnhance,
    handleSaveImage,
    clearHistory,
  };

  return (
    <CreativeWorkshopContext.Provider value={value}>
      {children}
    </CreativeWorkshopContext.Provider>
  );
};

export const useCreativeWorkshop = (): CreativeWorkshopContextType => {
  const context = useContext(CreativeWorkshopContext);
  if (context === undefined) {
    throw new Error('useCreativeWorkshop must be used within a CreativeWorkshopProvider');
  }
  return context;
};
