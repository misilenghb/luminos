"use client"

import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { zhCN } from 'date-fns/locale';

export default function TestCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">日历样式测试</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 标准日历 */}
          <Card>
            <CardHeader>
              <CardTitle>标准日历</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={zhCN}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* 紧凑日历 */}
          <Card>
            <CardHeader>
              <CardTitle>紧凑日历</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={zhCN}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>

          {/* 水晶日历样式 */}
          <Card className="crystal-calendar-widget">
            <CardHeader>
              <CardTitle>水晶日历样式</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={zhCN}
                className="rounded-md border-0"
              />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            选中日期: {selectedDate ? selectedDate.toLocaleDateString('zh-CN') : '未选择'}
          </p>
        </div>
      </div>
    </div>
  );
}
