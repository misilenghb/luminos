"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sun, Moon, CloudSun, CloudMoon, Palette, Type, Eye } from 'lucide-react';
import type { Theme } from '@/contexts/LanguageContext';

const ThemeTestComponent = () => {
  const { theme, setTheme, t } = useLanguage();

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'morning', label: '晨曦', icon: <Sun className="h-4 w-4" /> },
    { value: 'noon', label: '正午', icon: <CloudSun className="h-4 w-4" /> },
    { value: 'dusk', label: '黄昏', icon: <CloudMoon className="h-4 w-4" /> },
    { value: 'night', label: '夜晚', icon: <Moon className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 heading-enhanced">
            <Palette className="h-5 w-5" />
            主题配色测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {themes.map((themeOption) => (
              <Button
                key={themeOption.value}
                variant={theme === themeOption.value ? "default" : "outline"}
                onClick={() => setTheme(themeOption.value)}
                className="flex items-center gap-2"
              >
                {themeOption.icon}
                {themeOption.label}
              </Button>
            ))}
          </div>
          
          <div className="text-center">
            <Badge variant="secondary" className="text-xs-enhanced">
              当前主题: {themes.find(t => t.value === theme)?.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 heading-enhanced">
            <Type className="h-5 w-5" />
            字体清晰度测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 标题文本测试 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium card-text-primary">标题文本 (heading-enhanced)</h4>
            <h1 className="text-3xl heading-enhanced">大标题 - 水晶能量日历</h1>
            <h2 className="text-2xl heading-enhanced">中标题 - 今日能量洞察</h2>
            <h3 className="text-xl heading-enhanced">小标题 - 个性化指导</h3>
          </div>

          {/* 正文文本测试 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium card-text-primary">正文文本</h4>
            <p className="card-text-primary">
              主要文本 - 这是一段主要的正文内容，用于测试在不同主题下的可读性。
            </p>
            <p className="card-text-secondary">
              次要文本 - 这是一段次要的正文内容，通常用于描述性信息。
            </p>
            <p className="text-xs-enhanced card-text-secondary">
              小字文本 - 这是增强版的小字文本，用于标签和提示信息。
            </p>
          </div>

          {/* 对比度测试 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium card-text-primary">对比度测试</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                <div className="font-medium btn-text-primary">主色调文本</div>
                <div className="text-sm opacity-90">在主色调背景上的文本</div>
              </div>
              <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                <div className="font-medium">次要色调文本</div>
                <div className="text-sm opacity-90">在次要色调背景上的文本</div>
              </div>
              <div className="p-4 bg-muted text-muted-foreground rounded-lg">
                <div className="font-medium">静音色调文本</div>
                <div className="text-sm">在静音色调背景上的文本</div>
              </div>
            </div>
          </div>

          {/* 增强样式测试 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium card-text-primary">增强样式测试</h4>
            <div className="space-y-2">
              <p className="text-enhanced">增强文本 - 在所有主题下都有最佳可读性</p>
              <p className="text-contrast-high">高对比度文本 - 用于重要信息</p>
              <p className="text-contrast-medium">中对比度文本 - 用于一般信息</p>
              <p className="text-contrast-low">低对比度文本 - 用于辅助信息</p>
            </div>
          </div>

          {/* 渐变背景测试 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium card-text-primary">渐变背景文本测试</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50">
                <h5 className="font-medium mb-2 heading-enhanced">浅色渐变</h5>
                <p className="text-sm card-text-secondary">
                  在浅色渐变背景上的文本内容，测试可读性。
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100">
                <h5 className="font-medium mb-2 heading-enhanced">深色渐变</h5>
                <p className="text-sm card-text-secondary">
                  在深色渐变背景上的文本内容，测试可读性。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 heading-enhanced">
            <Eye className="h-5 w-5" />
            视觉效果测试
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium card-text-primary">按钮样式</h4>
              <div className="space-y-2">
                <Button className="w-full btn-text-primary">主要按钮</Button>
                <Button variant="secondary" className="w-full">次要按钮</Button>
                <Button variant="outline" className="w-full">轮廓按钮</Button>
                <Button variant="ghost" className="w-full">幽灵按钮</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium card-text-primary">徽章样式</h4>
              <div className="flex flex-wrap gap-2">
                <Badge>默认徽章</Badge>
                <Badge variant="secondary">次要徽章</Badge>
                <Badge variant="outline">轮廓徽章</Badge>
                <Badge variant="destructive">警告徽章</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThemeTestComponent;
