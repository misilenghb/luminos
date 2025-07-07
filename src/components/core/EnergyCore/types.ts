import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

export type EnergyAnalysisMode = 
  | 'dashboard'    // 仪表板：简化的今日概览
  | 'exploration'  // 探索页：完整的五维/八维分析
  | 'calendar'     // 日历页：月度能量预测
  | 'summary';     // 总结模式：关键指标

export type EnergyDisplayLayout = 
  | 'card'         // 卡片布局
  | 'inline'       // 内联布局
  | 'chart'        // 图表布局
  | 'minimal';     // 最小化布局

export interface EnergyDisplayProps {
  profile?: UserProfileDataOutput;
  mode: EnergyAnalysisMode;
  layout?: EnergyDisplayLayout;
  compactMode?: boolean;
  showAdvanced?: boolean;
  className?: string;
}

export interface EnergyData {
  date: string;
  energyLevel: number;
  mood?: string;
  activities?: string[];
  sleepHours?: number;
  stressLevel?: number;
  productivity?: number;
  notes?: string;
}

export interface EnergyMetrics {
  current: number;
  average: number;
  trend: 'up' | 'down' | 'stable';
  prediction?: number;
}
