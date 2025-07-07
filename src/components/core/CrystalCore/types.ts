import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

export type CrystalRecommendationMode = 
  | 'daily'        // 仪表板：每日推荐
  | 'meditation'   // 日历页：冥想引导
  | 'healing'      // 探索页：疗愈分析
  | 'filtering';   // 筛选系统

export interface CrystalDisplayProps {
  profile?: UserProfileDataOutput;
  mode: CrystalRecommendationMode;
  currentEnergy?: number;
  currentMood?: string;
  dailyGoals?: string[];
  className?: string;
}

export interface Crystal {
  name: string;
  englishName: string;
  color: string;
  chakra: string;
  properties: string[];
  benefits: string[];
  usage: string;
  description: string;
}

export interface CrystalRecommendation {
  crystal: Crystal;
  reason: string;
  confidence: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'all_day';
}
