# Luminos灵境 - 成本优化策略

## 概述

本文档提供了一套全面的成本优化策略，旨在通过技术优化、架构调整和智能管理，实现平台运营成本的大幅降低，同时保证用户体验和系统性能。

## 1. AI API成本控制

### 1.1 智能缓存策略

**目标**：减少重复AI API调用40-60%

**实施方案**：
```typescript
// 分层缓存策略
const cacheStrategies = {
  // 用户画像 - 长期缓存
  userProfile: {
    ttl: 24 * 60 * 60 * 1000, // 24小时
    staleWhileRevalidate: 7 * 24 * 60 * 60 * 1000, // 7天
    cost: 10, // 高成本API
  },
  
  // 设计建议 - 中期缓存
  designSuggestions: {
    ttl: 2 * 60 * 60 * 1000, // 2小时
    staleWhileRevalidate: 8 * 60 * 60 * 1000, // 8小时
    cost: 5,
  },
  
  // 配件建议 - 短期缓存
  accessorySuggestions: {
    ttl: 30 * 60 * 1000, // 30分钟
    staleWhileRevalidate: 2 * 60 * 60 * 1000, // 2小时
    cost: 2,
  },
};
```

**预期效果**：
- 缓存命中率：70-85%
- API调用成本降低：40-60%
- 响应速度提升：80-90%

### 1.2 请求去重机制

**问题**：同一用户短时间内重复请求
**解决方案**：
```typescript
class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<any>>();
  
  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }
    
    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });
    
    this.pendingRequests.set(key, promise);
    return promise;
  }
}
```

### 1.3 配额管理系统

**实施方案**：
```typescript
interface UserQuota {
  userId: string;
  plan: 'free' | 'premium' | 'ultimate';
  dailyLimits: {
    designSuggestions: number;
    imageGeneration: number;
    userAnalysis: number;
  };
  used: {
    designSuggestions: number;
    imageGeneration: number;
    userAnalysis: number;
  };
  resetTime: Date;
}

const quotaLimits = {
  free: {
    designSuggestions: 5,
    imageGeneration: 3,
    userAnalysis: 1,
  },
  premium: {
    designSuggestions: 50,
    imageGeneration: 30,
    userAnalysis: 10,
  },
  ultimate: {
    designSuggestions: 200,
    imageGeneration: 100,
    userAnalysis: 50,
  },
};
```

### 1.4 批量处理优化

**策略**：合并相似请求，减少API调用次数
```typescript
class BatchProcessor {
  private batchQueue: Array<{
    input: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly batchSize = 10;
  private readonly batchDelay = 1000; // 1秒
  
  async addToBatch<T>(input: any, processor: (inputs: any[]) => Promise<T[]>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ input, resolve, reject });
      
      if (this.batchQueue.length >= this.batchSize) {
        this.processBatch(processor);
      } else if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.processBatch(processor);
        }, this.batchDelay);
      }
    });
  }
}
```

## 2. 数据库成本优化

### 2.1 查询优化

**目标**：减少数据库资源消耗25-35%

**核心索引策略**：
```sql
-- 高频查询索引
CREATE INDEX CONCURRENTLY idx_profiles_user_id_created_at 
ON profiles(user_id, created_at);

CREATE INDEX CONCURRENTLY idx_user_energy_records_user_date 
ON user_energy_records(user_id, date DESC);

-- 复合索引优化
CREATE INDEX CONCURRENTLY idx_images_user_favorite_created 
ON images(user_id, is_favorite, created_at DESC) 
WHERE is_favorite = true;
```

### 2.2 数据归档策略

**实施方案**：
```sql
-- 自动归档老数据
CREATE OR REPLACE FUNCTION archive_old_data()
RETURNS void AS $$
BEGIN
  -- 归档6个月前的能量记录
  INSERT INTO user_energy_records_archive 
  SELECT * FROM user_energy_records 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  DELETE FROM user_energy_records 
  WHERE created_at < NOW() - INTERVAL '6 months';
  
  -- 归档1年前的使用统计
  INSERT INTO usage_stats_archive 
  SELECT * FROM usage_stats 
  WHERE month < TO_CHAR(NOW() - INTERVAL '1 year', 'YYYY-MM');
  
  DELETE FROM usage_stats 
  WHERE month < TO_CHAR(NOW() - INTERVAL '1 year', 'YYYY-MM');
END;
$$ LANGUAGE plpgsql;

-- 定期执行归档
SELECT cron.schedule('monthly-archive', '0 2 1 * *', 'SELECT archive_old_data();');
```

### 2.3 连接池优化

**配置优化**：
```typescript
const supabaseConfig = {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'x-application-name': 'luminos-ai-platform',
    },
  },
};
```

## 3. 图片存储优化

### 3.1 智能压缩策略

**实施方案**：
```typescript
interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'webp' | 'jpg' | 'png';
}

const compressionSettings = {
  thumbnail: { maxWidth: 200, maxHeight: 200, quality: 0.7, format: 'webp' },
  preview: { maxWidth: 800, maxHeight: 600, quality: 0.8, format: 'webp' },
  full: { maxWidth: 1920, maxHeight: 1080, quality: 0.9, format: 'webp' },
};

async function optimizeImage(
  imageBuffer: Buffer, 
  config: CompressionConfig
): Promise<Buffer> {
  // 使用 sharp 或类似库进行图片优化
  return sharp(imageBuffer)
    .resize(config.maxWidth, config.maxHeight, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .webp({ quality: Math.round(config.quality * 100) })
    .toBuffer();
}
```

### 3.2 CDN集成优化

**策略**：
```typescript
const cdnConfig = {
  baseUrl: 'https://cdn.luminos.ai',
  transformations: {
    thumbnail: 'w_200,h_200,c_fill,f_webp,q_70',
    preview: 'w_800,h_600,c_fit,f_webp,q_80',
    full: 'w_1920,h_1080,c_fit,f_webp,q_90',
  },
};

function generateCdnUrl(imageId: string, transformation: string): string {
  return `${cdnConfig.baseUrl}/${transformation}/${imageId}`;
}
```

### 3.3 延迟清理机制

**实施方案**：
```typescript
class ImageCleanupManager {
  async scheduleCleanup(imageId: string, delay: number = 30 * 24 * 60 * 60 * 1000) {
    // 30天后清理未使用的图片
    setTimeout(async () => {
      const isStillUsed = await this.checkImageUsage(imageId);
      if (!isStillUsed) {
        await this.deleteImage(imageId);
      }
    }, delay);
  }
  
  private async checkImageUsage(imageId: string): Promise<boolean> {
    // 检查图片是否在用户作品集中
    const { data } = await supabase
      .from('images')
      .select('id')
      .eq('id', imageId)
      .single();
    
    return !!data;
  }
}
```

## 4. 服务器资源优化

### 4.1 无服务器架构迁移

**Vercel Edge Functions优化**：
```typescript
// edge function for AI API calls
export const config = {
  runtime: 'edge',
  regions: ['hkg1', 'sin1'], // 亚太地区
};

export default async function handler(req: Request) {
  // 边缘计算处理AI请求
  const response = await processAIRequest(req);
  
  return new Response(JSON.stringify(response), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### 4.2 Redis缓存层

**实施策略**：
```typescript
interface CacheLayer {
  // L1: 内存缓存 (最快)
  memory: LRUCache<string, any>;
  
  // L2: Redis缓存 (中等)
  redis: RedisClient;
  
  // L3: 数据库 (最慢)
  database: SupabaseClient;
}

class TieredCache {
  async get<T>(key: string): Promise<T | null> {
    // L1: 检查内存缓存
    let result = this.memory.get(key);
    if (result) return result;
    
    // L2: 检查Redis缓存
    result = await this.redis.get(key);
    if (result) {
      this.memory.set(key, result);
      return JSON.parse(result);
    }
    
    // L3: 查询数据库
    result = await this.database.from('cache').select('*').eq('key', key).single();
    if (result.data) {
      await this.redis.setex(key, 3600, JSON.stringify(result.data.value));
      this.memory.set(key, result.data.value);
      return result.data.value;
    }
    
    return null;
  }
}
```

## 5. 分层服务模式

### 5.1 服务层级定义

```typescript
interface ServiceTier {
  name: string;
  monthlyPrice: number;
  dailyLimits: {
    aiRequests: number;
    imageGeneration: number;
    storageGB: number;
    advancedFeatures: string[];
  };
  features: string[];
}

const serviceTiers: ServiceTier[] = [
  {
    name: 'free',
    monthlyPrice: 0,
    dailyLimits: {
      aiRequests: 10,
      imageGeneration: 5,
      storageGB: 0.1,
      advancedFeatures: [],
    },
    features: ['基础设计建议', '简单用户画像', '标准水晶推荐'],
  },
  {
    name: 'premium',
    monthlyPrice: 29,
    dailyLimits: {
      aiRequests: 100,
      imageGeneration: 50,
      storageGB: 2,
      advancedFeatures: ['五维能量分析', '高级设计建议'],
    },
    features: ['深度用户画像', '个性化设计', '优先处理', '高级分析'],
  },
  {
    name: 'ultimate',
    monthlyPrice: 99,
    dailyLimits: {
      aiRequests: 500,
      imageGeneration: 200,
      storageGB: 10,
      advancedFeatures: ['全部功能'],
    },
    features: ['无限制访问', '专属客服', '自定义功能', 'API访问'],
  },
];
```

### 5.2 动态定价策略

```typescript
class DynamicPricing {
  calculatePrice(usage: UserUsage, tier: ServiceTier): number {
    let totalCost = tier.monthlyPrice;
    
    // 超出限制的额外费用
    if (usage.aiRequests > tier.dailyLimits.aiRequests) {
      const excess = usage.aiRequests - tier.dailyLimits.aiRequests;
      totalCost += excess * 0.1; // 每次超出收费0.1元
    }
    
    if (usage.imageGeneration > tier.dailyLimits.imageGeneration) {
      const excess = usage.imageGeneration - tier.dailyLimits.imageGeneration;
      totalCost += excess * 0.5; // 每次超出收费0.5元
    }
    
    return totalCost;
  }
}
```

## 6. 成本监控与预警

### 6.1 实时成本监控

```typescript
interface CostMetrics {
  timestamp: number;
  costs: {
    aiRequests: number;
    database: number;
    storage: number;
    bandwidth: number;
    total: number;
  };
  usage: {
    activeUsers: number;
    apiCalls: number;
    dataTransfer: number;
  };
  efficiency: {
    costPerUser: number;
    costPerRequest: number;
    cacheHitRate: number;
  };
}

class CostMonitor {
  async generateCostReport(): Promise<CostMetrics> {
    const now = Date.now();
    
    return {
      timestamp: now,
      costs: await this.calculateCosts(),
      usage: await this.getUsageMetrics(),
      efficiency: await this.calculateEfficiency(),
    };
  }
  
  async checkThresholds(metrics: CostMetrics): Promise<void> {
    const thresholds = {
      dailyCostLimit: 1000, // 日成本限制1000元
      costPerUserLimit: 5,   // 每用户成本限制5元
      cacheHitRateMin: 0.7,  // 缓存命中率最低70%
    };
    
    if (metrics.costs.total > thresholds.dailyCostLimit) {
      await this.sendAlert('日成本超限', metrics);
    }
    
    if (metrics.efficiency.costPerUser > thresholds.costPerUserLimit) {
      await this.sendAlert('用户成本过高', metrics);
    }
    
    if (metrics.efficiency.cacheHitRate < thresholds.cacheHitRateMin) {
      await this.sendAlert('缓存效率低下', metrics);
    }
  }
}
```

### 6.2 成本优化仪表板

```typescript
interface CostDashboard {
  currentPeriod: {
    totalCost: number;
    costBreakdown: Record<string, number>;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  
  optimization: {
    potentialSavings: number;
    recommendations: string[];
    implementedSavings: number;
  };
  
  predictions: {
    nextMonthCost: number;
    yearEndProjection: number;
    confidenceLevel: number;
  };
}
```

## 7. 实施时间表

### 阶段一（1-2周）：立即优化
- [x] AI API缓存实施
- [x] 请求去重机制
- [x] 配额管理系统
- [x] 数据库查询优化

**预期节约**：20-30%

### 阶段二（3-4周）：架构优化
- [ ] Edge Functions迁移
- [ ] Redis缓存层部署
- [ ] 图片压缩优化
- [ ] 数据库分区实施

**预期节约**：35-45%

### 阶段三（5-8周）：智能优化
- [ ] 机器学习预测模型
- [ ] 动态定价系统
- [ ] 自动扩缩容
- [ ] 异常检测系统

**预期节约**：50-60%

## 8. 预期效果

### 8.1 成本节约目标

| 优化项目 | 当前成本 | 优化后成本 | 节约比例 |
|---------|---------|-----------|---------|
| AI API调用 | ¥5,000/月 | ¥2,000/月 | 60% |
| 数据库使用 | ¥1,500/月 | ¥1,000/月 | 33% |
| 图片存储 | ¥800/月 | ¥400/月 | 50% |
| 服务器资源 | ¥2,000/月 | ¥1,200/月 | 40% |
| **总计** | **¥9,300/月** | **¥4,600/月** | **49%** |

### 8.2 性能提升指标

- **响应时间**：平均减少40-60%
- **缓存命中率**：提升至70-85%
- **系统吞吐量**：提升200-300%
- **用户满意度**：提升20-30%

### 8.3 ROI分析

- **初期投资**：开发时间约6-8周
- **年节约成本**：约¥56,400
- **投资回报周期**：2-3个月
- **3年累计节约**：约¥169,200

## 9. 风险评估与应对

### 9.1 技术风险
- **缓存一致性问题**：实施多级缓存失效策略
- **性能回归**：渐进式部署，A/B测试验证
- **数据丢失风险**：完整备份策略，回滚机制

### 9.2 业务风险
- **用户体验下降**：严密监控关键指标
- **功能限制过严**：灵活的配额调整机制
- **竞争劣势**：保持核心功能免费策略

## 10. 监控与持续优化

### 10.1 关键指标监控
- 实时成本监控仪表板
- 用户体验指标追踪
- 系统性能基准测试
- 竞争对手价格监控

### 10.2 持续优化流程
1. **月度成本审查**：分析成本趋势和异常
2. **季度策略调整**：根据市场变化调整策略
3. **年度架构评估**：评估技术架构优化机会
4. **持续创新**：探索新的成本优化技术 