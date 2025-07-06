import { createBrowserClient } from '@supabase/ssr';
import type { UserProfileDataOutput } from '@/ai/schemas/user-profile-schemas';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 环境变量未配置，请检查 .env.local 文件中的 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// 数据类型定义
export interface UserProfile {
  id: string;
  user_id: string;
  email?: string;
  name?: string;
  birth_date?: string;
  gender?: string;
  zodiac_sign?: string;
  chinese_zodiac?: string;
  element?: string;
  mbti?: string;
  answers?: any;
  chakra_analysis?: any;
  energy_preferences?: any;
  personality_insights?: any;
  enhanced_assessment?: any; // 增强评估数据
  created_at: string;
  updated_at?: string;
}

export interface DesignWork {
  id: string;
  user_id: string;
  title?: string;
  prompt?: string;
  url: string;
  style?: string;
  category?: string;
  crystals_used?: string[];
  colors?: string[];
  tags?: string[];
  is_favorite?: boolean;
  share_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface EnergyRecord {
  id: string;
  user_id: string;
  date: string;
  energy_level: number;
  chakra_states: any;
  mood_tags?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MeditationSession {
  id: string;
  user_id: string;
  session_type: string;
  duration: number;
  crystals_used?: string[];
  notes?: string;
  completed_at: string;
}

export interface MembershipInfo {
  id: string;
  user_id: string;
  type: 'free' | 'premium' | 'ultimate';
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expired_at?: string;
}

export interface UsageStats {
  id: string;
  user_id: string;
  month: string;
  designs_generated: number;
  images_created: number;
  ai_consultations: number;
  energy_analyses: number;
  meditation_sessions: number;
  created_at: string;
  updated_at: string;
}

// 用户档案相关操作
export const profileService = {
  // 获取用户档案（通过用户ID）
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  },

  // 获取用户档案（通过邮箱）
  async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    if (!email || email.trim() === '') {
      console.warn('getUserProfileByEmail: email is required');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.trim())
        .single();
      
      if (error) {
        // 如果是因为没有找到记录，不输出错误日志
        if (error.code === 'PGRST116') {
          console.log('No user profile found for email:', email);
          return null;
        }
        
        // 如果是权限相关错误 (RLS, 认证问题等)
        if (error.code === 'PGRST001' || error.code === '42501' || error.message?.includes('row-level security')) {
          console.warn('访问被拒绝，可能是由于用户未通过 Supabase 认证或权限不足:', email);
          return null;
        }
        
        console.error('Error fetching user profile by email:', {
          message: error.message || '未知错误',
          code: error.code || '无错误代码',
          details: error.details || '无详细信息',
          hint: error.hint || '无提示',
          email: email
        });
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching user profile by email:', {
        message: error instanceof Error ? error.message : '未知错误',
        email: email,
        error: error
      });
      return null;
    }
  },

  // 创建或更新用户档案
  async upsertUserProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      console.log('🔄 正在保存用户档案:', profile);
      
      if (!profile.email) {
        console.error('❌ Email is required for profile creation');
        return null;
      }
      
      // 首先检查是否存在该email的用户档案
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', profile.email)
        .single();
      
      let result;
      if (existingProfile) {
        // 更新现有档案
        console.log('📝 更新现有用户档案');
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...profile,
            updated_at: new Date().toISOString()
          })
          .eq('email', profile.email)
          .select()
          .single();
        result = { data, error };
      } else {
        // 创建新档案
        console.log('✨ 创建新用户档案');
        const { data, error } = await supabase
          .from('profiles')
          .insert({
            ...profile,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
        result = { data, error };
      }
      
      if (result.error) {
        console.error('❌ Error saving user profile:', {
          message: result.error.message || '未知错误',
          code: result.error.code || '无错误代码',
          details: result.error.details || '无详细信息',
          hint: result.error.hint || '无提示信息',
          fullError: result.error
        });
        return null;
      }
      
      console.log('✅ 用户档案保存成功:', result.data);
      return result.data;
    } catch (error) {
      console.error('❌ Unexpected error saving user profile:', error);
      return null;
    }
  },

  // 获取用户所有档案（按创建时间倒序）
  async getUserProfiles(email: string): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      console.error('Error fetching user profiles:', error);
      return [];
    }
    return data;
  }
};

// 设计作品相关操作
export const designService = {
  // 获取用户所有设计作品
  async getUserDesigns(userId: string): Promise<DesignWork[]> {
    try {
      if (!userId) {
        console.warn('getUserDesigns: userId is empty');
        return [];
      }

      console.log('Fetching user designs for userId:', userId);
      
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user designs:', {
          error,
          userId,
          table: 'images'
        });
        return [];
      }
      
      console.log(`Found ${data?.length || 0} designs for user ${userId}`);
      return data || [];
    } catch (error) {
      console.error('Unexpected error in getUserDesigns:', error);
      return [];
    }
  },

  // 创建新设计作品
  async createDesign(design: Omit<DesignWork, 'id' | 'created_at' | 'updated_at'>): Promise<DesignWork | null> {
    const { data, error } = await supabase
      .from('images')
      .insert(design)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating design:', error);
      return null;
    }
    return data;
  },

  // 更新设计作品
  async updateDesign(id: string, updates: Partial<DesignWork>): Promise<DesignWork | null> {
    const { data, error } = await supabase
      .from('images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating design:', error);
      return null;
    }
    return data;
  },

  // 删除设计作品
  async deleteDesign(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting design:', error);
      return false;
    }
    return true;
  },

  // 切换收藏状态
  async toggleFavorite(id: string): Promise<boolean> {
    const { data: current } = await supabase
      .from('images')
      .select('is_favorite')
      .eq('id', id)
      .single();
    
    if (!current) return false;

    const { error } = await supabase
      .from('images')
      .update({ is_favorite: !current.is_favorite })
      .eq('id', id);
    
    return !error;
  }
};

// 能量记录相关操作
export const energyService = {
  // 获取用户能量记录
  async getUserEnergyRecords(userId: string, limit: number = 30): Promise<EnergyRecord[]> {
    try {
      if (!userId) {
        console.warn('getUserEnergyRecords: userId is empty');
        return [];
      }

      console.log('Fetching energy records for userId:', userId);
      
      const { data, error } = await supabase
        .from('user_energy_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching energy records:', {
          error,
          userId,
          table: 'user_energy_records'
        });
        return [];
      }
      
      console.log(`Found ${data?.length || 0} energy records for user ${userId}`);
      return data || [];
    } catch (error) {
      console.error('Unexpected error in getUserEnergyRecords:', error);
      return [];
    }
  },

  // 创建或更新每日能量记录
  async upsertEnergyRecord(record: Omit<EnergyRecord, 'id' | 'created_at' | 'updated_at'>): Promise<EnergyRecord | null> {
    const { data, error } = await supabase
      .from('user_energy_records')
      .upsert(record, { onConflict: 'user_id,date' })
      .select()
      .single();
    
    if (error) {
      console.error('Error upserting energy record:', error);
      return null;
    }
    return data;
  }
};

// 冥想会话相关操作
export const meditationService = {
  // 获取用户冥想记录
  async getUserMeditationSessions(userId: string, limit: number = 50): Promise<MeditationSession[]> {
    try {
      if (!userId) {
        console.warn('getUserMeditationSessions: userId is empty');
        return [];
      }

      console.log('Fetching meditation sessions for userId:', userId);
      
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Error fetching meditation sessions:', {
          error,
          userId,
          table: 'meditation_sessions'
        });
        return [];
      }
      
      console.log(`Found ${data?.length || 0} meditation sessions for user ${userId}`);
      return data || [];
    } catch (error) {
      console.error('Unexpected error in getUserMeditationSessions:', error);
      return [];
    }
  },

  // 记录冥想会话
  async recordMeditationSession(session: Omit<MeditationSession, 'id' | 'completed_at'>): Promise<MeditationSession | null> {
    const { data, error } = await supabase
      .from('meditation_sessions')
      .insert(session)
      .select()
      .single();
    
    if (error) {
      console.error('Error recording meditation session:', error);
      return null;
    }
    return data;
  }
};

// 会员相关操作
export const membershipService = {
  // 获取用户会员信息
  async getUserMembership(userId: string): Promise<MembershipInfo | null> {
    try {
      if (!userId) {
        console.warn('getUserMembership: userId is empty');
        return null;
      }

      console.log('Fetching membership for userId:', userId);
      
    const { data, error } = await supabase
        .from('membership_info')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
        console.error('Error fetching membership:', {
          error,
          userId,
          table: 'membership_info'
        });
        return null;
      }
      
      console.log(`Found membership for user ${userId}:`, data);
      return data;
    } catch (error) {
      console.error('Unexpected error in getUserMembership:', error);
      return null;
    }
  },

  // 获取用户使用统计
  async getUserUsageStats(userId: string, months: number = 6): Promise<UsageStats[]> {
    try {
      if (!userId) {
        console.warn('getUserUsageStats: userId is empty');
        return [];
      }

      console.log('Fetching usage stats for userId:', userId);
      
    const { data, error } = await supabase
        .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })
      .limit(months);
    
    if (error) {
        console.error('Error fetching usage stats:', {
          error,
          userId,
          table: 'usage_stats'
        });
        return [];
      }
      
      console.log(`Found ${data?.length || 0} usage stats for user ${userId}`);
      return data || [];
    } catch (error) {
      console.error('Unexpected error in getUserUsageStats:', error);
      return [];
    }
  },

  // 更新使用统计
  async updateUsageStats(userId: string, updates: Partial<UsageStats>): Promise<boolean> {
    try {
      if (!userId) {
        console.warn('updateUsageStats: userId is empty');
        return false;
      }

    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
      
      console.log('Updating usage stats for userId:', userId, 'month:', currentMonth);
    
    const { error } = await supabase
        .from('usage_stats')
      .upsert({
        user_id: userId,
        month: currentMonth,
        ...updates
      }, { onConflict: 'user_id,month' });
    
    if (error) {
        console.error('Error updating usage stats:', {
          error,
          userId,
          currentMonth,
          updates,
          table: 'usage_stats'
        });
        return false;
      }
      
      console.log('Successfully updated usage stats for user:', userId);
      return true;
    } catch (error) {
      console.error('Unexpected error in updateUsageStats:', error);
      return false;
    }
  }
};

// 用户设置相关操作
export const settingsService = {
  // 获取用户设置
  async getUserSettings(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
    return data;
  },

  // 更新用户设置
  async updateUserSettings(userId: string, settings: any): Promise<boolean> {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings
      }, { onConflict: 'user_id' });
    
    if (error) {
      console.error('Error updating user settings:', error);
      return false;
    }
    return true;
  }
};

// 获取 Supabase 项目 URL 和密钥（用于客户端配置）
export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  anonKey: supabaseAnonKey
});

// 测试 Supabase 连接
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 开始 Supabase 连接测试...');
    console.log('📋 Supabase 配置状态:', {
      url: supabaseUrl ? `✅ 已配置 (${supabaseUrl})` : '❌ 未配置',
      anonKey: supabaseAnonKey ? `✅ 已配置 (${supabaseAnonKey.substring(0, 50)}...)` : '❌ 未配置'
    });
    
    if (!supabaseUrl || !supabaseAnonKey) {
      const error = 'Supabase 环境变量未配置';
      console.error('❌', error);
      throw new Error(error);
    }
    
    // 测试1: 基础认证服务连接
    console.log('🔌 测试1: 认证服务连接...');
    try {
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('❌ 认证服务连接失败:', JSON.stringify(authError, null, 2));
        throw authError;
      }
      
      console.log('✅ 认证服务连接成功');
    } catch (authErr: any) {
      console.error('❌ 认证服务异常:', JSON.stringify(authErr, null, 2));
      throw authErr;
    }
    
    // 测试2: 使用最简单的查询测试数据库连接
    console.log('🗄️ 测试2: 数据库连接（使用最简单查询）...');
    try {
      const { data, error, status, statusText } = await supabase
        .from('user_energy_records')
        .select('id')
        .limit(1);
      
      console.log('📊 查询响应状态:', {
        status,
        statusText,
        hasData: !!data,
        hasError: !!error,
        dataLength: data ? data.length : 0
      });
      
      if (error) {
        console.log('⚠️ user_energy_records 表查询失败');
        console.error('❌ 数据库连接失败:', JSON.stringify(error, null, 2));
        
        // 尝试其他表
        console.log('🔄 尝试其他表...');
        const { data: imagesData, error: imagesError } = await supabase
          .from('images')
          .select('id')
          .limit(1);
        
        if (imagesError) {
          console.error('❌ images 表也失败:', JSON.stringify(imagesError, null, 2));
          throw error; // 抛出原始错误
        } else {
          console.log('✅ images 表连接成功');
          return true;
        }
      }
      
      console.log('✅ 数据库连接成功', data ? `(找到 ${data.length} 条记录)` : '(空表)');
      console.log('🎉 Supabase 连接测试完全成功！');
      return true;
      
    } catch (dbErr: any) {
      console.error('❌ 数据库连接异常:', JSON.stringify(dbErr, null, 2));
      throw dbErr;
    }
    
  } catch (error: any) {
    const errorInfo = {
      name: error?.name || '未知错误类型',
      message: error?.message || '未知错误信息',
      code: error?.code || '无错误代码',
      details: error?.details || '无详细信息',
      hint: error?.hint || '无提示',
      stack: error?.stack ? error.stack.split('\n').slice(0, 3).join('\n') : '无堆栈信息',
      fullError: JSON.stringify(error, null, 2)
    };
    
    console.error('💥 Supabase 连接测试失败:', errorInfo);
    
    // 提供解决建议
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log('💡 解决建议: 请检查 .env.local 文件中的 Supabase 配置');
    } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('network')) {
      console.log('💡 解决建议: 请检查网络连接或 Supabase 项目状态');
    } else if (error?.code === '42P01') {
      console.log('💡 解决建议: 数据库表需要初始化，请运行数据库迁移');
    } else if (error?.code === 'PGRST301') {
      console.log('💡 解决建议: 可能是 RLS (Row Level Security) 权限问题');
    }
    
    return false;
  }
}; 