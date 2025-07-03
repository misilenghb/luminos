// Edge缓存客户端 - 与Supabase Edge Function交互
interface CacheRequest {
  key: string;
  operation: 'get' | 'set' | 'delete' | 'invalidate';
  data?: any;
  ttl?: number;
  region?: string;
}

interface CacheResponse {
  success: boolean;
  data?: any;
  cached: boolean;
  region: string;
  timestamp: string;
  error?: string;
}

class EdgeCacheClient {
  private edgeFunctionUrl: string;
  private fallbackCache: Map<string, { data: any; expires: number }>;
  private retryConfig: {
    maxRetries: number;
    baseDelay: number;
    maxDelay: number;
  };

  constructor() {
    // 获取Supabase项目URL
    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    this.edgeFunctionUrl = `${projectUrl}/functions/v1/ai-cache`;
    
    // 本地fallback缓存
    this.fallbackCache = new Map();
    
    // 重试配置
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 10000
    };
  }

  /**
   * 获取缓存数据
   */
  async get<T>(key: string, region?: string): Promise<T | null> {
    try {
      const response = await this.makeRequest({
        key,
        operation: 'get',
        region
      });

      if (response.success && response.cached && response.data) {
        return response.data as T;
      }

      // 检查本地fallback缓存
      return this.getFallbackCache<T>(key);
    } catch (error) {
      console.warn('Edge cache get failed, using fallback:', error);
      return this.getFallbackCache<T>(key);
    }
  }

  /**
   * 设置缓存数据
   */
  async set<T>(key: string, data: T, ttl?: number, region?: string): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        key,
        operation: 'set',
        data,
        ttl,
        region
      });

      // 同时设置到本地fallback缓存
      this.setFallbackCache(key, data, ttl);

      return response.success;
    } catch (error) {
      console.warn('Edge cache set failed, using fallback only:', error);
      this.setFallbackCache(key, data, ttl);
      return false;
    }
  }

  /**
   * 删除缓存数据
   */
  async delete(key: string, region?: string): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        key,
        operation: 'delete',
        region
      });

      // 同时删除本地fallback缓存
      this.fallbackCache.delete(key);

      return response.success;
    } catch (error) {
      console.warn('Edge cache delete failed:', error);
      this.fallbackCache.delete(key);
      return false;
    }
  }

  /**
   * 批量失效缓存
   */
  async invalidate(pattern: string, region?: string): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        key: pattern,
        operation: 'invalidate',
        region
      });

      // 清理本地匹配的fallback缓存
      this.invalidateFallbackCache(pattern);

      return response.success;
    } catch (error) {
      console.warn('Edge cache invalidate failed:', error);
      this.invalidateFallbackCache(pattern);
      return false;
    }
  }

  /**
   * 缓存穿透保护的获取方法
   */
  async getOrSet<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl?: number,
    region?: string
  ): Promise<T> {
    // 先尝试获取缓存
    const cached = await this.get<T>(key, region);
    if (cached !== null) {
      return cached;
    }

    // 缓存未命中，获取数据并缓存
    try {
      const data = await fetcher();
      await this.set(key, data, ttl, region);
      return data;
    } catch (error) {
      console.error('Failed to fetch data for cache:', error);
      throw error;
    }
  }

  /**
   * 批量获取缓存
   */
  async mget<T>(keys: string[], region?: string): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>();
    
    // 并行请求所有缓存
    const promises = keys.map(async (key) => {
      const value = await this.get<T>(key, region);
      return { key, value };
    });

    const responses = await Promise.allSettled(promises);
    
    responses.forEach((response, index) => {
      const key = keys[index];
      if (response.status === 'fulfilled') {
        results.set(key, response.value.value);
      } else {
        results.set(key, null);
        console.warn(`Failed to get cache for key ${key}:`, response.reason);
      }
    });

    return results;
  }

  /**
   * 批量设置缓存
   */
  async mset<T>(entries: Array<{ key: string; data: T; ttl?: number }>, region?: string): Promise<boolean[]> {
    const promises = entries.map(({ key, data, ttl }) => 
      this.set(key, data, ttl, region)
    );

    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.warn(`Failed to set cache for key ${entries[index].key}:`, result.reason);
        return false;
      }
    });
  }

  /**
   * 执行Edge Function请求
   */
  private async makeRequest(request: CacheRequest): Promise<CacheResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(this.edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: CacheResponse = await response.json();
        return data;

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
            this.retryConfig.maxDelay
          );
          
          console.warn(`Edge cache request failed (attempt ${attempt}), retrying in ${delay}ms:`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Edge cache request failed after all retries');
  }

  /**
   * 本地fallback缓存操作
   */
  private getFallbackCache<T>(key: string): T | null {
    const cached = this.fallbackCache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }
    
    if (cached) {
      this.fallbackCache.delete(key);
    }
    
    return null;
  }

  private setFallbackCache<T>(key: string, data: T, ttl: number = 3600): void {
    const expires = Date.now() + (ttl * 1000);
    this.fallbackCache.set(key, { data, expires });
  }

  private invalidateFallbackCache(pattern: string): void {
    const keys = Array.from(this.fallbackCache.keys());
    const regex = new RegExp(pattern.replace('*', '.*'));
    
    keys.forEach(key => {
      if (regex.test(key)) {
        this.fallbackCache.delete(key);
      }
    });
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): {
    fallbackCacheSize: number;
    fallbackCacheKeys: string[];
  } {
    return {
      fallbackCacheSize: this.fallbackCache.size,
      fallbackCacheKeys: Array.from(this.fallbackCache.keys())
    };
  }

  /**
   * 清理过期的本地缓存
   */
  cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.fallbackCache.forEach((value, key) => {
      if (value.expires <= now) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.fallbackCache.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }
}

// 创建全局缓存客户端实例
export const edgeCacheClient = new EdgeCacheClient();

// 定期清理过期缓存
if (typeof window !== 'undefined') {
  setInterval(() => {
    edgeCacheClient.cleanupExpiredCache();
  }, 5 * 60 * 1000); // 每5分钟清理一次
}

// 导出类
export { EdgeCacheClient };
export default EdgeCacheClient; 