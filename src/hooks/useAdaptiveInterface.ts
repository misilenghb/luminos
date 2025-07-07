'use client';

import { useState, useEffect, useMemo } from 'react';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface InterfacePreferences {
  showAdvancedFeatures: boolean;
  preferredLayout: 'compact' | 'detailed' | 'minimal';
  autoHideCompleted: boolean;
  enableAnimations: boolean;
  showTooltips: boolean;
  contentDensity: 'low' | 'medium' | 'high';
}

export interface AdaptiveInterfaceState {
  userLevel: UserLevel;
  preferences: InterfacePreferences;
  shouldShowOnboarding: boolean;
  recommendedActions: string[];
  adaptedComponents: {
    dashboard: 'simple' | 'standard' | 'advanced';
    exploration: 'guided' | 'standard' | 'expert';
    calendar: 'basic' | 'standard' | 'detailed';
  };
}

const STORAGE_KEY = 'adaptive_interface_state';
const USAGE_TRACKING_KEY = 'user_usage_tracking';

// 默认偏好设置
const getDefaultPreferences = (userLevel: UserLevel): InterfacePreferences => ({
  showAdvancedFeatures: userLevel === 'advanced',
  preferredLayout: userLevel === 'beginner' ? 'minimal' : userLevel === 'intermediate' ? 'compact' : 'detailed',
  autoHideCompleted: userLevel !== 'beginner',
  enableAnimations: true,
  showTooltips: userLevel === 'beginner',
  contentDensity: userLevel === 'beginner' ? 'low' : userLevel === 'intermediate' ? 'medium' : 'high'
});

// 使用追踪数据
interface UsageData {
  sessionCount: number;
  totalTimeSpent: number; // 分钟
  featuresUsed: string[];
  assessmentsCompleted: number;
  lastActiveDate: string;
  preferredPages: string[];
}

const useAdaptiveInterface = (profile?: UserProfileDataOutput) => {
  const [isClient, setIsClient] = useState(false);
  const [state, setState] = useState<AdaptiveInterfaceState>(() => {
    // 默认状态（避免水合错误）
    return {
      userLevel: 'beginner',
      preferences: getDefaultPreferences('beginner'),
      shouldShowOnboarding: true,
      recommendedActions: [],
      adaptedComponents: {
        dashboard: 'simple',
        exploration: 'guided',
        calendar: 'basic'
      }
    };
  });

  // 客户端初始化
  useEffect(() => {
    setIsClient(true);

    // 从本地存储加载状态
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const loadedState = JSON.parse(stored);
        setState(loadedState);
      }
    } catch (error) {
      console.warn('Failed to load adaptive interface state:', error);
    }
  }, []);

  // 获取使用数据
  const [usageData, setUsageData] = useState<UsageData>({
    sessionCount: 0,
    totalTimeSpent: 0,
    featuresUsed: [],
    assessmentsCompleted: 0,
    lastActiveDate: new Date().toISOString(),
    preferredPages: []
  });

  // 客户端加载使用数据
  useEffect(() => {
    if (!isClient) return;

    try {
      const stored = localStorage.getItem(USAGE_TRACKING_KEY);
      if (stored) {
        setUsageData(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load usage data:', error);
    }
  }, [isClient]);

  // 根据使用数据计算用户等级
  const calculateUserLevel = (usage: UsageData, profile?: UserProfileDataOutput): UserLevel => {
    let score = 0;

    // 会话次数权重
    if (usage.sessionCount >= 10) score += 2;
    else if (usage.sessionCount >= 5) score += 1;

    // 使用时长权重
    if (usage.totalTimeSpent >= 120) score += 2; // 2小时+
    else if (usage.totalTimeSpent >= 60) score += 1; // 1小时+

    // 功能使用权重
    if (usage.featuresUsed.length >= 8) score += 2;
    else if (usage.featuresUsed.length >= 4) score += 1;

    // 评估完成权重
    if (usage.assessmentsCompleted >= 2) score += 2;
    else if (usage.assessmentsCompleted >= 1) score += 1;

    // 档案完整度权重
    if (profile) {
      if (profile.mbtiLikeType && profile.inferredZodiac && profile.coreEnergyInsights) {
        score += 1;
      }
    }

    if (score >= 6) return 'advanced';
    if (score >= 3) return 'intermediate';
    return 'beginner';
  };

  // 生成推荐操作
  const generateRecommendedActions = (level: UserLevel, usage: UsageData, profile?: UserProfileDataOutput): string[] => {
    const actions: string[] = [];

    if (level === 'beginner') {
      if (!profile || !profile.mbtiLikeType) {
        actions.push('完成个性化评估');
      }
      if (usage.sessionCount < 3) {
        actions.push('探索仪表板功能');
      }
      if (usage.featuresUsed.length < 2) {
        actions.push('尝试水晶冥想');
      }
    } else if (level === 'intermediate') {
      if (usage.assessmentsCompleted < 2) {
        actions.push('完成增强版评估');
      }
      if (!usage.featuresUsed.includes('crystal_filtering')) {
        actions.push('使用水晶筛选系统');
      }
      if (usage.totalTimeSpent < 60) {
        actions.push('深入探索能量分析');
      }
    } else {
      if (!usage.featuresUsed.includes('advanced_analysis')) {
        actions.push('查看高级分析功能');
      }
      if (!usage.featuresUsed.includes('export_data')) {
        actions.push('导出个人数据');
      }
      actions.push('分享使用心得');
    }

    return actions.slice(0, 3); // 最多3个推荐
  };

  // 自适应组件配置
  const getAdaptedComponents = (level: UserLevel) => {
    switch (level) {
      case 'beginner':
        return {
          dashboard: 'simple' as const,
          exploration: 'guided' as const,
          calendar: 'basic' as const
        };
      case 'intermediate':
        return {
          dashboard: 'standard' as const,
          exploration: 'standard' as const,
          calendar: 'standard' as const
        };
      case 'advanced':
        return {
          dashboard: 'advanced' as const,
          exploration: 'expert' as const,
          calendar: 'detailed' as const
        };
    }
  };

  // 更新用户等级和偏好
  const updateAdaptiveState = () => {
    if (!isClient) return;

    const newLevel = calculateUserLevel(usageData, profile);
    const newPreferences = getDefaultPreferences(newLevel);
    const newRecommendedActions = generateRecommendedActions(newLevel, usageData, profile);
    const newAdaptedComponents = getAdaptedComponents(newLevel);

    const newState: AdaptiveInterfaceState = {
      userLevel: newLevel,
      preferences: { ...state.preferences, ...newPreferences },
      shouldShowOnboarding: newLevel === 'beginner' && usageData.sessionCount < 2,
      recommendedActions: newRecommendedActions,
      adaptedComponents: newAdaptedComponents
    };

    setState(newState);

    // 保存到本地存储
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    } catch (error) {
      console.warn('Failed to save adaptive interface state:', error);
    }
  };

  // 记录功能使用
  const trackFeatureUsage = (feature: string) => {
    if (!isClient) return;

    const newUsageData = {
      ...usageData,
      featuresUsed: [...new Set([...usageData.featuresUsed, feature])],
      lastActiveDate: new Date().toISOString()
    };

    setUsageData(newUsageData);

    try {
      localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(newUsageData));
    } catch (error) {
      console.warn('Failed to save usage data:', error);
    }
  };

  // 记录页面访问
  const trackPageVisit = (page: string) => {
    if (!isClient) return;

    const newUsageData = {
      ...usageData,
      preferredPages: [...usageData.preferredPages, page].slice(-10), // 保留最近10次访问
      sessionCount: usageData.sessionCount + 1,
      lastActiveDate: new Date().toISOString()
    };

    setUsageData(newUsageData);

    try {
      localStorage.setItem(USAGE_TRACKING_KEY, JSON.stringify(newUsageData));
    } catch (error) {
      console.warn('Failed to save usage data:', error);
    }
  };

  // 更新偏好设置
  const updatePreferences = (newPreferences: Partial<InterfacePreferences>) => {
    if (!isClient) return;

    const updatedState = {
      ...state,
      preferences: { ...state.preferences, ...newPreferences }
    };
    setState(updatedState);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
    } catch (error) {
      console.warn('Failed to save preferences:', error);
    }
  };

  // 初始化时更新状态
  useEffect(() => {
    if (isClient) {
      updateAdaptiveState();
    }
  }, [isClient, profile, usageData]);

  return {
    ...state,
    usageData,
    updateAdaptiveState,
    trackFeatureUsage,
    trackPageVisit,
    updatePreferences
  };
};

export default useAdaptiveInterface;
