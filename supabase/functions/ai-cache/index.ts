import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Deno global declarations
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

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

// 创建Supabase客户端
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// 地理区域映射
const getRegion = (request: Request): string => {
  const cfCountry = request.headers.get('CF-IPCountry');
  
  // 基于Cloudflare的地理信息确定最近的缓存区域
  if (cfCountry) {
    switch (cfCountry) {
      case 'US':
      case 'CA':
      case 'MX':
        return 'us-west';
      case 'GB':
      case 'DE':
      case 'FR':
      case 'IT':
      case 'ES':
        return 'eu-west';
      case 'CN':
      case 'JP':
      case 'KR':
      case 'SG':
        return 'ap-east';
      case 'AU':
      case 'NZ':
        return 'ap-southeast';
      default:
        return 'global';
    }
  }
  
  return 'global';
};

// 缓存命名空间管理
const getCacheNamespace = (key: string): string => {
  if (key.startsWith('ai-')) return 'ai_cache';
  if (key.startsWith('user-')) return 'user_cache';
  if (key.startsWith('design-')) return 'design_cache';
  return 'general_cache';
};

// 智能TTL计算
const calculateTTL = (key: string, defaultTTL: number = 3600): number => {
  // AI相关缓存更长时间
  if (key.includes('design-suggestions') || key.includes('user-profile')) {
    return 24 * 60 * 60; // 24小时
  }
  
  // 用户数据相对较短
  if (key.includes('user-') || key.includes('session-')) {
    return 60 * 60; // 1小时
  }
  
  // 静态配置更长时间
  if (key.includes('config-') || key.includes('settings-')) {
    return 7 * 24 * 60 * 60; // 7天
  }
  
  return defaultTTL;
};

Deno.serve(async (req: Request) => {
  // CORS处理
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const region = getRegion(req);
    const timestamp = new Date().toISOString();
    
    // 解析请求
    const cacheRequest: CacheRequest = await req.json();
    const { key, operation, data, ttl } = cacheRequest;
    
    if (!key) {
      return Response.json({
        success: false,
        error: 'Cache key is required',
        region,
        timestamp
      } as CacheResponse, { status: 400 });
    }

    const namespace = getCacheNamespace(key);
    const finalTTL = ttl || calculateTTL(key);
    const cacheKey = `${region}:${namespace}:${key}`;

    switch (operation) {
      case 'get': {
        // 从数据库获取缓存
        const { data: cacheData, error } = await supabase
          .from('edge_cache')
          .select('*')
          .eq('cache_key', cacheKey)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !cacheData) {
          return Response.json({
            success: true,
            data: null,
            cached: false,
            region,
            timestamp
          } as CacheResponse);
        }

        // 更新访问统计
        await supabase
          .from('edge_cache')
          .update({ 
            hit_count: cacheData.hit_count + 1,
            last_accessed: new Date().toISOString()
          })
          .eq('id', cacheData.id);

        return Response.json({
          success: true,
          data: cacheData.cache_data,
          cached: true,
          region,
          timestamp
        } as CacheResponse);
      }

      case 'set': {
        if (!data) {
          return Response.json({
            success: false,
            error: 'Cache data is required for set operation',
            region,
            timestamp
          } as CacheResponse, { status: 400 });
        }

        const expiresAt = new Date(Date.now() + finalTTL * 1000).toISOString();
        
        // 插入或更新缓存
        const { error } = await supabase
          .from('edge_cache')
          .upsert({
            cache_key: cacheKey,
            cache_data: data,
            namespace,
            region,
            expires_at: expiresAt,
            created_at: new Date().toISOString(),
            hit_count: 0,
            last_accessed: new Date().toISOString()
          });

        if (error) {
          console.error('Cache set error:', error);
          return Response.json({
            success: false,
            error: 'Failed to set cache',
            region,
            timestamp
          } as CacheResponse, { status: 500 });
        }

        return Response.json({
          success: true,
          data: { key: cacheKey, ttl: finalTTL },
          cached: true,
          region,
          timestamp
        } as CacheResponse);
      }

      case 'delete': {
        const { error } = await supabase
          .from('edge_cache')
          .delete()
          .eq('cache_key', cacheKey);

        if (error) {
          console.error('Cache delete error:', error);
          return Response.json({
            success: false,
            error: 'Failed to delete cache',
            region,
            timestamp
          } as CacheResponse, { status: 500 });
        }

        return Response.json({
          success: true,
          data: { deleted: cacheKey },
          cached: false,
          region,
          timestamp
        } as CacheResponse);
      }

      case 'invalidate': {
        // 批量删除匹配的缓存项
        const pattern = key.endsWith('*') ? key.slice(0, -1) : key;
        
        const { error } = await supabase
          .from('edge_cache')
          .delete()
          .like('cache_key', `${region}:${namespace}:${pattern}%`);

        if (error) {
          console.error('Cache invalidate error:', error);
          return Response.json({
            success: false,
            error: 'Failed to invalidate cache',
            region,
            timestamp
          } as CacheResponse, { status: 500 });
        }

        return Response.json({
          success: true,
          data: { invalidated: pattern },
          cached: false,
          region,
          timestamp
        } as CacheResponse);
      }

      default:
        return Response.json({
          success: false,
          error: 'Invalid cache operation',
          region,
          timestamp
        } as CacheResponse, { status: 400 });
    }

  } catch (error) {
    console.error('Edge cache function error:', error);
    
    return Response.json({
      success: false,
      error: 'Internal server error',
      region: 'unknown',
      timestamp: new Date().toISOString()
    } as CacheResponse, { status: 500 });
  }
}); 