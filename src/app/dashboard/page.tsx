'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 自动重定向到水晶日历
    const timer = setTimeout(() => {
      router.push('/daily-focus');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  const handleRedirect = () => {
    router.push('/daily-focus');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold heading-enhanced">
              仪表板已整合到水晶日历
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="space-y-4">
              <p className="text-lg card-text-primary">
                为了提供更好的用户体验，我们已将仪表板功能完全整合到水晶日历中。
              </p>
              <p className="card-text-secondary">
                现在您可以在一个统一的界面中享受：
              </p>
              <ul className="text-left space-y-2 max-w-md mx-auto">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>个性化能量分析</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>智能日程建议</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>水晶冥想指导</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>实时洞察报告</span>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleRedirect}
                size="lg"
                className="px-8 py-3 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                前往水晶日历
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              页面将在 3 秒后自动跳转...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}