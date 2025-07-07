'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface CrystalDayPickerProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  energyLevel?: number;
  crystalRecommendation?: string;
  dominantChakra?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function CrystalDayPicker({
  selectedDate = new Date(),
  onDateChange,
  energyLevel = 3,
  crystalRecommendation = "紫水晶",
  dominantChakra = "心轮",
  className = "",
  variant = 'default'
}: CrystalDayPickerProps) {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  const handleDateChange = (newDate: Date) => {
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const goToPreviousDay = () => {
    const prevDay = subDays(currentDate, 1);
    handleDateChange(prevDay);
  };

  const goToNextDay = () => {
    const nextDay = addDays(currentDate, 1);
    handleDateChange(nextDay);
  };

  const goToToday = () => {
    handleDateChange(new Date());
  };

  // 紧凑版本
  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 border ${className}`}>
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          
          <div className="text-center">
            <div className="text-lg font-bold">
              {format(currentDate, 'MM/dd', { locale: zhCN })}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(currentDate, 'EEEE', { locale: zhCN })}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={goToNextDay}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  // 详细版本
  if (variant === 'detailed') {
    return (
      <Card className={`quantum-card energy-card ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center flex-1">
              {/* 主要日期显示 */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary mb-1">
                  {format(currentDate, 'dd', { locale: zhCN })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(currentDate, 'EEEE', { locale: zhCN })}
                </div>
              </div>
              
              {/* 能量信息 */}
              <div className="space-y-3">
                {/* 能量等级 */}
                <div className="flex items-center justify-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">能量</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-2 rounded-full ${
                          level <= energyLevel
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{energyLevel}/5</span>
                </div>
                
                {/* 推荐水晶 */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-muted-foreground">推荐:</span>
                  <span className="font-medium text-purple-700">{crystalRecommendation}</span>
                </div>
                
                {/* 主导脉轮 */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent"></div>
                  <span className="text-muted-foreground">脉轮:</span>
                  <span className="font-medium">{dominantChakra}</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-center">
            <Button variant="outline" size="sm" onClick={goToToday}>
              回到今天
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 默认版本 - 推荐用于水晶日历
  return (
    <Card className={`quantum-card energy-card ${className}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center flex-1">
            {/* 日期显示 */}
            <div className="mb-3">
              <div className="text-2xl font-bold text-primary mb-1">
                {format(currentDate, 'dd', { locale: zhCN })}
              </div>
              <div className="text-sm text-muted-foreground">
                {format(currentDate, 'MM月 EEEE', { locale: zhCN })}
              </div>
            </div>
            
            {/* 能量和水晶信息 */}
            <div className="space-y-2">
              {/* 能量等级 */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">能量</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-1.5 h-1.5 rounded-full ${
                        level <= energyLevel
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium">{energyLevel}/5</span>
              </div>
              
              {/* 推荐水晶 */}
              <div className="flex items-center justify-center gap-1 text-xs">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-primary font-medium">{crystalRecommendation}</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={goToNextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={goToToday} className="text-xs px-3 py-1">
            今天
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
