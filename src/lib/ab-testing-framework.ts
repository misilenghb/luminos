// A/B测试框架
import { supabase } from './supabase';

// 实验配置接口
interface Experiment {
  id: string;
  experiment_name: string;
  description?: string;
  variants: Record<string, any>;
  allocation: Record<string, number>;
  target_metrics: string[];
  start_date: Date;
  end_date?: Date;
  status: 'draft' | 'running' | 'paused' | 'completed';
}

// 用户分配接口
interface UserAssignment {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: string;
  assigned_at: Date;
}

// 实验事件接口
interface ExperimentEvent {
  id: string;
  experiment_id: string;
  user_id: string;
  variant: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: Date;
}

// 实验结果接口
interface ExperimentResult {
  experimentId: string;
  experimentName: string;
  status: string;
  totalUsers: number;
  variants: Record<string, VariantResult>;
  metrics: Record<string, MetricResult>;
  statistical_significance: boolean;
  confidence_level: number;
  recommendation: 'continue' | 'stop' | 'winner' | 'inconclusive';
  winningVariant?: string;
}

interface VariantResult {
  name: string;
  users: number;
  allocation: number;
  actualAllocation: number;
  events: Record<string, number>;
  conversionRate?: number;
  averageValue?: number;
}

interface MetricResult {
  metric: string;
  variants: Record<string, {
    value: number;
    users: number;
    confidence_interval: [number, number];
  }>;
  p_value: number;
  effect_size: number;
  is_significant: boolean;
}

export class ABTestingFramework {
  private activeExperiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> experimentId -> variant
  private lastCacheUpdate: Date = new Date(0);

  constructor() {
    this.loadActiveExperiments();
  }

  // 加载活跃实验
  private async loadActiveExperiments() {
    try {
      const { data: experiments, error } = await supabase
        .from('ab_experiments')
        .select('*')
        .in('status', ['running', 'paused']);

      if (error) throw error;

      this.activeExperiments.clear();
      experiments?.forEach(exp => {
        this.activeExperiments.set(exp.id, {
          ...exp,
          start_date: new Date(exp.start_date),
          end_date: exp.end_date ? new Date(exp.end_date) : undefined
        });
      });

      this.lastCacheUpdate = new Date();
      console.log(`加载了 ${experiments?.length || 0} 个活跃实验`);
    } catch (error) {
      console.error('加载活跃实验失败:', error);
    }
  }

  // 创建新实验
  async createExperiment(config: {
    name: string;
    description?: string;
    variants: Record<string, any>;
    allocation?: Record<string, number>;
    targetMetrics?: string[];
    duration?: number; // 天数
  }): Promise<string> {
    try {
      // 验证分配比例
      const allocation = config.allocation || this.generateEqualAllocation(Object.keys(config.variants));
      const totalAllocation = Object.values(allocation).reduce((sum, val) => sum + val, 0);
      
      if (Math.abs(totalAllocation - 100) > 0.1) {
        throw new Error('分配比例总和必须为100%');
      }

      // 计算结束日期
      const endDate = config.duration ? 
        new Date(Date.now() + config.duration * 24 * 60 * 60 * 1000) : 
        undefined;

      const { data, error } = await supabase
        .from('ab_experiments')
        .insert({
          experiment_name: config.name,
          description: config.description,
          variants: config.variants,
          allocation,
          target_metrics: config.targetMetrics || ['conversion_rate'],
          end_date: endDate?.toISOString(),
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`创建实验成功: ${config.name} (ID: ${data.id})`);
      return data.id;
    } catch (error) {
      console.error('创建实验失败:', error);
      throw error;
    }
  }

  // 生成均等分配
  private generateEqualAllocation(variants: string[]): Record<string, number> {
    const allocation: Record<string, number> = {};
    const percentage = 100 / variants.length;
    
    variants.forEach(variant => {
      allocation[variant] = Math.round(percentage * 100) / 100;
    });
    
    return allocation;
  }

  // 启动实验
  async startExperiment(experimentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ab_experiments')
        .update({ 
          status: 'running',
          start_date: new Date().toISOString()
        })
        .eq('id', experimentId);

      if (error) throw error;

      // 重新加载实验缓存
      await this.loadActiveExperiments();
      
      console.log(`实验 ${experimentId} 已启动`);
    } catch (error) {
      console.error('启动实验失败:', error);
      throw error;
    }
  }

  // 暂停实验
  async pauseExperiment(experimentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ab_experiments')
        .update({ status: 'paused' })
        .eq('id', experimentId);

      if (error) throw error;

      await this.loadActiveExperiments();
      console.log(`实验 ${experimentId} 已暂停`);
    } catch (error) {
      console.error('暂停实验失败:', error);
      throw error;
    }
  }

  // 完成实验
  async completeExperiment(experimentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ab_experiments')
        .update({ status: 'completed' })
        .eq('id', experimentId);

      if (error) throw error;

      this.activeExperiments.delete(experimentId);
      console.log(`实验 ${experimentId} 已完成`);
    } catch (error) {
      console.error('完成实验失败:', error);
      throw error;
    }
  }

  // 获取用户实验变体
  async getUserVariant(userId: string, experimentName: string): Promise<string | null> {
    // 检查缓存更新
    if (Date.now() - this.lastCacheUpdate.getTime() > 5 * 60 * 1000) {
      await this.loadActiveExperiments();
    }

    // 查找实验
    const experiment = Array.from(this.activeExperiments.values())
      .find(exp => exp.experiment_name === experimentName && exp.status === 'running');

    if (!experiment) {
      return null; // 实验不存在或未运行
    }

    // 检查用户是否已分配
    const userExperiments = this.userAssignments.get(userId);
    if (userExperiments?.has(experiment.id)) {
      return userExperiments.get(experiment.id) || null;
    }

    // 分配用户到变体
    const variant = await this.assignUserToVariant(userId, experiment);
    return variant;
  }

  // 分配用户到变体
  private async assignUserToVariant(userId: string, experiment: Experiment): Promise<string> {
    try {
      // 检查用户是否已分配到此实验
      const { data: existingAssignment } = await supabase
        .from('ab_user_assignments')
        .select('variant')
        .eq('experiment_id', experiment.id)
        .eq('user_id', userId)
        .single();

      if (existingAssignment) {
        // 用户已分配，更新缓存
        this.updateUserAssignmentCache(userId, experiment.id, existingAssignment.variant);
        return existingAssignment.variant;
      }

      // 计算用户应该分配到的变体
      const variant = this.calculateVariantAssignment(userId, experiment);

      // 保存分配到数据库
      await supabase
        .from('ab_user_assignments')
        .insert({
          experiment_id: experiment.id,
          user_id: userId,
          variant
        });

      // 更新缓存
      this.updateUserAssignmentCache(userId, experiment.id, variant);

      console.log(`用户 ${userId} 分配到实验 ${experiment.experiment_name} 的变体 ${variant}`);
      return variant;
    } catch (error) {
      console.error('分配用户到变体失败:', error);
      // 返回默认变体
      return Object.keys(experiment.variants)[0];
    }
  }

  // 计算变体分配
  private calculateVariantAssignment(userId: string, experiment: Experiment): string {
    // 使用用户ID的哈希值确保一致性
    const hash = this.hashString(userId + experiment.id);
    const normalized = hash / 0xffffffff; // 标准化到0-1
    
    let cumulative = 0;
    for (const [variant, percentage] of Object.entries(experiment.allocation)) {
      cumulative += percentage / 100;
      if (normalized <= cumulative) {
        return variant;
      }
    }
    
    // 回退到第一个变体
    return Object.keys(experiment.variants)[0];
  }

  // 简单哈希函数
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  // 更新用户分配缓存
  private updateUserAssignmentCache(userId: string, experimentId: string, variant: string) {
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    this.userAssignments.get(userId)!.set(experimentId, variant);
  }

  // 记录实验事件
  async trackEvent(
    userId: string,
    experimentName: string,
    eventType: string,
    eventData: Record<string, any> = {}
  ): Promise<void> {
    try {
      // 获取用户在实验中的变体
      const variant = await this.getUserVariant(userId, experimentName);
      if (!variant) {
        return; // 用户不在实验中
      }

      // 查找实验ID
      const experiment = Array.from(this.activeExperiments.values())
        .find(exp => exp.experiment_name === experimentName);

      if (!experiment) {
        return;
      }

      // 记录事件
      await supabase
        .from('ab_experiment_events')
        .insert({
          experiment_id: experiment.id,
          user_id: userId,
          variant,
          event_type: eventType,
          event_data: eventData
        });

      console.log(`记录实验事件: ${experimentName} - ${eventType} - 变体 ${variant}`);
    } catch (error) {
      console.error('记录实验事件失败:', error);
    }
  }

  // 获取实验结果
  async getExperimentResults(experimentId: string): Promise<ExperimentResult> {
    try {
      // 获取实验信息
      const { data: experiment } = await supabase
        .from('ab_experiments')
        .select('*')
        .eq('id', experimentId)
        .single();

      if (!experiment) {
        throw new Error('实验不存在');
      }

      // 获取用户分配统计
      const { data: assignments } = await supabase
        .from('ab_user_assignments')
        .select('variant')
        .eq('experiment_id', experimentId);

      // 获取事件统计
      const { data: events } = await supabase
        .from('ab_experiment_events')
        .select('variant, event_type, event_data')
        .eq('experiment_id', experimentId);

      // 计算变体结果
      const variants: Record<string, VariantResult> = {};
      const assignmentCounts: Record<string, number> = {};

      // 统计分配
      assignments?.forEach(assignment => {
        assignmentCounts[assignment.variant] = (assignmentCounts[assignment.variant] || 0) + 1;
      });

      // 初始化变体结果
      Object.keys(experiment.variants).forEach(variant => {
        const userCount = assignmentCounts[variant] || 0;
        variants[variant] = {
          name: variant,
          users: userCount,
          allocation: experiment.allocation[variant] || 0,
          actualAllocation: assignments?.length ? (userCount / assignments.length) * 100 : 0,
          events: {}
        };
      });

      // 统计事件
      events?.forEach(event => {
        if (variants[event.variant]) {
          variants[event.variant].events[event.event_type] = 
            (variants[event.variant].events[event.event_type] || 0) + 1;
        }
      });

      // 计算转化率
      Object.values(variants).forEach(variant => {
        const conversions = variant.events['conversion'] || variant.events['purchase'] || 0;
        variant.conversionRate = variant.users > 0 ? (conversions / variant.users) * 100 : 0;
      });

      // 计算指标结果
      const metrics: Record<string, MetricResult> = {};
      
      for (const metric of experiment.target_metrics) {
        const metricResult = this.calculateMetricResult(metric, variants, (events || []) as ExperimentEvent[]);
        metrics[metric] = metricResult;
      }

      // 计算统计显著性
      const totalUsers = Object.values(variants).reduce((sum, v) => sum + v.users, 0);
      const statistical_significance = this.calculateStatisticalSignificance(variants);
      
      // 生成推荐
      const recommendation = this.generateRecommendation(variants, metrics, statistical_significance);
      const winningVariant = this.determineWinningVariant(variants, metrics);

      return {
        experimentId,
        experimentName: experiment.experiment_name,
        status: experiment.status,
        totalUsers,
        variants,
        metrics,
        statistical_significance,
        confidence_level: 0.95,
        recommendation,
        winningVariant
      };
    } catch (error) {
      console.error('获取实验结果失败:', error);
      throw error;
    }
  }

  // 计算指标结果
  private calculateMetricResult(
    metric: string,
    variants: Record<string, VariantResult>,
    events: ExperimentEvent[]
  ): MetricResult {
    const metricVariants: Record<string, any> = {};
    
    Object.keys(variants).forEach(variant => {
      const variantEvents = events.filter(e => e.variant === variant);
      let value = 0;
      
      switch (metric) {
        case 'conversion_rate':
          const conversions = variantEvents.filter(e => 
            e.event_type === 'conversion' || e.event_type === 'purchase'
          ).length;
          value = variants[variant].users > 0 ? (conversions / variants[variant].users) * 100 : 0;
          break;
          
        case 'click_through_rate':
          const clicks = variantEvents.filter(e => e.event_type === 'click').length;
          const views = variantEvents.filter(e => e.event_type === 'view').length;
          value = views > 0 ? (clicks / views) * 100 : 0;
          break;
          
        case 'average_order_value':
          const orders = variantEvents.filter(e => e.event_type === 'purchase');
          const totalValue = orders.reduce((sum, e) => sum + (e.event_data?.value || 0), 0);
          value = orders.length > 0 ? totalValue / orders.length : 0;
          break;
          
        case 'time_on_page':
          const timings = variantEvents.filter(e => e.event_type === 'timing');
          const totalTime = timings.reduce((sum, e) => sum + (e.event_data?.duration || 0), 0);
          value = timings.length > 0 ? totalTime / timings.length : 0;
          break;
          
        default:
          value = variantEvents.length;
      }
      
      metricVariants[variant] = {
        value,
        users: variants[variant].users,
        confidence_interval: this.calculateConfidenceInterval(value, variants[variant].users)
      };
    });

    // 计算p值和效应大小
    const p_value = this.calculatePValue(metricVariants);
    const effect_size = this.calculateEffectSize(metricVariants);
    
    return {
      metric,
      variants: metricVariants,
      p_value,
      effect_size,
      is_significant: p_value < 0.05
    };
  }

  // 计算置信区间
  private calculateConfidenceInterval(value: number, sampleSize: number): [number, number] {
    if (sampleSize === 0) return [0, 0];
    
    // 简化的置信区间计算
    const standardError = Math.sqrt(value * (100 - value) / sampleSize);
    const margin = 1.96 * standardError; // 95%置信区间
    
    return [
      Math.max(0, value - margin),
      Math.min(100, value + margin)
    ];
  }

  // 计算p值 (简化版本)
  private calculatePValue(variants: Record<string, any>): number {
    const variantKeys = Object.keys(variants);
    if (variantKeys.length < 2) return 1;
    
    // 简化的t检验p值计算
    const values = variantKeys.map(key => variants[key].value);
    const mean1 = values[0];
    const mean2 = values[1];
    const n1 = variants[variantKeys[0]].users;
    const n2 = variants[variantKeys[1]].users;
    
    if (n1 === 0 || n2 === 0) return 1;
    
    // 简化计算
    const pooledStd = Math.sqrt((mean1 * (100 - mean1) / n1) + (mean2 * (100 - mean2) / n2));
    const tStat = pooledStd > 0 ? Math.abs(mean1 - mean2) / pooledStd : 0;
    
    // 简化的p值映射
    return tStat > 2 ? 0.01 : tStat > 1.5 ? 0.05 : 0.1;
  }

  // 计算效应大小
  private calculateEffectSize(variants: Record<string, any>): number {
    const variantKeys = Object.keys(variants);
    if (variantKeys.length < 2) return 0;
    
    const values = variantKeys.map(key => variants[key].value);
    const mean1 = values[0];
    const mean2 = values[1];
    
    // Cohen's d 的简化版本
    const pooledStd = Math.sqrt((mean1 + mean2) / 2);
    return pooledStd > 0 ? Math.abs(mean1 - mean2) / pooledStd : 0;
  }

  // 计算统计显著性
  private calculateStatisticalSignificance(variants: Record<string, VariantResult>): boolean {
    const variantKeys = Object.keys(variants);
    if (variantKeys.length < 2) return false;
    
    // 检查样本量是否足够
    const minSampleSize = 100;
    return Object.values(variants).every(v => v.users >= minSampleSize);
  }

  // 生成推荐
  private generateRecommendation(
    variants: Record<string, VariantResult>,
    metrics: Record<string, MetricResult>,
    isSignificant: boolean
  ): 'continue' | 'stop' | 'winner' | 'inconclusive' {
    if (!isSignificant) {
      const totalUsers = Object.values(variants).reduce((sum, v) => sum + v.users, 0);
      return totalUsers < 500 ? 'continue' : 'inconclusive';
    }
    
    // 检查是否有明确的获胜者
    const hasSignificantMetric = Object.values(metrics).some(m => m.is_significant);
    
    if (hasSignificantMetric) {
      return 'winner';
    }
    
    return 'continue';
  }

  // 确定获胜变体
  private determineWinningVariant(
    variants: Record<string, VariantResult>,
    metrics: Record<string, MetricResult>
  ): string | undefined {
    // 基于主要指标确定获胜者
    const primaryMetric = metrics['conversion_rate'] || Object.values(metrics)[0];
    
    if (!primaryMetric?.is_significant) {
      return undefined;
    }
    
    let bestVariant = '';
    let bestValue = -1;
    
    Object.entries(primaryMetric.variants).forEach(([variant, data]) => {
      if (data.value > bestValue) {
        bestValue = data.value;
        bestVariant = variant;
      }
    });
    
    return bestVariant || undefined;
  }

  // 获取用户的所有实验分配
  async getUserExperiments(userId: string): Promise<Record<string, string>> {
    try {
      const { data: assignments } = await supabase
        .from('ab_user_assignments')
        .select('experiment_id, variant, ab_experiments(experiment_name)')
        .eq('user_id', userId);

      const result: Record<string, string> = {};
      assignments?.forEach(assignment => {
        if (assignment.ab_experiments) {
          result[(assignment.ab_experiments as any).experiment_name] = assignment.variant;
        }
      });

      return result;
    } catch (error) {
      console.error('获取用户实验失败:', error);
      return {};
    }
  }

  // 获取所有活跃实验
  getActiveExperiments(): Experiment[] {
    return Array.from(this.activeExperiments.values());
  }

  // 获取实验统计
  async getExperimentStats() {
    const activeCount = this.activeExperiments.size;
    
    // 获取总实验数
    const { count: totalCount } = await supabase
      .from('ab_experiments')
      .select('*', { count: 'exact' });

    // 获取总用户参与数
    const { count: totalUsers } = await supabase
      .from('ab_user_assignments')
      .select('*', { count: 'exact' });

    return {
      activeExperiments: activeCount,
      totalExperiments: totalCount || 0,
      totalParticipants: totalUsers || 0,
      lastCacheUpdate: this.lastCacheUpdate
    };
  }
}

// 创建全局实例
export const abTestingFramework = new ABTestingFramework(); 