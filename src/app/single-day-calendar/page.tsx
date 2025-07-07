'use client';

import React, { useState } from 'react';
import SingleDayCalendar from '@/components/SingleDayCalendar';
import CrystalDayPicker from '@/components/CrystalDayPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SingleDayCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">单日日历样式展示</h1>
          <p className="text-muted-foreground">
            专为水晶日历设计的单日显示样式，简洁美观，专注于单日信息
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 样式说明 */}
          <div className="md:col-span-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>样式特点</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">🎨 样式1: 简约卡片式</h4>
                    <p className="text-muted-foreground">经典卡片布局，信息层次清晰</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">⭕ 样式2: 圆形日期显示</h4>
                    <p className="text-muted-foreground">圆形设计，视觉焦点突出</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">⚡ 样式3: 能量主题日历</h4>
                    <p className="text-muted-foreground">集成能量和水晶信息</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">📏 样式4: 极简横向布局</h4>
                    <p className="text-muted-foreground">横向排列，节省垂直空间</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">📱 样式5: 紧凑型</h4>
                    <p className="text-muted-foreground">最小化设计，适合移动端</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 当前选中日期显示 */}
          <div className="md:col-span-2 mb-6">
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-1">当前选中日期</p>
                <p className="text-lg font-semibold">
                  {selectedDate.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 推荐样式: 水晶日历专用 */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="text-xl font-semibold text-center mb-4">🌟 推荐样式 - 水晶日历专用</h3>

            {/* 默认版本 - 最推荐 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-center text-muted-foreground">默认版本 (推荐)</h4>
              <CrystalDayPicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                energyLevel={4}
                crystalRecommendation="紫水晶"
                dominantChakra="心轮"
                variant="default"
              />
            </div>

            {/* 详细版本 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-center text-muted-foreground">详细版本</h4>
              <CrystalDayPicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                energyLevel={3}
                crystalRecommendation="玫瑰石英"
                dominantChakra="喉轮"
                variant="detailed"
              />
            </div>

            {/* 紧凑版本 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-center text-muted-foreground">紧凑版本</h4>
              <CrystalDayPicker
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                energyLevel={5}
                crystalRecommendation="白水晶"
                dominantChakra="顶轮"
                variant="compact"
              />
            </div>
          </div>

          {/* 原始样式展示 */}
          <div className="md:col-span-2 mt-8">
            <h3 className="text-xl font-semibold text-center mb-4">📚 更多样式选择</h3>
            <SingleDayCalendar
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              energyLevel={4}
              crystalRecommendation="紫水晶"
            />
          </div>
        </div>

        {/* 使用建议 */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle>使用建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">🎯 适用场景</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>水晶日历的主要日期选择器</li>
                    <li>能量状态的日期导航</li>
                    <li>冥想记录的日期选择</li>
                    <li>个人能量追踪界面</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">✨ 推荐样式</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>CrystalDayPicker 默认版本</strong>: 最适合水晶日历，平衡了信息展示和空间占用</li>
                    <li><strong>CrystalDayPicker 详细版本</strong>: 信息最全面，适合主要展示区域</li>
                    <li><strong>CrystalDayPicker 紧凑版本</strong>: 最节省空间，适合移动端或侧边栏</li>
                    <li><strong>原始样式3 (能量主题)</strong>: 功能丰富，适合需要更多交互的场景</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">🔧 自定义选项</h4>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>可以调整能量等级显示 (1-5级)</li>
                    <li>可以自定义推荐水晶名称</li>
                    <li>支持日期变更回调函数</li>
                    <li>可以自定义样式类名</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
