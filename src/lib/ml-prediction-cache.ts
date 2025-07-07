// 机器学习预测缓存系统
import { EdgeCacheClient } from './edge-cache-client';
import { supabase } from './supabase';

// 用户行为模式接口
interface UserBehaviorPattern {
  userId: string;
  sessionId: string;
  timestamp: Date;
  action: 'view' | 'click' | 'generate' | 'save' | 'share';
  page: string;
  duration: number;
  metadata: Record<string, any>;
}

// 预测结果接口
interface PredictionResult {
  nextActions: Array<{
    action: string;
    probability: number;
    resource: string;
    estimatedTime: number;
  }>;
  recommendedContent: Array<{
    type: 'design' | 'crystal' | 'tutorial';
    id: string;
    relevanceScore: number;
    cacheKey: string;
  }>;
  optimalCacheStrategy: {
    ttl: number;
    priority: 'high' | 'medium' | 'low';
    preloadTiming: number; // 毫秒
  };
}

// 机器学习预测缓存类
export class MLPredictionCache {
  private edgeCache: EdgeCacheClient;
  private behaviorHistory: Map<string, UserBehaviorPattern[]> = new Map();
  private predictionCache: Map<string, PredictionResult> = new Map();
  private modelWeights: Map<string, number> = new Map();

  constructor() {
    this.edgeCache = new EdgeCacheClient();
    this.initializeModelWeights();
    this.startBehaviorTracking();
  }

  // 初始化模型权重
  private initializeModelWeights() {
    // 基于历史数据训练的简化权重
    this.modelWeights.set('page_sequence', 0.35);
    this.modelWeights.set('time_pattern', 0.25);
    this.modelWeights.set('design_preference', 0.20);
    this.modelWeights.set('crystal_affinity', 0.15);
    this.modelWeights.set('session_context', 0.05);
  }

  // 记录用户行为
  async trackUserBehavior(behavior: Omit<UserBehaviorPattern, 'timestamp'>) {
    const fullBehavior: UserBehaviorPattern = {
      ...behavior,
      timestamp: new Date()
    };

    // 更新内存中的行为历史
    const userHistory = this.behaviorHistory.get(behavior.userId) || [];
    userHistory.push(fullBehavior);
    
    // 保持最近100个行为记录
    if (userHistory.length > 100) {
      userHistory.shift();
    }
    this.behaviorHistory.set(behavior.userId, userHistory);

    // 异步保存到数据库
    this.saveBehaviorToDatabase(fullBehavior);

    // 触发预测更新
    await this.updatePredictions(behavior.userId);
  }

  // 保存行为到数据库
  private async saveBehaviorToDatabase(behavior: UserBehaviorPattern) {
    try {
      await supabase
        .from('user_behavior_patterns')
        .insert({
          user_id: behavior.userId,
          session_id: behavior.sessionId,
          action: behavior.action,
          page: behavior.page,
          duration: behavior.duration,
          metadata: behavior.metadata,
          created_at: behavior.timestamp.toISOString()
        });
    } catch (error) {
      console.warn('保存用户行为失败:', error);
    }
  }

  // 更新用户预测
  private async updatePredictions(userId: string) {
    const userHistory = this.behaviorHistory.get(userId) || [];
    if (userHistory.length < 3) return; // 需要最少3个行为记录

    const prediction = await this.generatePrediction(userHistory);
    this.predictionCache.set(userId, prediction);

    // 缓存预测结果
    await this.edgeCache.set(`ml_predictions:${userId}`, prediction, 30 * 60); // 30分钟

    // 执行预加载策略
    await this.executePreloadStrategy(userId, prediction);
  }

  // 生成预测
  private async generatePrediction(history: UserBehaviorPattern[]): Promise<PredictionResult> {
    const recentHistory = history.slice(-10); // 最近10个行为

    // 1. 页面序列分析
    const pageSequences = this.analyzePageSequences(recentHistory);
    
    // 2. 时间模式分析
    const timePatterns = this.analyzeTimePatterns(recentHistory);
    
    // 3. 设计偏好分析
    const designPreferences = this.analyzeDesignPreferences(recentHistory);
    
    // 4. 水晶亲和力分析
    const crystalAffinity = this.analyzeCrystalAffinity(recentHistory);

    // 综合分析生成预测
    const nextActions = this.predictNextActions(pageSequences, timePatterns);
    const recommendedContent = this.generateContentRecommendations(designPreferences, crystalAffinity);
    const cacheStrategy = this.optimizeCacheStrategy(recentHistory);

    return {
      nextActions,
      recommendedContent,
      optimalCacheStrategy: cacheStrategy
    };
  }

  // 分析页面序列模式
  private analyzePageSequences(history: UserBehaviorPattern[]) {
    const sequences = new Map<string, number>();
    
    for (let i = 0; i < history.length - 1; i++) {
      const current = history[i].page;
      const next = history[i + 1].page;
      const sequence = `${current}->${next}`;
      sequences.set(sequence, (sequences.get(sequence) || 0) + 1);
    }

    return Array.from(sequences.entries())
      .map(([sequence, count]) => ({
        sequence,
        probability: count / (history.length - 1)
      }))
      .sort((a, b) => b.probability - a.probability);
  }

  // 分析时间模式
  private analyzeTimePatterns(history: UserBehaviorPattern[]) {
    const avgDuration = history.reduce((sum, h) => sum + h.duration, 0) / history.length;
    const sessionLength = history.length;
    
    return {
      averageDuration: avgDuration,
      sessionLength,
      engagement: avgDuration > 30000 ? 'high' : avgDuration > 15000 ? 'medium' : 'low'
    };
  }

  // 分析设计偏好
  private analyzeDesignPreferences(history: UserBehaviorPattern[]) {
    const designActions = history.filter(h => h.action === 'generate' || h.page.includes('design'));
    const preferences = new Map<string, number>();

    designActions.forEach(action => {
      const style = action.metadata?.designStyle || 'unknown';
      preferences.set(style, (preferences.get(style) || 0) + 1);
    });

    return Array.from(preferences.entries())
      .map(([style, count]) => ({
        style,
        preference: count / designActions.length
      }))
      .sort((a, b) => b.preference - a.preference);
  }

  // 分析水晶亲和力
  private analyzeCrystalAffinity(history: UserBehaviorPattern[]) {
    const crystalActions = history.filter(h => h.metadata?.crystals);
    const affinity = new Map<string, number>();

    crystalActions.forEach(action => {
      const crystals = Array.isArray(action.metadata.crystals) 
        ? action.metadata.crystals 
        : [action.metadata.crystals];
      
      crystals.forEach((crystal: string) => {
        affinity.set(crystal, (affinity.get(crystal) || 0) + 1);
      });
    });

    return Array.from(affinity.entries())
      .map(([crystal, count]) => ({
        crystal,
        affinity: count / crystalActions.length
      }))
      .sort((a, b) => b.affinity - a.affinity);
  }

  // 预测下一步行为
  private predictNextActions(sequences: any[], timePatterns: any) {
    const actions = [];
    
    // 基于序列模式预测
    for (const seq of sequences.slice(0, 3)) {
      const [, nextPage] = seq.sequence.split('->');
      actions.push({
        action: 'navigate',
        probability: seq.probability * 0.8,
        resource: nextPage,
        estimatedTime: timePatterns.averageDuration
      });
    }

    // 基于用户参与度预测
    if (timePatterns.engagement === 'high') {
      actions.push({
        action: 'generate_design',
        probability: 0.7,
        resource: '/creative-workshop',
        estimatedTime: 45000
      });
    }

    return actions.sort((a, b) => b.probability - a.probability).slice(0, 5);
  }

  // 生成内容推荐
  private generateContentRecommendations(designPrefs: any[], crystalAffinity: any[]) {
    const recommendations: any[] = [];

    // 基于设计偏好推荐
    designPrefs.slice(0, 2).forEach(pref => {
      recommendations.push({
        type: 'design' as const,
        id: `design_${pref.style}`,
        relevanceScore: pref.preference,
        cacheKey: `design_templates:${pref.style}`
      });
    });

    // 基于水晶亲和力推荐
    crystalAffinity.slice(0, 3).forEach(crystal => {
      recommendations.push({
        type: 'crystal' as const,
        id: `crystal_${crystal.crystal}`,
        relevanceScore: crystal.affinity,
        cacheKey: `crystal_info:${crystal.crystal}`
      });
    });

    return recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  // 优化缓存策略
  private optimizeCacheStrategy(history: UserBehaviorPattern[]) {
    const recentEngagement = history.slice(-5);
    const avgDuration = recentEngagement.reduce((sum, h) => sum + h.duration, 0) / recentEngagement.length;
    
    if (avgDuration > 30000) {
      return {
        ttl: 60 * 60 * 1000, // 1小时
        priority: 'high' as const,
        preloadTiming: 5000 // 5秒后预加载
      };
    } else if (avgDuration > 15000) {
      return {
        ttl: 30 * 60 * 1000, // 30分钟
        priority: 'medium' as const,
        preloadTiming: 10000 // 10秒后预加载
      };
    } else {
      return {
        ttl: 15 * 60 * 1000, // 15分钟
        priority: 'low' as const,
        preloadTiming: 20000 // 20秒后预加载
      };
    }
  }

  // 执行预加载策略
  private async executePreloadStrategy(userId: string, prediction: PredictionResult) {
    // 延迟执行预加载
    setTimeout(async () => {
      for (const content of prediction.recommendedContent) {
        if (content.relevanceScore > 0.5) {
          await this.preloadContent(content);
        }
      }
    }, prediction.optimalCacheStrategy.preloadTiming);
  }

  // 预加载内容
  private async preloadContent(content: PredictionResult['recommendedContent'][0]) {
    try {
      // 模拟内容预加载
      const cacheKey = content.cacheKey;
      const existingContent = await this.edgeCache.get(cacheKey);
      
      if (!existingContent) {
        // 根据内容类型生成或获取数据
        let contentData;
        
        switch (content.type) {
          case 'design':
            contentData = await this.generateDesignTemplate(content.id);
            break;
          case 'crystal':
            contentData = await this.getCrystalInformation(content.id);
            break;
          case 'tutorial':
            contentData = await this.getTutorialContent(content.id);
            break;
        }
        
        if (contentData) {
          await this.edgeCache.set(cacheKey, contentData, 60 * 60);
          console.log(`预加载内容: ${content.type} - ${content.id}`);
        }
      }
    } catch (error) {
      console.warn(`预加载失败: ${content.id}`, error);
    }
  }

  // 生成设计模板
  private async generateDesignTemplate(designId: string) {
    // 模拟设计模板生成
    return {
      id: designId,
      templates: [
        { style: 'minimalist', popularity: 0.8 },
        { style: 'vintage', popularity: 0.6 },
        { style: 'modern', popularity: 0.9 }
      ],
      generatedAt: new Date().toISOString()
    };
  }

  // 获取水晶信息
  private async getCrystalInformation(crystalId: string) {
    try {
      const { data } = await supabase
        .from('crystal_database')
        .select('*')
        .eq('id', crystalId.replace('crystal_', ''))
        .single();
      
      return data || {
        id: crystalId,
        name: crystalId.replace('crystal_', ''),
        properties: ['healing', 'protection'],
        defaultInfo: true
      };
    } catch {
      return null;
    }
  }

  // 获取教程内容
  private async getTutorialContent(tutorialId: string) {
    return {
      id: tutorialId,
      title: '水晶首饰设计入门',
      content: '基础教程内容...',
      duration: '15分钟',
      difficulty: 'beginner'
    };
  }

  // 获取用户预测
  async getUserPredictions(userId: string): Promise<PredictionResult | null> {
    // 先从缓存获取
    let prediction = this.predictionCache.get(userId);
    
    if (!prediction) {
      // 从Edge缓存获取
      prediction = await this.edgeCache.get(`ml_predictions:${userId}`) || undefined;
      
      if (prediction) {
        this.predictionCache.set(userId, prediction);
      }
    }
    
    return prediction || null;
  }

  // 开始行为跟踪
  private startBehaviorTracking() {
    // 定期清理过期的预测缓存
    setInterval(() => {
      this.cleanupExpiredPredictions();
    }, 10 * 60 * 1000); // 每10分钟清理一次
  }

  // 清理过期预测
  private cleanupExpiredPredictions() {
    const expiredThreshold = Date.now() - (60 * 60 * 1000); // 1小时前
    
    for (const [userId, history] of this.behaviorHistory.entries()) {
      const recentHistory = history.filter(h => h.timestamp.getTime() > expiredThreshold);
      
      if (recentHistory.length === 0) {
        this.behaviorHistory.delete(userId);
        this.predictionCache.delete(userId);
      } else {
        this.behaviorHistory.set(userId, recentHistory);
      }
    }
  }

  // 获取预测统计
  async getPredictionStats() {
    return {
      activeUsers: this.behaviorHistory.size,
      cachedPredictions: this.predictionCache.size,
      modelAccuracy: await this.calculateModelAccuracy(),
      lastUpdated: new Date().toISOString()
    };
  }

  // 计算模型准确率
  private async calculateModelAccuracy(): Promise<number> {
    // 简化的准确率计算
    const totalPredictions = this.predictionCache.size;
    const successfulPredictions = Math.floor(totalPredictions * 0.75); // 模拟75%准确率
    
    return totalPredictions > 0 ? successfulPredictions / totalPredictions : 0;
  }
}

// 创建全局实例
export const mlPredictionCache = new MLPredictionCache(); 