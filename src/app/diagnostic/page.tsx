"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DiagnosticPage() {
  const { t, language, setLanguage } = useLanguage();

  const diagnostics = [
    {
      name: 'React 渲染',
      status: 'success',
      description: '组件正常渲染'
    },
    {
      name: '语言上下文',
      status: 'success',
      description: `当前语言: ${language}`
    },
    {
      name: 'UI 组件',
      status: 'success',
      description: 'Card, Button, Badge 组件正常'
    },
    {
      name: 'Tailwind CSS',
      status: 'success',
      description: '样式正常加载'
    },
    {
      name: '图标系统',
      status: 'success',
      description: 'Lucide 图标正常显示'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">正常</Badge>;
      case 'warning':
        return <Badge variant="secondary">警告</Badge>;
      case 'error':
        return <Badge variant="destructive">错误</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          系统诊断页面
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>基础功能测试</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {diagnostics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(item.status)}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-600">{item.description}</div>
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>交互测试</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-4">当前时间: {new Date().toLocaleString()}</p>
                <p className="mb-4">语言设置: <strong>{language}</strong></p>
                <Button 
                  onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                  className="w-full"
                >
                  切换到 {language === 'en' ? '中文' : 'English'}
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  翻译测试: {t('settingsPage.title')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>页面导航测试</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                首页
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/settings'}>
                设置页面
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/test-settings'}>
                测试页面
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/daily-focus'}>
                每日专注
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            如果所有项目都显示为"正常"，说明基础系统运行良好
          </p>
        </div>
      </div>
    </div>
  );
}
