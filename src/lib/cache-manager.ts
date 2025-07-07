/**
 * 缓存管理系统
 * 优化AI API调用，减少重复请求，提升用户体验
 */

'use client';

import { LRUCache } from 'lru-cache';

// 缓存配置接口
interface CacheConfig {
  maxSize: number;
  ttl: number; // 生存时间（毫秒）
  staleWhileRevalidate: number; // 过期后继续使用的时间
  namespace: string;
}

// 缓存项接口
interface CacheItem<T> {
  data: T;
  timestamp: number;
  hash: string;
  hitCount: number;
  cost: number; // API调用成本
}

// 请求去重管理器
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)! as Promise<T>;
    }

    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  clear() {
    this.pendingRequests.clear();
  }
}

// 缓存管理器
export class CacheManager {
  private cache: LRUCache<string, CacheItem<any>>;
  private deduplicator: RequestDeduplicator;
  private config: CacheConfig;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      ttl: config.ttl || 1000 * 60 * 30, // 30分钟
      staleWhileRevalidate: config.staleWhileRevalidate || 1000 * 60 * 60, // 1小时
      namespace: config.namespace || 'ai-cache',
    };

    this.cache = new LRUCache<string, CacheItem<any>>({
      max: this.config.maxSize,
      ttl: this.config.ttl,
      updateAgeOnGet: true,
      noDisposeOnSet: true,
    });

    this.deduplicator = new RequestDeduplicator();
    this.startCleanup();
  }

  // 生成缓存键
  private generateKey(input: any): string {
    const hash = this.hashObject(input);
    return `${this.config.namespace}:${hash}`;
  }

  // 对象哈希
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32位整数
    }
    return hash.toString(36);
  }

  // 获取缓存
  async get<T>(key: string): Promise<CacheItem<T> | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    // 更新命中计数
    item.hitCount++;
    this.cache.set(key, item);

    return item as CacheItem<T>;
  }

  // 设置缓存
  set<T>(key: string, data: T, cost: number = 1): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      hash: this.hashObject(data),
      hitCount: 0,
      cost,
    };

    this.cache.set(key, item);
    
    // 保存到本地存储（可选）
    this.saveToLocalStorage(key, item);
  }

  // 智能缓存获取或设置
  async getOrSet<T>(
    input: any,
    fetcher: () => Promise<T>,
    options: {
      cost?: number;
      forceRefresh?: boolean;
      backgroundRefresh?: boolean;
    } = {}
  ): Promise<T> {
    const key = this.generateKey(input);
    const { cost = 1, forceRefresh = false, backgroundRefresh = false } = options;

    if (!forceRefresh) {
      const cached = await this.get<T>(key);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        
        // 如果数据还新鲜，直接返回
        if (age < this.config.ttl) {
          return cached.data;
        }
        
        // 如果数据过期但在stale时间内，可以返回旧数据并在后台刷新
        if (age < this.config.staleWhileRevalidate) {
          if (backgroundRefresh) {
            // 后台刷新
            setTimeout(() => {
              this.deduplicator.dedupe(key, fetcher)
                .then(data => this.set(key, data, cost))
                .catch(error => console.error('后台刷新失败:', error));
            }, 0);
          }
          return cached.data;
        }
      }
    }

    // 使用去重机制获取新数据
    const data = await this.deduplicator.dedupe(key, fetcher);
    this.set(key, data, cost);
    
    return data;
  }

  // 批量预加载
  async batchPreload<T>(
    requests: Array<{ input: any; fetcher: () => Promise<T>; cost?: number }>,
    options: { concurrency?: number } = {}
  ): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
    const { concurrency = 3 } = options;
    const results: Array<{ success: boolean; data?: T; error?: Error }> = [];

    // 分批处理请求
    for (let i = 0; i < requests.length; i += concurrency) {
      const batch = requests.slice(i, i + concurrency);
      
      const batchPromises = batch.map(async ({ input, fetcher, cost }) => {
        try {
          const data = await this.getOrSet(input, fetcher, { cost });
          return { success: true, data };
        } catch (error) {
          return { success: false, error: error as Error };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults.map(result => 
        result.status === 'fulfilled' ? result.value : { success: false, error: new Error('批量加载失败') }
      ));
    }

    return results;
  }

  // 获取缓存统计信息
  getStats() {
    const entries = Array.from(this.cache.entries());
    const totalItems = entries.length;
    const totalHits = entries.reduce((sum, [, item]) => sum + item.hitCount, 0);
    const totalCost = entries.reduce((sum, [, item]) => sum + item.cost, 0);
    const avgAge = entries.reduce((sum, [, item]) => sum + (Date.now() - item.timestamp), 0) / totalItems;

    return {
      totalItems,
      totalHits,
      totalCost,
      avgAge: Math.round(avgAge / 1000), // 转换为秒
      hitRate: totalHits / totalItems || 0,
      memoryUsage: this.cache.size,
    };
  }

  // 清理过期缓存
  private cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    for (const [key, item] of entries) {
      if (now - item.timestamp > this.config.staleWhileRevalidate) {
        this.cache.delete(key);
        this.removeFromLocalStorage(key);
      }
    }
  }

  // 开始定期清理
  private startCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 1000 * 60 * 10); // 每10分钟清理一次
  }

  // 保存到本地存储
  private saveToLocalStorage(key: string, item: CacheItem<any>) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const serialized = JSON.stringify(item);
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.warn('保存到本地存储失败:', error);
    }
  }

  // 从本地存储移除
  private removeFromLocalStorage(key: string) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('从本地存储移除失败:', error);
    }
  }

  // 从本地存储恢复
  loadFromLocalStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(this.config.namespace)
        );
        
        for (const key of keys) {
          const serialized = localStorage.getItem(key);
          if (serialized) {
            const item = JSON.parse(serialized) as CacheItem<any>;
            // 检查是否过期
            if (Date.now() - item.timestamp < this.config.staleWhileRevalidate) {
              this.cache.set(key, item);
            } else {
              localStorage.removeItem(key);
            }
          }
        }
      }
    } catch (error) {
      console.warn('从本地存储恢复失败:', error);
    }
  }

  // 清空缓存
  clear() {
    this.cache.clear();
    this.deduplicator.clear();
    
    // 清理本地存储
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(this.config.namespace)
        );
        keys.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      console.warn('清理本地存储失败:', error);
    }
  }

  // 销毁缓存管理器
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

// 全局缓存实例
export const globalCache = new CacheManager({
  maxSize: 2000,
  ttl: 1000 * 60 * 30, // 30分钟
  staleWhileRevalidate: 1000 * 60 * 60 * 2, // 2小时
  namespace: 'luminos-ai-cache',
});

// 装饰器：为AI API调用添加缓存
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyGenerator?: (...args: Parameters<T>) => string;
    cost?: number;
    ttl?: number;
    backgroundRefresh?: boolean;
  } = {}
): T {
  const { keyGenerator, cost = 1, ttl, backgroundRefresh = false } = options;
  
  return (async (...args: Parameters<T>) => {
    const cacheKey = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    const cacheManager = ttl ? new CacheManager({ ttl }) : globalCache;
    
    return cacheManager.getOrSet(
      cacheKey,
      () => fn(...args),
      { cost, backgroundRefresh }
    );
  }) as T;
}

// 预设的缓存配置
export const cacheConfigs = {
  // 用户画像分析 - 长期缓存
  userProfile: {
    maxSize: 500,
    ttl: 1000 * 60 * 60 * 24, // 24小时
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 7, // 7天
    namespace: 'user-profile-cache',
  },
  
  // 设计建议 - 中期缓存
  designSuggestions: {
    maxSize: 1000,
    ttl: 1000 * 60 * 60 * 2, // 2小时
    staleWhileRevalidate: 1000 * 60 * 60 * 8, // 8小时
    namespace: 'design-suggestions-cache',
  },
  
  // 图片生成 - 永久缓存
  imageGeneration: {
    maxSize: 200,
    ttl: 1000 * 60 * 60 * 24 * 30, // 30天
    staleWhileRevalidate: 1000 * 60 * 60 * 24 * 90, // 90天
    namespace: 'image-generation-cache',
  },
  
  // 能量分析 - 短期缓存
  energyAnalysis: {
    maxSize: 300,
    ttl: 1000 * 60 * 30, // 30分钟
    staleWhileRevalidate: 1000 * 60 * 60 * 2, // 2小时
    namespace: 'energy-analysis-cache',
  },
};

// 创建专用缓存管理器
export const userProfileCache = new CacheManager(cacheConfigs.userProfile);
export const designSuggestionsCache = new CacheManager(cacheConfigs.designSuggestions);
export const imageGenerationCache = new CacheManager(cacheConfigs.imageGeneration);
export const energyAnalysisCache = new CacheManager(cacheConfigs.energyAnalysis);

// 初始化时从本地存储恢复缓存
if (typeof window !== 'undefined') {
  globalCache.loadFromLocalStorage();
  userProfileCache.loadFromLocalStorage();
  designSuggestionsCache.loadFromLocalStorage();
  imageGenerationCache.loadFromLocalStorage();
  energyAnalysisCache.loadFromLocalStorage();
}

// AI相关的缓存键前缀
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  DESIGN_SUGGESTIONS: 'design_suggestions',
  DAILY_GUIDANCE: 'daily_guidance',
  ENERGY_ANALYSIS: 'energy_analysis',
  IMAGE_GENERATION: 'image_generation',
  CRYSTAL_RECOMMENDATIONS: 'crystal_recommendations',
} as const;

/**
 * 预加载缓存
 */
export async function preloadCache(
  operations: Array<{
    key: string;
    fetcher: () => Promise<any>;
    ttl?: number;
  }>
): Promise<void> {
  const promises = operations.map(async ({ key, fetcher, ttl }) => {
    try {
      const data = await fetcher();
      globalCache.set(key, data, ttl);
    } catch (error) {
      console.warn(`预加载缓存失败 (${key}):`, error);
    }
  });

  await Promise.allSettled(promises);
}

/**
 * 批量更新缓存
 */
export function batchUpdateCache(
  updates: Array<{
    key: string;
    data: any;
    ttl?: number;
  }>
): void {
  updates.forEach(({ key, data, ttl }) => {
    globalCache.set(key, data, ttl);
  });
}

/**
 * 条件缓存清理
 */
export function clearCacheByPattern(pattern: string): void {
  const keysToDelete: string[] = [];
  
  for (const key of globalCache['cache'].keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => globalCache['cache'].delete(key));
} 