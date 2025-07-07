"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle2, Database, Lock, ShieldAlert, ShieldCheck, Unlock, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function OptimizationPage() {
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);
  const [isDisablingRLS, setIsDisablingRLS] = useState(false);
  const [isEnablingRLS, setIsEnablingRLS] = useState(false);
  const [rlsDisabled, setRlsDisabled] = useState(false);
  
  const handleFixRLS = async () => {
    setIsFixing(true);
    try {
      const response = await fetch('/api/system-health?action=fix-design-works-rls');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "修复成功",
          description: "设计作品表的RLS策略已成功修复",
        });
      } else {
        toast({
          title: "修复失败",
          description: data.message || "未知错误",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "修复失败",
        description: "请求过程中发生错误",
        variant: "destructive"
      });
      console.error("修复RLS策略失败:", error);
    } finally {
      setIsFixing(false);
    }
  };
  
  const handleDisableRLS = async () => {
    if (!window.confirm("⚠️ 警告: 临时禁用RLS策略会暂时关闭数据库安全限制。这是一个紧急措施，仅用于修复数据问题。确定要继续吗？")) {
      return;
    }
    
    setIsDisablingRLS(true);
    try {
      const response = await fetch('/api/system-health?action=disable-rls');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "RLS已禁用",
          description: "数据库安全策略已临时禁用，请在完成必要操作后立即重新启用",
          variant: "destructive"
        });
        setRlsDisabled(true);
      } else {
        toast({
          title: "禁用失败",
          description: data.message || "未知错误",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "禁用失败",
        description: "请求过程中发生错误",
        variant: "destructive"
      });
      console.error("禁用RLS策略失败:", error);
    } finally {
      setIsDisablingRLS(false);
    }
  };
  
  const handleEnableRLS = async () => {
    setIsEnablingRLS(true);
    try {
      const response = await fetch('/api/system-health?action=enable-rls');
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "RLS已启用",
          description: "数据库安全策略已重新启用",
        });
        setRlsDisabled(false);
      } else {
        toast({
          title: "启用失败",
          description: data.message || "未知错误",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "启用失败",
        description: "请求过程中发生错误",
        variant: "destructive"
      });
      console.error("启用RLS策略失败:", error);
    } finally {
      setIsEnablingRLS(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">系统优化与管理</h1>
      
      <Tabs defaultValue="database">
        <TabsList className="mb-6">
          <TabsTrigger value="database">
            <Database className="w-4 h-4 mr-2" />
            数据库优化
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="database" className="space-y-6">
          <Alert variant="destructive" className={rlsDisabled ? "animate-pulse" : "hidden"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>警告: 数据库安全策略已禁用</AlertTitle>
            <AlertDescription>
              当前数据库处于不安全状态，请在完成必要操作后立即重新启用RLS策略。
            </AlertDescription>
          </Alert>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2" />
                数据库安全策略修复
              </CardTitle>
              <CardDescription>
                修复行级安全策略(RLS)问题，解决保存设计作品时的授权错误
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <h3 className="font-medium">设计作品表RLS策略</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      修复设计作品表的行级安全策略，解决"保存失败: 未授权"错误
                    </p>
                  </div>
                  <Button onClick={handleFixRLS} disabled={isFixing}>
                    {isFixing ? (
                      <>
                        <Wrench className="mr-2 h-4 w-4 animate-spin" />
                        修复中...
                      </>
                    ) : (
                      <>
                        <Wrench className="mr-2 h-4 w-4" />
                        修复RLS策略
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
                  <div>
                    <h3 className="font-medium text-red-800 dark:text-red-300 flex items-center">
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      紧急操作: 临时禁用RLS
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      临时禁用行级安全策略，仅用于紧急情况下修复数据问题
                    </p>
                    <Badge variant="outline" className="mt-2 text-red-700 border-red-300">
                      仅限紧急使用
                    </Badge>
                  </div>
                  
                  {rlsDisabled ? (
                    <Button 
                      variant="default" 
                      onClick={handleEnableRLS} 
                      disabled={isEnablingRLS}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isEnablingRLS ? (
                        <>
                          <Lock className="mr-2 h-4 w-4 animate-spin" />
                          启用中...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          重新启用RLS
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="destructive" 
                      onClick={handleDisableRLS} 
                      disabled={isDisablingRLS}
                    >
                      {isDisablingRLS ? (
                        <>
                          <Unlock className="mr-2 h-4 w-4 animate-spin" />
                          禁用中...
                        </>
                      ) : (
                        <>
                          <Unlock className="mr-2 h-4 w-4" />
                          临时禁用RLS
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 text-sm text-muted-foreground">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p>RLS策略修复通常可以解决大多数授权相关问题。如果问题仍然存在，可以尝试临时禁用RLS进行紧急操作，但请在完成后立即重新启用。</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 