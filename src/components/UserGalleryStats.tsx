"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, 
  TrendingUp,
  Star,
  Calendar,
  Sparkles,
  Palette,
  Gem,
  Heart,
  Share2,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  designService, 
  profileService, 
  energyService, 
  meditationService,
  type DesignWork,
  type UserProfile,
  type EnergyRecord,
  type MeditationSession
} from '@/lib/supabase';

interface UserStats {
  totalWorks: number;
  totalLikes: number;
  totalShares: number;
  favoriteStyle: string;
  favoriteCrystal: string;
  creationDays: number;
  meditationSessions: number;
  energyRecords: number;
}

export default function UserGalleryStats() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentWorks, setRecentWorks] = useState<DesignWork[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载用户数据
  useEffect(() => {
    async function loadUserData() {
      if (!user?.email || user.email.trim() === '') {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // 获取用户档案
        const profile = await profileService.getUserProfileByEmail(user.email);
        if (!profile) {
          setIsLoading(false);
          return;
        }

        const userId = profile.user_id || profile.id;

        // 并行加载数据
        const [designsData, energyData, meditationData] = await Promise.all([
          designService.getUserDesigns(userId).catch(() => []),
          energyService.getUserEnergyRecords(userId, 30).catch(() => []),
          meditationService.getUserMeditationSessions(userId, 50).catch(() => [])
        ]);

        // 获取最近的5个作品
        const recentWorks = designsData.slice(0, 5);
        setRecentWorks(recentWorks);

        // 计算统计
        const stats = calculateUserStats(designsData, energyData, meditationData);
        setUserStats(stats);

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

  // 计算用户统计
  const calculateUserStats = (
    designs: DesignWork[], 
    energyRecords: EnergyRecord[], 
    meditationSessions: MeditationSession[]
  ): UserStats => {
    const totalLikes = designs.reduce((sum, design) => sum + (design.share_count || 0), 0);
    const favoriteStyle = getMostFrequentStyle(designs);
    const favoriteCrystal = getMostFrequentCrystal(designs);
    const creationDays = getUniqueDays(designs);

    return {
      totalWorks: designs.length,
      totalLikes,
      totalShares: Math.floor(totalLikes * 0.3),
      favoriteStyle: favoriteStyle || '简约风',
      favoriteCrystal: favoriteCrystal || '紫水晶',
      creationDays,
      meditationSessions: meditationSessions.length,
      energyRecords: energyRecords.length
    };
  };

  const getMostFrequentStyle = (designs: DesignWork[]): string => {
    const styles = designs.map(d => d.style).filter(Boolean) as string[];
    if (styles.length === 0) return '简约风';
    
    const frequency = styles.reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  };

  const getMostFrequentCrystal = (designs: DesignWork[]): string => {
    const crystals = designs.flatMap(d => d.crystals_used || []);
    if (crystals.length === 0) return '紫水晶';
    
    const frequency = crystals.reduce((acc, crystal) => {
      acc[crystal] = (acc[crystal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  };

  const getUniqueDays = (designs: DesignWork[]): number => {
    const dates = designs.map(d => new Date(d.created_at).toDateString());
    return new Set(dates).size;
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary"/>
            作品集统计
          </CardTitle>
          <CardDescription>您的创作统计和能量记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userStats) {
    return (
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-primary"/>
            作品集统计
          </CardTitle>
          <CardDescription>您的创作统计和能量记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            暂无数据，开始您的创作之旅吧！
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5 text-primary"/>
          作品集统计
        </CardTitle>
        <CardDescription>您的创作统计和能量记录</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 核心统计 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{userStats.totalWorks}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center mt-1">
                <Palette className="mr-1 h-4 w-4" />
                设计作品
              </div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userStats.creationDays}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center mt-1">
                <Calendar className="mr-1 h-4 w-4" />
                创作天数
              </div>
            </div>
          </div>

          {/* 互动统计 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-red-50 to-orange-50 rounded-lg">
              <div className="text-lg font-semibold text-red-600">{userStats.totalLikes}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center mt-1">
                <Heart className="mr-1 h-3 w-3" />
                获得点赞
              </div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{userStats.totalShares}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center mt-1">
                <Share2 className="mr-1 h-3 w-3" />
                作品分享
              </div>
            </div>
          </div>

          {/* 偏好统计 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">偏好风格</span>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                <Sparkles className="mr-1 h-3 w-3" />
                {userStats.favoriteStyle}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">偏好水晶</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Gem className="mr-1 h-3 w-3" />
                {userStats.favoriteCrystal}
              </Badge>
            </div>
          </div>

          {/* 能量记录 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">{userStats.meditationSessions}</div>
              <div className="text-xs text-muted-foreground">冥想记录</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-indigo-600">{userStats.energyRecords}</div>
              <div className="text-xs text-muted-foreground">能量记录</div>
            </div>
          </div>

          {/* 最近作品 */}
          {recentWorks.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">最近作品</div>
              <div className="flex flex-wrap gap-1">
                {recentWorks.map((work, index) => (
                  <Badge key={work.id} variant="outline" className="text-xs">
                    {work.title || `作品 ${index + 1}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* 查看详情按钮 */}
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => window.open('/gallery', '_blank')}
          >
            <Eye className="mr-2 h-4 w-4" />
            查看完整作品集
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 