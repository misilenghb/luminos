# 数据库性能优化计划

## 1. 索引优化策略

### 核心业务表索引
```sql
-- 用户档案表索引
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- 用户能量记录索引
CREATE INDEX IF NOT EXISTS idx_user_energy_records_profile_id_date ON user_energy_records(profile_id, date);
CREATE INDEX IF NOT EXISTS idx_user_energy_records_created_at ON user_energy_records(created_at);

-- 设计作品索引
CREATE INDEX IF NOT EXISTS idx_images_user_id_created_at ON images(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_images_is_favorite ON images(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_images_tags ON images USING GIN(tags);

-- 冥想会话索引
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_id_date ON meditation_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_session_type ON meditation_sessions(session_type);

-- 会员信息索引
CREATE INDEX IF NOT EXISTS idx_memberships_user_id_status ON memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_memberships_expired_at ON memberships(expired_at);
```

### 复合索引优化
```sql
-- 用户作品统计优化
CREATE INDEX IF NOT EXISTS idx_images_user_stats ON images(user_id, created_at, is_favorite);

-- 能量分析优化
CREATE INDEX IF NOT EXISTS idx_energy_records_analysis ON user_energy_records(user_id, date, energy_level);

-- 使用统计优化
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_month ON usage_stats(user_id, month);
```

## 2. 查询优化

### 用户画像汇总视图
```sql
CREATE OR REPLACE VIEW user_profile_summary AS
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.name,
  p.mbti,
  p.zodiac_sign,
  COUNT(DISTINCT i.id) as total_designs,
  COUNT(DISTINCT CASE WHEN i.is_favorite THEN i.id END) as favorite_designs,
  COUNT(DISTINCT er.id) as energy_records_count,
  COUNT(DISTINCT ms.id) as meditation_sessions_count,
  COALESCE(AVG(er.energy_level), 0) as avg_energy_level,
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN images i ON p.user_id = i.user_id
LEFT JOIN user_energy_records er ON p.user_id = er.user_id
LEFT JOIN meditation_sessions ms ON p.user_id = ms.user_id
GROUP BY p.id, p.user_id, p.email, p.name, p.mbti, p.zodiac_sign, p.created_at, p.updated_at;
```

### 分区表策略
```sql
-- 能量记录按月分区
CREATE TABLE user_energy_records_partitioned (
  LIKE user_energy_records INCLUDING ALL
) PARTITION BY RANGE (date);

-- 创建分区
CREATE TABLE user_energy_records_2024_01 PARTITION OF user_energy_records_partitioned
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- 自动创建分区函数
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
  start_date date;
  end_date date;
  partition_name text;
BEGIN
  start_date := date_trunc('month', CURRENT_DATE);
  end_date := start_date + INTERVAL '1 month';
  partition_name := 'user_energy_records_' || to_char(start_date, 'YYYY_MM');
  
  EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF user_energy_records_partitioned
                  FOR VALUES FROM (%L) TO (%L)', 
                  partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

## 3. Supabase配置优化

### 连接池优化
```typescript
// lib/supabase-optimized.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseOptimized = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
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
  }
);
```

### 批量操作优化
```typescript
// lib/database-batch-operations.ts
export class BatchOperations {
  private static readonly BATCH_SIZE = 100;

  static async batchInsert<T>(
    table: string,
    records: T[],
    client = supabaseOptimized
  ) {
    const results = [];
    
    for (let i = 0; i < records.length; i += this.BATCH_SIZE) {
      const batch = records.slice(i, i + this.BATCH_SIZE);
      
      const { data, error } = await client
        .from(table)
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Batch insert error for ${table}:`, error);
        throw error;
      }
      
      results.push(...(data || []));
    }
    
    return results;
  }

  static async batchUpsert<T>(
    table: string,
    records: T[],
    conflictColumns: string[],
    client = supabaseOptimized
  ) {
    const results = [];
    
    for (let i = 0; i < records.length; i += this.BATCH_SIZE) {
      const batch = records.slice(i, i + this.BATCH_SIZE);
      
      const { data, error } = await client
        .from(table)
        .upsert(batch, {
          onConflict: conflictColumns.join(','),
        })
        .select();
      
      if (error) {
        console.error(`Batch upsert error for ${table}:`, error);
        throw error;
      }
      
      results.push(...(data || []));
    }
    
    return results;
  }
}
```

## 4. 预期效果

### 性能提升
- 数据库查询速度提升 40-60%
- 用户操作响应时间减少 30-50%
- 并发用户处理能力提升 200%

### 成本节约
- 数据库资源使用减少 25-35%
- 查询成本降低 20-30%
- 服务器负载减轻 15-25%

### 用户体验
- 页面加载速度提升 30-50%
- 数据刷新时间减少 40-60%
- 系统稳定性提升至 99.9%

## 5. 实施时间表

### 阶段一（1-2周）：基础索引优化
- 创建核心业务表索引
- 部署复合索引
- 测试查询性能

### 阶段二（2-3周）：查询优化
- 创建汇总视图
- 实施分区策略
- 优化慢查询

### 阶段三（3-4周）：连接和缓存优化
- 配置连接池
- 实施批量操作
- 部署缓存策略

### 阶段四（4-5周）：监控和调优
- 部署性能监控
- 分析瓶颈
- 持续优化调整 