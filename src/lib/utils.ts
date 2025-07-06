import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';
import { supabase } from './supabase';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface UserProfileWithMeta extends UserProfileDataOutput {
  createdAt?: string;
  id: string;
  [key: string]: any;
}

/**
 * 获取用户所有画像（按创建时间倒序）
 */
export async function getUserProfiles(email: string): Promise<UserProfileWithMeta[]> {
  try {
    console.log('🔍 正在获取用户画像列表，邮箱:', email);
    
    if (!email || email.trim() === '') {
      console.warn('⚠️ getUserProfiles: email 参数为空');
      return [];
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.trim())
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ 获取用户画像列表失败:', {
        message: error.message || '未知错误',
        code: error.code || '无错误代码',
        details: error.details || '无详细信息',
        hint: error.hint || '无提示',
        email: email
      });
      return [];
    }
    
    if (!data || data.length === 0) {
      console.log('ℹ️ 未找到用户画像，邮箱:', email);
      return [];
    }
    
    console.log(`✅ 成功获取用户画像列表，找到 ${data.length} 个画像`);
    return data as UserProfileWithMeta[];
  } catch (error) {
    console.error('❌ 获取用户画像列表时发生异常:', {
      message: error instanceof Error ? error.message : '未知错误',
      email: email,
      error: error
    });
    return [];
  }
}

/**
 * 获取用户最新画像（无则返回null）
 */
export async function getUserProfile(email: string): Promise<UserProfileWithMeta | null> {
  try {
    console.log('🔍 正在获取用户最新画像，邮箱:', email);
    
    if (!email || email.trim() === '') {
      console.warn('⚠️ getUserProfile: email 参数为空');
      return createDefaultProfile(); // 返回默认用户
    }
    
    const profiles = await getUserProfiles(email);
    
    if (profiles.length === 0) {
      console.log('ℹ️ 未找到用户画像，邮箱:', email);
      return createDefaultProfile(); // 返回默认用户
    }
    
    console.log('✅ 成功获取用户最新画像:', profiles[0]);
    return profiles[0];
  } catch (error) {
    console.error('❌ 获取用户最新画像时发生异常:', {
      message: error instanceof Error ? error.message : '未知错误',
      email: email,
      error: error
    });
    
    // 发生异常时返回默认画像
    return createDefaultProfile();
  }
}

// 创建默认用户画像的辅助函数
function createDefaultProfile(): UserProfileWithMeta {
    return {
    id: 'default',
    name: '默认用户',
      mbtiLikeType: 'ENFP',
      inferredZodiac: 'Aries',
      inferredChineseZodiac: 'Dragon',
      inferredElement: 'Fire',
      inferredPlanet: 'Mars',
      chakraAnalysis: '心轮平衡',
      coreEnergyInsights: '能量平衡',
      createdAt: new Date().toISOString()
    };
  }

/**
 * 实用的防抖函数，用于限制函数调用频率
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timer) clearTimeout(timer);
    
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}
