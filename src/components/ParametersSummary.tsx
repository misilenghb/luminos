"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Gem, Palette, Camera } from "lucide-react";
import type { DesignStateInput } from "@/types/design";
import { useLanguage } from "@/contexts/LanguageContext";

interface ParametersSummaryProps {
  designInput: DesignStateInput;
  className?: string;
}

const ParametersSummary: React.FC<ParametersSummaryProps> = ({ designInput, className }) => {
  const { t, getTranslatedOptions, getCrystalDisplayName } = useLanguage();

  const getOptionLabel = (optionKey: string, value: string) => {
    const options = getTranslatedOptions(optionKey as any);
    const option = options.find(opt => opt.value === value);
    return option?.label || value;
  };

  const getMainStonesDisplay = () => {
    if (!designInput.mainStones || designInput.mainStones.length === 0) return "未选择";
    
    return designInput.mainStones
      .filter(stone => stone.crystalType)
      .map(stone => {
        const crystalName = getCrystalDisplayName(stone.crystalType as any);
        const shape = stone.shape ? getOptionLabel('mainStoneShapes', stone.shape) : "";
        
        const details: string[] = [];
        if (stone.color) details.push(stone.color);
        
        const shapeText = shape ? `${shape} ` : "";
        const detailsText = details.length > 0 ? ` (${details.join(', ')})` : "";
        
        return `${shapeText}${crystalName}${detailsText}`;
      })
      .join(", ");
  };

  return (
    <Card className={`bg-muted/30 border-muted ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center text-muted-foreground">
          <Settings className="mr-2 h-4 w-4" />
          当前设计参数
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 基础设置 */}
        <div className="space-y-2">
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <Settings className="mr-1 h-3 w-3" />
            基础设置
          </div>
          <div className="flex flex-wrap gap-1">
            {designInput.designCategory && (
              <Badge variant="secondary" className="text-xs">
                {getOptionLabel('designCategories', designInput.designCategory)}
              </Badge>
            )}
            {designInput.overallDesignStyle && (
              <Badge variant="secondary" className="text-xs">
                {getOptionLabel('overallDesignStyles', designInput.overallDesignStyle)}
              </Badge>
            )}
            {designInput.userIntent && (
              <Badge variant="outline" className="text-xs">
                {getOptionLabel('userIntents', designInput.userIntent)}
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* 材料选择 */}
        <div className="space-y-2">
          <div className="flex items-center text-xs font-medium text-muted-foreground">
            <Gem className="mr-1 h-3 w-3" />
            材料选择
          </div>
          <div className="text-xs text-foreground">
            {getMainStonesDisplay()}
          </div>
        </div>

        {/* 构图美学 */}
        {(designInput.compositionalAesthetics?.style || designInput.colorSystem?.mainHue) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center text-xs font-medium text-muted-foreground">
                <Palette className="mr-1 h-3 w-3" />
                构图美学
              </div>
              <div className="flex flex-wrap gap-1">
                {designInput.compositionalAesthetics?.style && (
                  <Badge variant="outline" className="text-xs">
                    {getOptionLabel('arrangementStyles', designInput.compositionalAesthetics.style)}
                  </Badge>
                )}
                {designInput.compositionalAesthetics?.overallStructure && (
                  <Badge variant="outline" className="text-xs">
                    {designInput.compositionalAesthetics.overallStructure}
                  </Badge>
                )}
                {designInput.colorSystem?.mainHue && (
                  <Badge variant="outline" className="text-xs">
                    {getOptionLabel('mainHues', designInput.colorSystem.mainHue)}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* 视觉效果 */}
        {(designInput.imageStyle || designInput.aspectRatio) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center text-xs font-medium text-muted-foreground">
                <Camera className="mr-1 h-3 w-3" />
                视觉效果
              </div>
              <div className="flex flex-wrap gap-1">
                {designInput.imageStyle && (
                  <Badge variant="outline" className="text-xs">
                    {getOptionLabel('imageStyles', designInput.imageStyle)}
                  </Badge>
                )}
                {designInput.aspectRatio && (
                  <Badge variant="outline" className="text-xs">
                    {getOptionLabel('photographyAspectRatios', designInput.aspectRatio)}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* 配饰描述 */}
        {designInput.accessories && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">配饰描述</div>
              <div className="text-xs text-foreground bg-background/50 p-2 rounded text-wrap">
                {designInput.accessories}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ParametersSummary; 