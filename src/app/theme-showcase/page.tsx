"use client";

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sun, Moon, CloudSun, CloudMoon, Palette, Sparkles, 
  Brain, Heart, Zap, Star, Gem, Target 
} from 'lucide-react';

export default function ThemeShowcasePage() {
  const { theme, setTheme } = useLanguage();

  const themes = [
    { value: 'morning', label: '晨曦', icon: <Sun className="h-4 w-4" />, description: '温暖启发' },
    { value: 'noon', label: '正午', icon: <CloudSun className="h-4 w-4" />, description: '清晰明亮' },
    { value: 'dusk', label: '黄昏', icon: <CloudMoon className="h-4 w-4" />, description: '温暖深邃' },
    { value: 'night', label: '夜晚', icon: <Moon className="h-4 w-4" />, description: '深邃神秘' },
  ];

  const features = [
    { icon: <Brain className="h-6 w-6" />, title: 'AI智能分析', description: '基于MBTI和脉轮的深度个性分析' },
    { icon: <Zap className="h-6 w-6" />, title: '能量追踪', description: '实时监控和预测你的能量状态' },
    { icon: <Gem className="h-6 w-6" />, title: '水晶指导', description: '个性化的水晶能量推荐' },
    { icon: <Target className="h-6 w-6" />, title: '智能日程', description: '根据能量状态优化日程安排' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container-center space-section max-w-6xl">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 energy-gradient">
            量子共振主题系统
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            科学与灵性的完美融合，为水晶日历系统打造的全新视觉体验
          </p>
        </div>

        {/* 主题切换器 */}
        <Card className="quantum-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              主题切换
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {themes.map((themeOption) => (
                <Button
                  key={themeOption.value}
                  variant={theme === themeOption.value ? "default" : "outline"}
                  onClick={() => setTheme(themeOption.value as any)}
                  className={`h-20 flex flex-col items-center gap-2 quantum-hover ${
                    theme === themeOption.value ? 'quantum-button-primary' : 'quantum-button-secondary'
                  }`}
                >
                  {themeOption.icon}
                  <div className="text-center">
                    <div className="font-medium">{themeOption.label}</div>
                    <div className="text-xs opacity-75">{themeOption.description}</div>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="text-center mt-4">
              <Badge variant="secondary" className="quantum-pulse">
                当前主题: {themes.find(t => t.value === theme)?.label}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 功能展示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="energy-card quantum-hover">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 动效演示 */}
        <Card className="quantum-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              量子动效演示
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 脉冲效果 */}
            <div className="text-center">
              <h4 className="font-medium mb-4">量子脉冲</h4>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 quantum-pulse">
                <Heart className="h-8 w-8 text-primary" />
              </div>
            </div>

            {/* 能量流动 */}
            <div className="text-center">
              <h4 className="font-medium mb-4">能量流动</h4>
              <div className="h-4 rounded-full energy-gradient"></div>
            </div>

            {/* 共振波动 */}
            <div className="text-center">
              <h4 className="font-medium mb-4">共振波动</h4>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 resonance-element">
                <Star className="h-8 w-8 text-secondary" />
              </div>
            </div>

            {/* 交互按钮 */}
            <div className="text-center space-x-4">
              <Button className="quantum-button-primary quantum-click">
                主要按钮
              </Button>
              <Button variant="outline" className="quantum-button-secondary quantum-click">
                次要按钮
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 色彩系统展示 */}
        <Card className="quantum-card mb-8">
          <CardHeader>
            <CardTitle>色彩系统</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-primary mx-auto mb-2"></div>
                <div className="text-sm font-medium">主色调</div>
                <div className="text-xs text-muted-foreground">量子蓝</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-secondary mx-auto mb-2"></div>
                <div className="text-sm font-medium">次要色</div>
                <div className="text-xs text-muted-foreground">能量紫</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-accent mx-auto mb-2"></div>
                <div className="text-sm font-medium">强调色</div>
                <div className="text-xs text-muted-foreground">生命绿</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-success mx-auto mb-2"></div>
                <div className="text-sm font-medium">成功色</div>
                <div className="text-xs text-muted-foreground">翡翠绿</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-lg bg-warning mx-auto mb-2"></div>
                <div className="text-sm font-medium">警告色</div>
                <div className="text-xs text-muted-foreground">琥珀橙</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 设计理念 */}
        <Card className="quantum-card">
          <CardHeader>
            <CardTitle>设计理念</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">双重性平衡</h4>
              <p className="text-sm text-muted-foreground">
                在科技与自然、理性与直觉、现代与古典之间找到完美的共振点
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">能量流动</h4>
              <p className="text-sm text-muted-foreground">
                通过渐变过渡、呼吸节奏和共振频率创造统一的视觉韵律
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">层次深度</h4>
              <p className="text-sm text-muted-foreground">
                从功能性到情感性，从表层交互到深层洞察的多维度体验
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
