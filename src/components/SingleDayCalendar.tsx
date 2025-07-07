'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface SingleDayCalendarProps {
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  energyLevel?: number;
  crystalRecommendation?: string;
  className?: string;
}

export default function SingleDayCalendar({
  selectedDate = new Date(),
  onDateChange,
  energyLevel = 3,
  crystalRecommendation = "紫水晶",
  className = ""
}: SingleDayCalendarProps) {
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 样式1: 简约卡片式 */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-center text-lg">今日日期</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
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
            <Button variant="ghost" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            回到今天
          </Button>
        </CardContent>
      </Card>

      {/* 样式2: 圆形日期显示 */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center text-white shadow-lg">
                <div className="text-2xl font-bold">
                  {format(currentDate, 'dd', { locale: zhCN })}
                </div>
                <div className="text-xs opacity-90">
                  {format(currentDate, 'MMM', { locale: zhCN })}
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="text-sm font-medium">
                  {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(currentDate, 'EEEE', { locale: zhCN })}
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 样式3: 能量主题日历 */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">
                  {format(currentDate, 'MM月dd日', { locale: zhCN })}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                {format(currentDate, 'yyyy年 EEEE', { locale: zhCN })}
              </div>
              
              {/* 能量指示器 */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs text-muted-foreground">能量等级</span>
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
                <span className="text-xs font-medium">{energyLevel}/5</span>
              </div>
              
              {/* 推荐水晶 */}
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>推荐: {crystalRecommendation}</span>
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

      {/* 样式4: 极简横向布局 */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {format(currentDate, 'dd', { locale: zhCN })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(currentDate, 'EEE', { locale: zhCN })}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm font-medium">
                  {format(currentDate, 'MM月', { locale: zhCN })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(currentDate, 'yyyy', { locale: zhCN })}
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 样式5: 紧凑型 */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 border">
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
    </div>
  );
}
