"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Box, 
  User, 
  LogIn, 
  Eye, 
  GalleryHorizontal, 
  Settings,
  Info,
  Star,
  Calendar,
  Sparkles,
  Palette,
  Gem,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  profileService, 
  testSupabaseConnection,
  type UserProfile,
  supabase
} from '@/lib/supabase';

// 定义设计作品的接口
interface DesignWork {
  id: string;
  title?: string;
  description?: string;
  prompt?: string;
  image_url: string;
  thumbnail_url?: string;
  style?: string;
  category?: string;
  crystals_used?: string[];
  colors?: string[];
  tags?: string[];
  is_favorite?: boolean;
  is_public?: boolean;
  view_count?: number;
  like_count?: number;
  share_count?: number;
  created_at: string;
  updated_at?: string;
}

export default function GalleryPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [designs, setDesigns] = useState<DesignWork[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 加载用户数据
  useEffect(() => {
    async function loadUserData() {
      if (!user?.email || user.email.trim() === '') {
        console.warn('User email is not available');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // 测试 Supabase 连接（非阻塞性）
        const connectionTest = await testSupabaseConnection();
        if (!connectionTest) {
          console.warn('Supabase 连接测试失败，但继续尝试加载数据...');
        }

        // 先获取用户的档案来获取user_id
        const profile = await profileService.getUserProfileByEmail(user.email);
        if (!profile) {
          console.log('No user profile found, user may need to complete questionnaire');
          setUserProfile(null);
        } else {
          setUserProfile(profile);
        }

        // 使用 profile.id 作为用户标识符
        const userId = profile?.user_id || profile?.id;
        console.log('Loading designs for userId:', userId);

        if (userId) {
          // 从 design_works 表加载设计作品
          const { data: designsData, error } = await supabase
            .from('design_works')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error loading design works:', error);
            toast({
              title: "数据加载失败",
              description: "无法加载您的设计作品，请稍后重试。",
              variant: "destructive"
            });
            setDesigns([]);
          } else {
            console.log(`Loaded ${designsData?.length || 0} design works`);
            setDesigns(designsData || []);
          }
        } else {
          setDesigns([]);
        }

      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: "数据加载失败",
          description: "无法加载您的作品集数据，请稍后重试。",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated && user) {
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  // 加载状态
  if (isLoading || isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-500 mb-4" />
            <p className="text-muted-foreground">正在加载您的作品集...</p>
          </div>
        </div>
      </div>
    );
  }

  // 未登录状态
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <GalleryHorizontal className="mx-auto h-24 w-24 text-purple-500 mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              我的作品集
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              请先登录以查看您的个人作品集
            </p>
            <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                立即登录
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
            <GalleryHorizontal className="mr-3 h-10 w-10 text-purple-500" />
            我的作品集
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            展示您的创作历程和珍贵作品
          </p>
        </header>

        {/* 功能整合提示 */}
        <div className="mb-8">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>功能整合提示：</strong>作品集的核心统计功能已经整合到会员中心，您可以在{' '}
              <Link href="/settings" className="text-purple-600 hover:text-purple-800 underline">
                <Settings className="inline h-4 w-4 mr-1" />
                设置页面
              </Link>
              {' '}中查看详细的创作统计和个人数据。此页面提供完整的作品浏览功能。
            </AlertDescription>
          </Alert>
        </div>

        {/* 用户信息卡片 */}
        {userProfile && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5 text-purple-500" />
                {userProfile.name || '未名用户'}
              </CardTitle>
              <CardDescription>
                创作者 · {userProfile.email}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Palette className="h-8 w-8 text-purple-500 mb-2" />
                  <span className="text-2xl font-bold text-purple-600">{designs.length}</span>
                  <span className="text-sm text-gray-600">设计作品</span>
                </div>
                <div className="flex flex-col items-center">
                  <Star className="h-8 w-8 text-yellow-500 mb-2" />
                  <span className="text-2xl font-bold text-yellow-600">
                    {designs.reduce((sum, d) => sum + (d.share_count || 0), 0)}
                  </span>
                  <span className="text-sm text-gray-600">获赞数</span>
                </div>
                <div className="flex flex-col items-center">
                  <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold text-blue-600">
                    {new Set(designs.map(d => d.created_at?.split('T')[0])).size}
                  </span>
                  <span className="text-sm text-gray-600">创作天数</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-2xl font-bold text-green-600">
                    {designs.length > 0 ? '活跃' : '新手'}
                  </span>
                  <span className="text-sm text-gray-600">创作状态</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 作品展示区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Box className="mx-auto h-24 w-24 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                还没有创作作品
              </h3>
              <p className="text-gray-500 mb-6">
                开始您的创作之旅，打造专属的水晶珠宝设计
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild>
                  <Link href="/simple-design">
                    <Sparkles className="mr-2 h-4 w-4" />
                    简易设计
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/creative-workshop">
                    <Palette className="mr-2 h-4 w-4" />
                    创意工坊
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            designs.map((design, index) => (
              <Card key={design.id || index} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">
                    {design.title || `设计作品 ${index + 1}`}
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <Badge variant={design.style === 'elegant' ? 'default' : 'secondary'}>
                      {design.style || '简约'}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {design.created_at ? new Date(design.created_at).toLocaleDateString() : '未知'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {design.image_url && (
                    <div className="relative h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={design.image_url}
                        alt={design.title || '设计作品'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {design.description || design.prompt || '这是一个充满创意的水晶珠宝设计作品'}
                  </p>
                  {/* 显示水晶和颜色标签 */}
                  {(design.crystals_used && design.crystals_used.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {design.crystals_used.slice(0, 3).map((crystal, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Gem className="h-3 w-3 mr-1" />
                          {crystal}
                        </Badge>
                      ))}
                      {design.crystals_used.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{design.crystals_used.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Eye className="h-3 w-3 mr-1" />
                    <span className="mr-3">{design.view_count || 0}</span>
                    <Star className="h-3 w-3 mr-1" />
                    <span>{design.like_count || 0}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    查看详情
                  </Button>
                                 </CardFooter>
               </Card>
             ))
          )}
        </div>

        {/* 底部导航提示 */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            想要查看更多详细统计和个人数据？
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              前往设置中心
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
