'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Brain, Star, Zap, Gem, Sun } from 'lucide-react';
import type { ProfileDisplayProps } from './types';

const ProfileDisplayHub: React.FC<ProfileDisplayProps> = ({
  profile,
  mode,
  showElements = ['mbti', 'zodiac', 'energy'],
  interactive = false,
  compactMode = false,
  className = ''
}) => {
  // 默认档案数据
  const defaultProfile = {
    name: '用户',
    mbtiLikeType: 'XXXX',
    inferredZodiac: '未知',
    inferredElement: '未知',
    inferredPlanet: '未知',
    coreEnergyInsights: '暂无分析'
  };

  const displayProfile = profile || defaultProfile;

  // 获取元素图标
  const getElementIcon = (element: string) => {
    switch (element?.toLowerCase()) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'earth': return '🌍';
      case 'air': return '💨';
      default: return '✨';
    }
  };

  // 获取星座图标
  const getZodiacIcon = (zodiac: string) => {
    const zodiacIcons: Record<string, string> = {
      'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
      'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
      'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
    };
    return zodiacIcons[zodiac] || '⭐';
  };

  // 卡片模式（仪表板）
  const renderCardMode = () => (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{displayProfile.name}</div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {showElements.includes('mbti') && (
                <Badge variant="outline" className="text-xs">
                  {displayProfile.mbtiLikeType}
                </Badge>
              )}
              {showElements.includes('zodiac') && (
                <span>{getZodiacIcon(displayProfile.inferredZodiac)} {displayProfile.inferredZodiac}</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // 横幅模式
  const renderBannerMode = () => (
    <div className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-white/20 text-white">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{displayProfile.name}</h2>
            <div className="flex items-center space-x-3 text-purple-100">
              {showElements.includes('mbti') && (
                <span className="flex items-center">
                  <Brain className="h-4 w-4 mr-1" />
                  {displayProfile.mbtiLikeType}
                </span>
              )}
              {showElements.includes('zodiac') && (
                <span className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {displayProfile.inferredZodiac}
                </span>
              )}
              {showElements.includes('element') && (
                <span className="flex items-center">
                  {getElementIcon(displayProfile.inferredElement)} {displayProfile.inferredElement}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 详细模式（探索页）
  const renderDetailedMode = () => (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          个人档案
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 基本信息 */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{displayProfile.name}</h3>
              <p className="text-sm text-muted-foreground">个性化能量档案</p>
            </div>
          </div>

          {/* 详细属性 */}
          <div className="grid grid-cols-2 gap-4">
            {showElements.includes('mbti') && (
              <div className="flex items-center space-x-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-sm">性格类型:</span>
                <Badge>{displayProfile.mbtiLikeType}</Badge>
              </div>
            )}
            
            {showElements.includes('zodiac') && (
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">星座:</span>
                <span className="text-sm font-medium">
                  {getZodiacIcon(displayProfile.inferredZodiac)} {displayProfile.inferredZodiac}
                </span>
              </div>
            )}
            
            {showElements.includes('element') && (
              <div className="flex items-center space-x-2">
                <Gem className="h-4 w-4 text-green-500" />
                <span className="text-sm">元素:</span>
                <span className="text-sm font-medium">
                  {getElementIcon(displayProfile.inferredElement)} {displayProfile.inferredElement}
                </span>
              </div>
            )}
            
            {showElements.includes('planet') && (
              <div className="flex items-center space-x-2">
                <Sun className="h-4 w-4 text-orange-500" />
                <span className="text-sm">守护星:</span>
                <span className="text-sm font-medium">{displayProfile.inferredPlanet}</span>
              </div>
            )}
          </div>

          {/* 核心洞察 */}
          {showElements.includes('energy') && displayProfile.coreEnergyInsights && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-500" />
                核心能量洞察
              </h4>
              <p className="text-sm text-muted-foreground">
                {displayProfile.coreEnergyInsights}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // 最小化模式
  const renderMinimalMode = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Avatar className="h-6 w-6">
        <AvatarFallback>
          <User className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium">{displayProfile.name}</span>
      {showElements.includes('mbti') && (
        <Badge variant="outline" className="text-xs">
          {displayProfile.mbtiLikeType}
        </Badge>
      )}
    </div>
  );

  // 根据模式选择渲染方式
  switch (mode) {
    case 'card':
      return renderCardMode();
    case 'banner':
      return renderBannerMode();
    case 'detailed':
      return renderDetailedMode();
    case 'minimal':
      return renderMinimalMode();
    default:
      return renderCardMode();
  }
};

export default ProfileDisplayHub;
