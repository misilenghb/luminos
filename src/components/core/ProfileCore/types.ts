import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

export type ProfileDisplayMode = 
  | 'card'         // 仪表板：简单卡片
  | 'banner'       // 横幅模式
  | 'sidebar'      // 侧边栏模式
  | 'detailed'     // 探索页：详细展示
  | 'minimal';     // 最小化展示

export type ProfileElement = 
  | 'mbti'         // MBTI类型
  | 'zodiac'       // 星座
  | 'chakra'       // 脉轮
  | 'energy'       // 能量状态
  | 'element'      // 元素
  | 'planet';      // 行星

export interface ProfileDisplayProps {
  profile?: UserProfileDataOutput;
  mode: ProfileDisplayMode;
  showElements?: ProfileElement[];
  interactive?: boolean;
  compactMode?: boolean;
  className?: string;
}

export interface ProfileMetrics {
  completeness: number;
  lastUpdated?: string;
  assessmentCount: number;
}
