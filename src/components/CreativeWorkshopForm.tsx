"use client";

import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, PlusCircle, Lightbulb, Gem, Settings2, ShieldQuestion, FileText, Loader2, Sparkles, Settings } from "lucide-react";
import type { DesignStateInput, MainStone } from "@/types/design";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { suggestAccessories } from "@/ai/flows/accessory-suggestion-flow";
import { useCreativeWorkshop } from "@/contexts/CreativeWorkshopContext";

const mainStoneSchema = z.object({
  id: z.string(),
  crystalType: z.string().min(1, 'creativeWorkshopForm.errorCrystalTypeRequired'),
  shape: z.string().optional(),
  color: z.string().min(1, 'creativeWorkshopForm.errorColorRequired'),
  clarity: z.string().optional(),
  surfaceTreatment: z.string().optional(),
  inclusions: z.array(z.string()).optional(),
});

const compositionalAestheticsSchema = z.object({
  style: z.string().optional(),
  overallStructure: z.string().optional(),
}).optional();

const colorSystemSchema = z.object({
  mainHue: z.string().optional(),
}).optional();

const designStateSchema = z.object({
  designCategory: z.string().min(1),
  overallDesignStyle: z.string().min(1),
  userIntent: z.string().optional(),
  imageStyle: z.string().optional(),
  applicationPlatform: z.string().optional(),
  aspectRatio: z.string().optional(),
  mainStones: z.array(mainStoneSchema).min(1, 'creativeWorkshopForm.errorMinStones'),
  accessories: z.string().optional(),
  compositionalAesthetics: compositionalAestheticsSchema,
  colorSystem: colorSystemSchema,
});


interface CreativeWorkshopFormProps {
  onGenerateSuggestions: (data: DesignStateInput) => Promise<void>;
}

const CreativeWorkshopForm: React.FC<CreativeWorkshopFormProps> = ({ onGenerateSuggestions }) => {
  const { t, language, getTranslatedOptions, getCrystalDisplayName, getRawCrystalOptions, normalizeColorToKey } = useLanguage();
  const { designInput, setDesignInput } = useCreativeWorkshop();
  const { toast } = useToast();
  const allCrystalData = getRawCrystalOptions();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecommendingAccessories, setIsRecommendingAccessories] = useState(false);

  const crystalOptionsForSelect = Object.keys(allCrystalData).map(key => ({
    value: key,
    label: getCrystalDisplayName(key as keyof typeof allCrystalData)
  }));

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<DesignStateInput>({
    resolver: zodResolver(designStateSchema),
    defaultValues: designInput,
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "mainStones",
  });

  const watchedForm = useWatch({ control });

  useEffect(() => {
    // Skip update when the form is initializing
    if (!watchedForm) return;
    
    // Create safe object with all required fields
    const safeWatchedForm = {
      ...watchedForm,
      designCategory: watchedForm.designCategory ?? '',
      overallDesignStyle: watchedForm.overallDesignStyle ?? '',
      mainStones: Array.isArray(watchedForm.mainStones)
        ? watchedForm.mainStones.map(stone => ({
            ...stone,
            id: stone.id ?? '',
            crystalType: stone.crystalType ?? '',
            color: stone.color ?? '',
          }))
        : [],
    };
    
    // Add debouncing to prevent infinite loops
    const timeoutId = setTimeout(() => {
        setDesignInput(safeWatchedForm);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [watchedForm, setDesignInput]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
    reset(designInput);
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [designInput, reset]);

  const watchedMainStones = useWatch({ control, name: "mainStones" });
  const watchedDesignCategory = useWatch({ control, name: "designCategory" });
  const previousCrystalTypesRef = useRef<Array<string | undefined>>([]);

  const availableColorsPerStone = useMemo(() => {
    const newAvailableColors: Record<number, Array<{ value: string; label: string }>> = {};
    if (Array.isArray(watchedMainStones)) {
      watchedMainStones.forEach((stone, index) => {
        const crystalKey = stone?.crystalType as keyof typeof allCrystalData | undefined;
        const crystalData = crystalKey ? allCrystalData[crystalKey] : null;
        if (crystalData && crystalData.availableColors) {
          newAvailableColors[index] = crystalData.availableColors
            .filter(c => !!c)
            .map(colorName => ({
              value: colorName,
              label: t(`options.crystalColorNames.${normalizeColorToKey(colorName)}`, { defaultValue: colorName })
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
        } else {
          newAvailableColors[index] = [];
        }
      });
    }
    return newAvailableColors;
  }, [watchedMainStones, allCrystalData, t, normalizeColorToKey]);

  useEffect(() => {
    if (Array.isArray(watchedMainStones)) {
      const currentCrystalTypes = watchedMainStones.map(s => s?.crystalType);
      currentCrystalTypes.forEach((currentCrystalTypeForStone, index) => {
        const previousCrystalType = previousCrystalTypesRef.current[index];
        if (currentCrystalTypeForStone !== previousCrystalType) {
          setValue(`mainStones.${index}.color`, "", { shouldDirty: true });
        }
      });
      previousCrystalTypesRef.current = [...currentCrystalTypes];
    }
  }, [watchedMainStones, setValue]);
  
  useEffect(() => {
    setValue("compositionalAesthetics.overallStructure", "");
  }, [watchedDesignCategory, setValue]);
  
  const handleGenerate = async (data: DesignStateInput) => {
      setIsSubmitting(true);
      await onGenerateSuggestions(data);
      setIsSubmitting(false);
  };

  const handleRecommendAccessories = async () => {
    const currentValues = getValues();
    const { overallDesignStyle, designCategory, mainStones, colorSystem, userIntent, compositionalAesthetics } = currentValues;
    
    // 检查必要的参数
    if (!overallDesignStyle) {
      toast({
        variant: "destructive",
        title: "请先选择设计风格",
        description: "配饰推荐需要基于设计风格进行分析"
      });
      return;
    }
    
    if (!mainStones || mainStones.length === 0 || !mainStones[0]?.crystalType) {
      toast({
        variant: "destructive", 
        title: "请先选择主石",
        description: "配饰推荐需要基于主石类型进行搭配"
      });
      return;
    }
    
    setIsRecommendingAccessories(true);
    try {
      // 构建完整的设计上下文
      const designContext = {
        designCategory: overallDesignStyle!,
        category: designCategory,
        mainStones: JSON.stringify(mainStones.filter(stone => stone.crystalType).map(stone => ({
          type: stone.crystalType,
          color: stone.color || '',
          shape: stone.shape
        }))),
        colorSystem: colorSystem?.mainHue,
        userIntent: userIntent ?? '',
        structure: compositionalAesthetics?.overallStructure,
        language
      };
      
      const result = await suggestAccessories(designContext);
      setValue("accessories", result.suggestions, { shouldDirty: true });
      toast({
        title: t('toasts.accessorySuggestionSuccessTitle'),
        description: t('toasts.accessorySuggestionSuccessDesc'),
      });
    } catch (error) {
      console.error("Error suggesting accessories:", error);
      toast({
        variant: "destructive",
        title: t('toasts.accessorySuggestionErrorTitle'),
        description: error instanceof Error ? error.message : t('toasts.unknownError'),
      });
    } finally {
      setIsRecommendingAccessories(false);
    }
  };
  
  const addStone = () => {
    append({ id: crypto.randomUUID(), crystalType: "", shape: "", color: "", clarity: "", surfaceTreatment: "", inclusions: [] } as MainStone);
  };

  const designCategoryOptions = getTranslatedOptions('designCategories');
  const overallDesignStyleOptions = getTranslatedOptions('overallDesignStyles');
  const userIntentOptions = getTranslatedOptions('userIntents');
  const imageStyleOptions = getTranslatedOptions('imageStyles');
  const applicationPlatformOptions = getTranslatedOptions('applicationPlatforms');
  const aspectRatioOptions = getTranslatedOptions('photographyAspectRatios');
  const arrangementStyleOptions = getTranslatedOptions('arrangementStyles');
  const shapeOptions = getTranslatedOptions('mainStoneShapes');
  const mainHueOptions = getTranslatedOptions('mainHues');
  
  const structureOptions = useMemo(() => {
    switch (watchedDesignCategory) {
        case "bracelet": return getTranslatedOptions('structureOptionsBracelet');
        case "necklace": return getTranslatedOptions('structureOptionsNecklace');
        case "ring": return getTranslatedOptions('structureOptionsRing');
        case "earrings": return getTranslatedOptions('structureOptionsEarrings');
        default: return [];
    }
  }, [watchedDesignCategory, getTranslatedOptions]);


  return (
    <form onSubmit={handleSubmit(handleGenerate)} className="space-y-6">
      <Accordion type="multiple" className="w-full" defaultValue={[]}>
        
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold">
            <Settings className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.globalSettingsTitle')}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-2">
             <div>
              <Label htmlFor="applicationPlatform">{t('creativeWorkshopForm.applicationPlatformLabel')}</Label>
              <Controller
                name="applicationPlatform"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}><SelectTrigger id="applicationPlatform"><SelectValue placeholder={t('creativeWorkshopForm.applicationPlatformPlaceholder')} /></SelectTrigger><SelectContent>{applicationPlatformOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                )}
              />
            </div>
             <div>
              <Label htmlFor="aspectRatio">{t('creativeWorkshopForm.aspectRatioLabel')}</Label>
              <Controller
                name="aspectRatio"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}><SelectTrigger id="aspectRatio"><SelectValue placeholder={t('creativeWorkshopForm.aspectRatioPlaceholder')} /></SelectTrigger><SelectContent>{aspectRatioOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="designCategory">{t('creativeWorkshopForm.designCategoryLabel')}</Label>
              <Controller
                name="designCategory"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}><SelectTrigger id="designCategory"><SelectValue placeholder={t('creativeWorkshopForm.designCategoryPlaceholder')} /></SelectTrigger><SelectContent>{designCategoryOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="overallDesignStyle">{t('creativeWorkshopForm.overallDesignStyleLabel')}</Label>
              <Controller
                name="overallDesignStyle"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}><SelectTrigger id="overallDesignStyle"><SelectValue placeholder={t('creativeWorkshopForm.overallDesignStylePlaceholder')} /></SelectTrigger><SelectContent>{overallDesignStyleOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="userIntent">{t('simpleDesignForm.userIntentLabel')}</Label>
              <Controller
                name="userIntent"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger id="userIntent"><SelectValue placeholder={t('creativeWorkshopForm.userIntentPlaceholder')} /></SelectTrigger>
                    <SelectContent>
                      {userIntentOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-lg font-semibold">
            <Gem className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.step2Title')}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-2">
            {fields.map((item, index) => (
              <Card key={item.id} className="p-4 space-y-3 bg-card/80 shadow-inner">
                 <div className="flex justify-between items-center"><h4 className="font-medium text-primary">{t('creativeWorkshopForm.stoneLabel', { index: index + 1 })}</h4>{fields.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>)}</div><Separator />
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor={`mainStones.${index}.crystalType`}>{t('creativeWorkshopForm.crystalTypeLabel')}</Label>
                    <Controller name={`mainStones.${index}.crystalType`} control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value}><SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.crystalTypePlaceholder')} /></SelectTrigger><SelectContent>{crystalOptionsForSelect.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>)} />
                  </div>
                  <div>
                    <Label htmlFor={`mainStones.${index}.color`}>{t('creativeWorkshopForm.colorLabel')}</Label>
                    <Controller name={`mainStones.${index}.color`} control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value} disabled={!watchedMainStones?.[index]?.crystalType || (availableColorsPerStone[index] && availableColorsPerStone[index].length === 0)}><SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.colorPlaceholder')} /></SelectTrigger><SelectContent>{(availableColorsPerStone[index] || []).map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>)} />
                     {errors.mainStones?.[index]?.color && <p className="text-destructive text-sm mt-1">{t(errors.mainStones[index]!.color!.message as string)}</p>}
                  </div>
                </div>
              </Card>
            ))}
            <Button type="button" variant="outline" onClick={addStone} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> {t('creativeWorkshopForm.addStoneButton')}</Button><Separator />
            <div className="space-y-2">
              <Button type="button" onClick={handleRecommendAccessories} disabled={isRecommendingAccessories} className="w-full">
                {isRecommendingAccessories ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                {t('creativeWorkshopForm.systemRecommendButton')}
              </Button>
            </div>
            <div>
              <Label htmlFor="accessories" className="flex items-center">{t('creativeWorkshopForm.accessoriesLabel')}<TooltipProvider><Tooltip><TooltipTrigger asChild><ShieldQuestion className="ml-2 h-4 w-4 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>{t('creativeWorkshopForm.accessoriesTooltip')}</p></TooltipContent></Tooltip></TooltipProvider></Label>
              <Controller name="accessories" control={control} render={({ field }) => (<Textarea {...field} placeholder={t('creativeWorkshopForm.accessoriesPlaceholder')} />)} />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-lg font-semibold">
            <Settings2 className="mr-2 h-5 w-5 text-primary" /> {t('creativeWorkshopForm.step3Title')}
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-2">
            <div>
              <Label htmlFor="compositionalAesthetics.style">{t('creativeWorkshopForm.arrangementLabel')}</Label>
              <Controller name="compositionalAesthetics.style" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ""}><SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.arrangementStylePlaceholder')} /></SelectTrigger><SelectContent>{arrangementStyleOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>)} />
            </div>
            <div>
                <Label htmlFor="compositionalAesthetics.overallStructure">{t('creativeWorkshopForm.structureLabel')}</Label>
                <Controller name="compositionalAesthetics.overallStructure" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ""} disabled={!watchedDesignCategory || structureOptions.length === 0}><SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.overallStructurePlaceholder')} /></SelectTrigger><SelectContent>{structureOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>)} />
            </div>
            <div>
              <Label htmlFor="colorSystem.mainHue">{t('creativeWorkshopForm.mainHueLabel')}</Label>
              <Controller name="colorSystem.mainHue" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ""}><SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.mainHuePlaceholder')} /></SelectTrigger><SelectContent>{mainHueOptions.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>)} />
            </div>
            <div>
              <Label htmlFor="imageStyle">{t('creativeWorkshopForm.imageStyleLabel')}</Label>
              <Controller name="imageStyle" control={control} render={({ field }) => (<Select onValueChange={field.onChange} value={field.value || ""}><SelectTrigger><SelectValue placeholder={t('creativeWorkshopForm.imageStylePlaceholder')} /></SelectTrigger><SelectContent>{imageStyleOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}</SelectContent></Select>)} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-4 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
            {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileText className="mr-2 h-5 w-5" />}
            {t('creativeWorkshopForm.generateSuggestionsButton')}
        </Button>
      </div>
    </form>
  );
};

export default CreativeWorkshopForm;
