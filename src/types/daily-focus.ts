// 日常专注页面相关类型定义

export interface DailyEnergyState {
  energyLevel: number;
  dominantChakra: string;
  recommendedCrystal: string;
  mbtiMood: string;
  elementBalance: string;
  date: Date;
  energyColor?: string;
  isSpecialDay?: boolean;
  specialType?: string;
  insights?: string[];
  recommendations?: string[];
}

export interface EnergyState {
  energyLevel: number;
  dominantChakra: string;
  recommendedCrystal: string;
  mbtiMood: string;
  elementBalance: string;
}

export interface DailyGuidanceResult {
  guidance: string;
  meditationPrompt: string;
  date: string;
  language: string;
}

export interface DashboardInsight {
  type: 'positive' | 'warning' | 'neutral';
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
}
