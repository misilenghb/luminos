"use client";

import { useForm, Controller, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trash2, 
  PlusCircle, 
  Lightbulb, 
  Gem, 
  Settings2, 
  ShieldQuestion, 
  FileText, 
  Loader2, 
  Sparkles, 
  Settings,
  Palette,
  Camera,
  Layers
} from "lucide-react";
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

interface CreativeWorkshopParametersSidebarProps {
  onGenerateSuggestions: (data: DesignStateInput) => Promise<void>;
}

const CreativeWorkshopParametersSidebar: React.FC<CreativeWorkshopParametersSidebarProps> = ({ onGenerateSuggestions }) => {
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

  const safeDesignInput: DesignStateInput = {
    ...designInput,
    designCategory: designInput.designCategory ?? '',
    overallDesignStyle: designInput.overallDesignStyle ?? '',
    mainStones: Array.isArray(designInput.mainStones)
      ? designInput.mainStones.map(stone => ({
          ...stone,
          id: stone.id ?? '',
          crystalType: stone.crystalType ?? '',
          color: stone.color ?? '',
        }))
      : [],
    colorSystem: designInput.colorSystem ?? { mainHue: '' },
    compositionalAesthetics: designInput.compositionalAesthetics ?? { style: '', overallStructure: '' },
  };
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
    defaultValues: safeDesignInput,
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "mainStones",
  });

  const watchedForm = useWatch({ control });

  useEffect(() => {
    if (!watchedForm) return;
    
    const safeWatchedForm: DesignStateInput = {
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
      colorSystem: watchedForm.colorSystem ?? { mainHue: '' },
      compositionalAesthetics: watchedForm.compositionalAesthetics ?? { style: '', overallStructure: '' },
    };
    
    const timeoutId = setTimeout(() => {
      setDesignInput(safeWatchedForm);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [watchedForm, setDesignInput]);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
    reset(safeDesignInput);
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [reset, safeDesignInput]);

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
        designCategory: overallDesignStyle,
        category: designCategory,
        mainStones: JSON.stringify(mainStones.filter(stone => stone.crystalType).map(stone => ({
          type: stone.crystalType,
          color: stone.color,
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
    append({ id: crypto.randomUUID(), crystalType: "", shape: "", color: "", inclusions: [] } as MainStone);
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
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center">
          <Settings className="mr-2 h-5 w-5 text-primary" />
          设计参数
        </h2>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <form onSubmit={handleSubmit(handleGenerate as any)} className="space-y-6 py-4">
          
          {/* 基础设置 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                基础设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="designCategory" className="text-sm font-medium">设计类别</Label>
                <Controller
                  name="designCategory"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择设计类别" />
                      </SelectTrigger>
                      <SelectContent>
                        {designCategoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="overallDesignStyle" className="text-sm font-medium">设计风格</Label>
                <Controller
                  name="overallDesignStyle"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择设计风格" />
                      </SelectTrigger>
                      <SelectContent>
                        {overallDesignStyleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label htmlFor="userIntent" className="text-sm font-medium">使用意图</Label>
                <Controller
                  name="userIntent"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="选择使用意图" />
                      </SelectTrigger>
                      <SelectContent>
                        {userIntentOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 材料选择 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Gem className="mr-2 h-4 w-4" />
                材料选择
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((item, index) => (
                <div key={item.id} className="p-3 border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center mb-3">
                    <Badge variant="secondary">宝石 {index + 1}</Badge>
                    {fields.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => remove(index)}
                        className="text-destructive hover:bg-destructive/10 h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs font-medium">水晶类型</Label>
                      <Controller 
                        name={`mainStones.${index}.crystalType`} 
                        control={control} 
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-1 h-8">
                              <SelectValue placeholder="选择水晶" />
                            </SelectTrigger>
                            <SelectContent>
                              {crystalOptionsForSelect.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )} 
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium">形状</Label>
                      <Controller 
                        name={`mainStones.${index}.shape`} 
                        control={control} 
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <SelectTrigger className="mt-1 h-8">
                              <SelectValue placeholder="选择形状" />
                            </SelectTrigger>
                            <SelectContent>
                              {shapeOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )} 
                      />
                    </div>
                    
                    <div>
                      <Label className="text-xs font-medium">颜色</Label>
                      <Controller 
                        name={`mainStones.${index}.color`} 
                        control={control} 
                        render={({ field }) => (
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            disabled={!watchedMainStones?.[index]?.crystalType || (availableColorsPerStone[index] && availableColorsPerStone[index].length === 0)}
                          >
                            <SelectTrigger className="mt-1 h-8">
                              <SelectValue placeholder="选择颜色" />
                            </SelectTrigger>
                            <SelectContent>
                              {(availableColorsPerStone[index] || []).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )} 
                      />
                      {errors.mainStones?.[index]?.color && (
                        <p className="text-destructive text-xs mt-1">
                          {t(errors.mainStones[index]!.color!.message as string)}
                        </p>
                      )}
                    </div>
                    

                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={addStone} 
                className="w-full h-8 text-sm"
              >
                <PlusCircle className="mr-2 h-3 w-3" />
                添加宝石
              </Button>
            </CardContent>
          </Card>

          {/* 配饰系统 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                配饰系统
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                type="button" 
                onClick={handleRecommendAccessories} 
                disabled={isRecommendingAccessories} 
                className="w-full h-8 text-sm"
                variant="outline"
              >
                {isRecommendingAccessories ? (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin"/>
                ) : (
                  <Sparkles className="mr-2 h-3 w-3" />
                )}
                智能推荐
              </Button>
              
              <div>
                <Label className="text-xs font-medium flex items-center">
                  配饰描述
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <ShieldQuestion className="ml-1 h-3 w-3 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">描述您希望添加的配饰元素</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Controller 
                  name="accessories" 
                  control={control} 
                  render={({ field }) => (
                    <Textarea 
                      {...field} 
                      placeholder="描述配饰..." 
                      className="mt-1 min-h-[60px] text-sm"
                    />
                  )} 
                />
              </div>
            </CardContent>
          </Card>

          {/* 构图美学 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Layers className="mr-2 h-4 w-4" />
                构图美学
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium">排列风格</Label>
                <Controller 
                  name="compositionalAesthetics.style" 
                  control={control} 
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue placeholder="选择排列风格" />
                      </SelectTrigger>
                      <SelectContent>
                        {arrangementStyleOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} 
                />
              </div>

              <div>
                <Label className="text-xs font-medium">整体结构</Label>
                <Controller 
                  name="compositionalAesthetics.overallStructure" 
                  control={control} 
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""} 
                      disabled={!watchedDesignCategory || structureOptions.length === 0}
                    >
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue placeholder="选择整体结构" />
                      </SelectTrigger>
                      <SelectContent>
                        {structureOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} 
                />
              </div>

              <div>
                <Label className="text-xs font-medium">主色调</Label>
                <Controller 
                  name="colorSystem.mainHue" 
                  control={control} 
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue placeholder="选择主色调" />
                      </SelectTrigger>
                      <SelectContent>
                        {mainHueOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} 
                />
              </div>
            </CardContent>
          </Card>

          {/* 视觉效果 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Camera className="mr-2 h-4 w-4" />
                视觉效果
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs font-medium">图片风格</Label>
                <Controller 
                  name="imageStyle" 
                  control={control} 
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue placeholder="选择图片风格" />
                      </SelectTrigger>
                      <SelectContent>
                        {imageStyleOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} 
                />
              </div>

              <div>
                                  <Label className="text-xs font-medium">应用平台</Label>
                <Controller
                  name="applicationPlatform"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue placeholder="选择目标平台" />
                      </SelectTrigger>
                      <SelectContent>
                        {applicationPlatformOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <Label className="text-xs font-medium">画面比例</Label>
                <Controller
                  name="aspectRatio"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue placeholder="选择画面比例" />
                      </SelectTrigger>
                      <SelectContent>
                        {aspectRatioOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </ScrollArea>

      {/* 底部生成按钮 */}
      <div className="p-4 border-t">
        <Button 
          onClick={handleSubmit(handleGenerate as any)} 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          生成设计建议
        </Button>
      </div>
    </div>
  );
};

export default CreativeWorkshopParametersSidebar; 