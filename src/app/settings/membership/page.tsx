"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Crown, 
  Star, 
  Gem, 
  Sparkles, 
  Zap, 
  Palette, 
  Image, 
  Bot, 
  Calendar,
  Clock,
  Users,
  Shield,
  Infinity,
  Check,
  X,
  Gift,
  TrendingUp,
  Settings,
  CreditCard,
  Activity,
  BarChart3,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { 
  membershipService, 
  profileService, 
  designService, 
  energyService, 
  meditationService,
  testSupabaseConnection,
  type MembershipInfo,
  type UserProfile,
  type UsageStats 
} from '@/lib/supabase';

// 会员数据类型
interface MembershipStats {
  currentPlan: 'free' | 'premium' | 'ultimate';
  designsGenerated: number;
  imagesCreated: number;
  aiConsultations: number;
  energyAnalyses: number;
  meditationSessions: number;
  joinDate: string;
  nextBilling?: string;
  usageThisMonth: {
    designs: number;
    images: number;
    consultations: number;
    meditation: number;
    limit: {
      designs: number | null;
      images: number | null;
      consultations: number | null;
    };
  };
}

interface PlanFeature {
  name: string;
  free: boolean | string;
  premium: boolean | string;
  ultimate: boolean | string;
  highlight?: boolean;
}

// 会员计划特性
const planFeatures: PlanFeature[] = [
  {
    name: "基础设计生成",
    free: "3次/天",
    premium: "无限制",
    ultimate: "无限制"
  },
  {
    name: "AI图像生成",
    free: "1张/设计",
    premium: "5张/设计",
    ultimate: "无限制",
    highlight: true
  },
  {
    name: "高级设计风格",
    free: false,
    premium: true,
    ultimate: true
  },
  {
    name: "配饰智能推荐",
    free: "基础推荐",
    premium: "高级推荐",
    ultimate: "专业推荐"
  },
  {
    name: "能量档案分析",
    free: "基础分析",
    premium: "深度分析",
    ultimate: "专业分析"
  },
  {
    name: "水晶日历功能",
    free: true,
    premium: true,
    ultimate: true
  },
  {
    name: "冥想指导系统",
    free: "基础冥想",
    premium: "高级指导",
    ultimate: "个性化定制"
  },
  {
    name: "作品保存",
    free: "10个作品",
    premium: "500个作品",
    ultimate: "无限制"
  },
  {
    name: "高清图像下载",
    free: false,
    premium: true,
    ultimate: true,
    highlight: true
  },
  {
    name: "AI模型选择",
    free: "标准模型",
    premium: "高级模型",
    ultimate: "所有模型"
  },
  {
    name: "优先客服支持",
    free: false,
    premium: true,
    ultimate: true
  },
  {
    name: "独家水晶数据库",
    free: false,
    premium: false,
    ultimate: true,
    highlight: true
  },
  {
    name: "专属设计师咨询",
    free: false,
    premium: false,
    ultimate: "1次/月"
  }
];

export default function MembershipPage() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [membershipInfo, setMembershipInfo] = useState<MembershipInfo | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [membershipStats, setMembershipStats] = useState<MembershipStats | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'ultimate'>('premium');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isAuthLoading, router]);

  // 加载用户数据
  useEffect(() => {
    async function loadMembershipData() {
      if (!user?.email || user.email.trim() === '') {
        console.warn('User email is not available');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        // 测试 Supabase 连接（非阻塞性）
        await testSupabaseConnection();

        // 获取用户档案
        const profile = await profileService.getUserProfileByEmail(user.email);
        if (!profile) {
          console.log('No user profile found, user needs to complete questionnaire');
          // 创建一个默认的统计对象，显示新用户状态
          const defaultStats: MembershipStats = {
            currentPlan: 'free',
            designsGenerated: 0,
            imagesCreated: 0,
            aiConsultations: 0,
            energyAnalyses: 0,
            meditationSessions: 0,
            joinDate: new Date().toISOString(),
            usageThisMonth: {
              designs: 0,
              images: 0,
              consultations: 0,
              meditation: 0,
              limit: {
                designs: 30,
                images: 15,
                consultations: 5,
              }
            }
          };
          setMembershipStats(defaultStats);
          setIsLoading(false);
          return;
        }

        setUserProfile(profile);

        // 并行获取会员信息和使用统计
        const [membership, usage, designs, energyRecords, meditationSessions] = await Promise.all([
          membershipService.getUserMembership(profile.user_id),
          membershipService.getUserUsageStats(profile.user_id, 6),
          designService.getUserDesigns(profile.user_id),
          energyService.getUserEnergyRecords(profile.user_id, 30),
          meditationService.getUserMeditationSessions(profile.user_id, 30)
        ]);

        setMembershipInfo(membership);
        setUsageStats(usage);

        // 计算会员统计
        const currentDate = new Date();
        const joinDate = profile.created_at;
        const currentMonth = currentDate.toISOString().slice(0, 7) + '-01';
        const currentMonthUsage = usage.find(u => u.month === currentMonth);

        const stats: MembershipStats = {
          currentPlan: membership?.type || 'free',
          designsGenerated: designs.length,
          imagesCreated: designs.length, // 假设每个设计有一张图片
          aiConsultations: currentMonthUsage?.ai_consultations || 0,
          energyAnalyses: energyRecords.length,
          meditationSessions: meditationSessions.length,
          joinDate,
          nextBilling: membership?.expired_at,
          usageThisMonth: {
            designs: currentMonthUsage?.designs_generated || 0,
            images: currentMonthUsage?.images_created || 0,
            consultations: currentMonthUsage?.ai_consultations || 0,
            meditation: currentMonthUsage?.meditation_sessions || 0,
            limit: {
              designs: membership?.type === 'free' ? 30 : null,
              images: membership?.type === 'free' ? 15 : null,
              consultations: membership?.type === 'free' ? 5 : null,
            }
          }
        };

        setMembershipStats(stats);

      } catch (error) {
        console.error('Error loading membership data:', error);
        toast({
          title: "数据加载失败",
          description: "无法加载您的会员信息，请稍后重试。",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated && user) {
      loadMembershipData();
    }
  }, [isAuthenticated, user, toast]);

  const handleUpgrade = (plan: 'premium' | 'ultimate') => {
    toast({
      title: "升级功能",
      description: `${plan === 'premium' ? '高级版' : '终极版'}升级功能正在开发中，敬请期待！`
    });
  };

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-muted-foreground';
      case 'premium': return 'text-blue-600';
      case 'ultimate': return 'text-purple-600';
      default: return 'text-muted-foreground';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'free': return 'secondary' as const;
      case 'premium': return 'default' as const;
      case 'ultimate': return 'destructive' as const;
      default: return 'secondary' as const;
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'free': return '免费版';
      case 'premium': return '高级版';
      case 'ultimate': return '终极版';
      default: return '未知';
    }
  };

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">正在加载会员信息...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-16">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Crown className="mr-2"/>
              需要登录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>请登录以查看您的会员信息</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">立即登录</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* 页面标题 */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-headline font-bold gradient-text halo-effect flex items-center justify-center">
          <Crown className="mr-3 h-10 w-10" />
          会员中心
        </h1>
        <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
          解锁水晶设计AI的全部潜力，享受专属功能与服务
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid gap-8">
        {/* 当前状态概览 */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* 会员状态卡 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    当前计划
                    <Badge variant={getPlanBadgeVariant(membershipStats?.currentPlan || 'free')}>
                      {getPlanName(membershipStats?.currentPlan || 'free')}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    账户：{user?.email} | 加入时间：{membershipStats?.joinDate ? new Date(membershipStats.joinDate).toLocaleDateString('zh-CN') : '未知'}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Crown className={`h-8 w-8 ${getPlanColor(membershipStats?.currentPlan || 'free')}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {membershipStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{membershipStats.designsGenerated}</div>
                    <div className="text-xs text-muted-foreground">设计总数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">{membershipStats.imagesCreated}</div>
                    <div className="text-xs text-muted-foreground">生成图片</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">{membershipStats.meditationSessions}</div>
                    <div className="text-xs text-muted-foreground">冥想次数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">{membershipStats.energyAnalyses}</div>
                    <div className="text-xs text-muted-foreground">能量分析</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 本月使用情况 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <TrendingUp className="mr-2 h-4 w-4" />
                本月使用情况
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {membershipStats && (
                <>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>设计生成</span>
                      <span>{membershipStats.usageThisMonth.designs}/{membershipStats.usageThisMonth.limit.designs || '∞'}</span>
                    </div>
                    <Progress 
                      value={membershipStats.currentPlan === 'free' ? (membershipStats.usageThisMonth.designs / (membershipStats.usageThisMonth.limit.designs || 1)) * 100 : 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>图像生成</span>
                      <span>{membershipStats.usageThisMonth.images}/{membershipStats.usageThisMonth.limit.images || '∞'}</span>
                    </div>
                    <Progress 
                      value={membershipStats.currentPlan === 'free' ? (membershipStats.usageThisMonth.images / (membershipStats.usageThisMonth.limit.images || 1)) * 100 : 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>AI咨询</span>
                      <span>{membershipStats.usageThisMonth.consultations}/{membershipStats.usageThisMonth.limit.consultations || '∞'}</span>
                    </div>
                    <Progress 
                      value={membershipStats.currentPlan === 'free' ? (membershipStats.usageThisMonth.consultations / (membershipStats.usageThisMonth.limit.consultations || 1)) * 100 : 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>冥想记录</span>
                      <span>{membershipStats.usageThisMonth.meditation}/∞</span>
                    </div>
                    <Progress 
                      value={100} 
                      className="h-2"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 升级计划 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary" />
              升级您的体验
            </CardTitle>
            <CardDescription>
              选择最适合您的计划，解锁更多创意可能
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* 高级版 */}
              <Card className={`cursor-pointer transition-all ${selectedPlan === 'premium' ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="text-center" onClick={() => setSelectedPlan('premium')}>
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-blue-600">高级版</CardTitle>
                  <CardDescription>适合设计爱好者</CardDescription>
                  <div className="text-3xl font-bold">¥68<span className="text-sm font-normal text-muted-foreground">/月</span></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    无限设计生成
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    5张/设计图像生成
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    高级AI模型
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    500个作品存储
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    高级冥想指导
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={selectedPlan === 'premium' ? 'default' : 'outline'}
                    onClick={() => handleUpgrade('premium')}
                  >
                    {selectedPlan === 'premium' ? '选择高级版' : '了解详情'}
                  </Button>
                </CardFooter>
              </Card>

              {/* 终极版 */}
              <Card className={`cursor-pointer transition-all ${selectedPlan === 'ultimate' ? 'ring-2 ring-purple-500' : ''}`}>
                <CardHeader className="text-center" onClick={() => setSelectedPlan('ultimate')}>
                  <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <Crown className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-purple-600">
                    终极版
                    <Badge variant="destructive" className="ml-2 text-xs">推荐</Badge>
                  </CardTitle>
                  <CardDescription>专业设计师必备</CardDescription>
                  <div className="text-3xl font-bold">¥168<span className="text-sm font-normal text-muted-foreground">/月</span></div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    所有高级版功能
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    无限图像生成
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    独家水晶数据库
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    专属设计师咨询
                  </div>
                  <div className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    个性化冥想定制
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={selectedPlan === 'ultimate' ? 'default' : 'outline'}
                    onClick={() => handleUpgrade('ultimate')}
                  >
                    {selectedPlan === 'ultimate' ? '选择终极版' : '了解详情'}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* 功能对比表 */}
        <Card>
          <CardHeader>
            <CardTitle>功能对比</CardTitle>
            <CardDescription>详细了解各版本功能差异</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-medium">功能</th>
                    <th className="text-center py-3 px-4 font-medium">免费版</th>
                    <th className="text-center py-3 px-4 font-medium text-blue-600">高级版</th>
                    <th className="text-center py-3 pl-4 font-medium text-purple-600">终极版</th>
                  </tr>
                </thead>
                <tbody>
                  {planFeatures.map((feature, index) => (
                    <tr key={index} className={`border-b ${feature.highlight ? 'bg-accent/20' : ''}`}>
                      <td className="py-3 pr-4 font-medium">
                        {feature.name}
                        {feature.highlight && <Star className="inline h-3 w-3 text-yellow-500 ml-1" />}
                      </td>
                      <td className="text-center py-3 px-4">
                        {renderFeatureValue(feature.free)}
                      </td>
                      <td className="text-center py-3 px-4">
                        {renderFeatureValue(feature.premium)}
                      </td>
                      <td className="text-center py-3 pl-4">
                        {renderFeatureValue(feature.ultimate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 使用统计 */}
        {usageStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                使用统计
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {usageStats.slice(0, 6).map((stat) => (
                  <div key={stat.month} className="bg-muted/30 rounded-lg p-4">
                    <div className="text-sm font-medium mb-2">
                      {new Date(stat.month).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>设计：</span>
                        <span>{stat.designs_generated}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>图片：</span>
                        <span>{stat.images_created}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>冥想：</span>
                        <span>{stat.meditation_sessions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>咨询：</span>
                        <span>{stat.ai_consultations}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 快速操作 */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                账户设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                管理您的个人信息和偏好设置
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/settings">
                  前往设置
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Palette className="mr-2 h-4 w-4" />
                创作中心
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                开始新的设计创作之旅
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/creative-workshop">
                  开始创作
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Gift className="mr-2 h-4 w-4" />
                我的作品
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                查看和管理您的所有创作
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/gallery">
                  查看作品集
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 会员专享内容 */}
        {membershipStats && membershipStats.currentPlan !== 'free' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-2 h-5 w-5 text-primary" />
                会员专享
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-accent" />
                  本月专享福利
                </h4>
                <div className="space-y-2 text-sm">
                  <div>• 额外50%设计生成配额</div>
                  <div>• 独家水晶能量解读</div>
                  <div>• 优先客服支持</div>
                  <div>• 高级冥想引导功能</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                  即将推出
                </h4>
                <div className="space-y-2 text-sm">
                  <div>• 3D设计预览功能</div>
                  <div>• 个性化水晶推荐</div>
                  <div>• 设计师社区功能</div>
                  <div>• 智能能量分析报告</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 新用户引导 */}
        {membershipStats && (
          <>
            {/* 没有档案的新用户 */}
            {!userProfile && (
              <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-700 dark:text-amber-300">
                    <Sparkles className="mr-2 h-5 w-5" />
                    欢迎来到Luminos灵境！
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
                    开始您的个性化水晶能量之旅，首先需要完成能量档案分析，让我们了解您的独特能量特质。
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white">
                      <Link href="/energy-exploration">
                        <Activity className="mr-2 h-4 w-4" />
                        开始能量档案分析
                      </Link>
                    </Button>
                    <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100" asChild>
                      <Link href="/simple-design">
                        <Palette className="mr-2 h-4 w-4" />
                        先体验简单设计
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* 有档案但没有作品的用户 */}
            {userProfile && membershipStats.designsGenerated === 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-primary" />
                    开始您的水晶创作之旅
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    太好了！您已经完成了能量档案。现在可以开始创建个性化的水晶设计作品了！
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button asChild>
                      <Link href="/creative-workshop">
                        <Palette className="mr-2 h-4 w-4" />
                        创建第一个设计
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/daily-focus">
                        <Calendar className="mr-2 h-4 w-4" />
                        查看水晶日历
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
