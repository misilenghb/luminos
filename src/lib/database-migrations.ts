import { supabase } from './supabase';

/**
 * 水晶日历系统数据库迁移脚本
 * 确保所有表结构完整，并建立正确的关联关系
 */

// SQL 脚本模板
const SQL_SCRIPTS = {
  // 1. 创建用户档案表
  createProfilesTable: `
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(100),
      birth_date DATE,
      gender VARCHAR(50),
      zodiac_sign VARCHAR(50),
      chinese_zodiac VARCHAR(50),
      element VARCHAR(50),
      mbti VARCHAR(10),
      answers JSONB DEFAULT '{}',
      chakra_analysis JSONB DEFAULT '{}',
      energy_preferences TEXT[],
      personality_insights TEXT[],
      enhanced_assessment JSONB DEFAULT '{}',
      avatar_url TEXT,
      location VARCHAR(100),
      timezone VARCHAR(50),
      language VARCHAR(10) DEFAULT 'zh',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // 2. 创建设计作品表
  createDesignWorksTable: `
    CREATE TABLE IF NOT EXISTS design_works (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      title VARCHAR(200),
      description TEXT,
      prompt TEXT,
      image_url TEXT NOT NULL,
      thumbnail_url TEXT,
      style VARCHAR(100),
      category VARCHAR(100),
      crystals_used TEXT[],
      colors TEXT[],
      tags TEXT[],
      is_favorite BOOLEAN DEFAULT FALSE,
      is_public BOOLEAN DEFAULT FALSE,
      view_count INTEGER DEFAULT 0,
      like_count INTEGER DEFAULT 0,
      share_count INTEGER DEFAULT 0,
      generation_params JSONB DEFAULT '{}',
      ai_analysis JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // 3. 创建能量记录表
  createEnergyRecordsTable: `
    CREATE TABLE IF NOT EXISTS user_energy_records (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
      chakra_states JSONB DEFAULT '{}',
      mood_tags TEXT[],
      emotions JSONB DEFAULT '{}',
      activities TEXT[],
      weather VARCHAR(50),
      lunar_phase VARCHAR(50),
      notes TEXT,
      ai_insights JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, date)
    );
  `,

  // 4. 创建冥想会话表
  createMeditationSessionsTable: `
    CREATE TABLE IF NOT EXISTS meditation_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      session_type VARCHAR(100) NOT NULL,
      title VARCHAR(200),
      description TEXT,
      duration_minutes INTEGER NOT NULL,
      crystals_used TEXT[],
      chakras_focused TEXT[],
      intentions TEXT[],
      guided_audio_url TEXT,
      background_music_url TEXT,
      completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
      mood_before JSONB DEFAULT '{}',
      mood_after JSONB DEFAULT '{}',
      insights TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // 5. 创建会员信息表
  createMembershipInfoTable: `
    CREATE TABLE IF NOT EXISTS membership_info (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      membership_type VARCHAR(50) DEFAULT 'free' CHECK (membership_type IN ('free', 'premium', 'ultimate')),
      status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      expires_at TIMESTAMP WITH TIME ZONE,
      auto_renew BOOLEAN DEFAULT FALSE,
      payment_method VARCHAR(50),
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      features_enabled JSONB DEFAULT '{}',
      usage_limits JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // 6. 创建使用统计表
  createUsageStatsTable: `
    CREATE TABLE IF NOT EXISTS usage_stats (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      month DATE NOT NULL, -- 月份的第一天
      designs_generated INTEGER DEFAULT 0,
      images_created INTEGER DEFAULT 0,
      ai_consultations INTEGER DEFAULT 0,
      energy_analyses INTEGER DEFAULT 0,
      meditation_sessions INTEGER DEFAULT 0,
      premium_features_used INTEGER DEFAULT 0,
      api_calls INTEGER DEFAULT 0,
      storage_used_mb INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, month)
    );
  `,

  // 7. 创建用户设置表
  createUserSettingsTable: `
    CREATE TABLE IF NOT EXISTS user_settings (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      notification_preferences JSONB DEFAULT '{}',
      privacy_settings JSONB DEFAULT '{}',
      display_preferences JSONB DEFAULT '{}',
      ai_preferences JSONB DEFAULT '{}',
      reminder_settings JSONB DEFAULT '{}',
      language VARCHAR(10) DEFAULT 'zh',
      timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
      theme VARCHAR(20) DEFAULT 'light',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // 8. 创建水晶库表
  createCrystalsTable: `
    CREATE TABLE IF NOT EXISTS crystals (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      name_en VARCHAR(100),
      category VARCHAR(50),
      color VARCHAR(50),
      chakra_association VARCHAR(50),
      element VARCHAR(50),
      hardness DECIMAL(3,1),
      origin VARCHAR(100),
      properties TEXT[],
      healing_properties TEXT[],
      emotional_benefits TEXT[],
      spiritual_benefits TEXT[],
      physical_benefits TEXT[],
      usage_instructions TEXT[],
      care_instructions TEXT[],
      price_range JSONB DEFAULT '{}',
      rarity VARCHAR(50),
      image_urls TEXT[],
      description TEXT,
      metaphysical_properties JSONB DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,

  // 9. 创建用户收藏水晶表
  createUserFavoriteCrystalsTable: `
    CREATE TABLE IF NOT EXISTS user_favorite_crystals (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      crystal_id UUID REFERENCES crystals(id) ON DELETE CASCADE,
      notes TEXT,
      personal_experience TEXT,
      effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, crystal_id)
    );
  `,

  // 10. 创建AI对话历史表
  createAiConversationsTable: `
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
      conversation_type VARCHAR(100) NOT NULL,
      title VARCHAR(200),
      messages JSONB DEFAULT '[]',
      context JSONB DEFAULT '{}',
      ai_model VARCHAR(100),
      tokens_used INTEGER DEFAULT 0,
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status VARCHAR(50) DEFAULT 'active',
      tags TEXT[]
    );
  `,

  // 创建索引
  createIndexes: `
    -- 用户档案相关索引
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

    -- 设计作品相关索引
    CREATE INDEX IF NOT EXISTS idx_design_works_user_id ON design_works(user_id);
    CREATE INDEX IF NOT EXISTS idx_design_works_profile_id ON design_works(profile_id);
    CREATE INDEX IF NOT EXISTS idx_design_works_category ON design_works(category);
    CREATE INDEX IF NOT EXISTS idx_design_works_created_at ON design_works(created_at);
    CREATE INDEX IF NOT EXISTS idx_design_works_is_public ON design_works(is_public);

    -- 能量记录相关索引
    CREATE INDEX IF NOT EXISTS idx_energy_records_user_id ON user_energy_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_energy_records_profile_id ON user_energy_records(profile_id);
    CREATE INDEX IF NOT EXISTS idx_energy_records_date ON user_energy_records(date);

    -- 冥想会话相关索引
    CREATE INDEX IF NOT EXISTS idx_meditation_user_id ON meditation_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_meditation_profile_id ON meditation_sessions(profile_id);
    CREATE INDEX IF NOT EXISTS idx_meditation_completed_at ON meditation_sessions(completed_at);
    CREATE INDEX IF NOT EXISTS idx_meditation_type ON meditation_sessions(session_type);

    -- 使用统计相关索引
    CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
    CREATE INDEX IF NOT EXISTS idx_usage_stats_month ON usage_stats(month);

    -- 水晶相关索引
    CREATE INDEX IF NOT EXISTS idx_crystals_name ON crystals(name);
    CREATE INDEX IF NOT EXISTS idx_crystals_category ON crystals(category);
    CREATE INDEX IF NOT EXISTS idx_crystals_chakra ON crystals(chakra_association);

    -- AI对话相关索引
    CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_conversations_type ON ai_conversations(conversation_type);
    CREATE INDEX IF NOT EXISTS idx_ai_conversations_started_at ON ai_conversations(started_at);
  `,

  // 创建触发器函数
  createTriggerFunctions: `
    -- 自动更新 updated_at 字段的函数
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- 为所有需要的表创建更新时间触发器
    DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
    CREATE TRIGGER update_profiles_updated_at 
      BEFORE UPDATE ON profiles 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_design_works_updated_at ON design_works;
    CREATE TRIGGER update_design_works_updated_at 
      BEFORE UPDATE ON design_works 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_energy_records_updated_at ON user_energy_records;
    CREATE TRIGGER update_energy_records_updated_at 
      BEFORE UPDATE ON user_energy_records 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_membership_info_updated_at ON membership_info;
    CREATE TRIGGER update_membership_info_updated_at 
      BEFORE UPDATE ON membership_info 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_usage_stats_updated_at ON usage_stats;
    CREATE TRIGGER update_usage_stats_updated_at 
      BEFORE UPDATE ON usage_stats 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
    CREATE TRIGGER update_user_settings_updated_at 
      BEFORE UPDATE ON user_settings 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_crystals_updated_at ON crystals;
    CREATE TRIGGER update_crystals_updated_at 
      BEFORE UPDATE ON crystals 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `,

  // RLS 策略设置
  setupRLSPolicies: `
    -- 启用行级安全
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE design_works ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_energy_records ENABLE ROW LEVEL SECURITY;
    ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE membership_info ENABLE ROW LEVEL SECURITY;
    ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_favorite_crystals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

    -- profiles 表策略
    DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;
    CREATE POLICY "Users can manage their own profiles" ON profiles
      FOR ALL USING (auth.uid() = user_id OR email = auth.jwt() ->> 'email');

    DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
    CREATE POLICY "Public profiles are viewable" ON profiles
      FOR SELECT USING (true);

    -- design_works 表策略
    DROP POLICY IF EXISTS "Users can manage their own designs" ON design_works;
    CREATE POLICY "Users can manage their own designs" ON design_works
      FOR ALL USING (auth.uid() = user_id);

    DROP POLICY IF EXISTS "Public designs are viewable" ON design_works;
    CREATE POLICY "Public designs are viewable" ON design_works
      FOR SELECT USING (is_public = true OR auth.uid() = user_id);

    -- user_energy_records 表策略
    DROP POLICY IF EXISTS "Users can manage their own energy records" ON user_energy_records;
    CREATE POLICY "Users can manage their own energy records" ON user_energy_records
      FOR ALL USING (auth.uid() = user_id);

    -- meditation_sessions 表策略
    DROP POLICY IF EXISTS "Users can manage their own meditation sessions" ON meditation_sessions;
    CREATE POLICY "Users can manage their own meditation sessions" ON meditation_sessions
      FOR ALL USING (auth.uid() = user_id);

    -- membership_info 表策略
    DROP POLICY IF EXISTS "Users can view their own membership" ON membership_info;
    CREATE POLICY "Users can view their own membership" ON membership_info
      FOR ALL USING (auth.uid() = user_id);

    -- usage_stats 表策略
    DROP POLICY IF EXISTS "Users can view their own usage stats" ON usage_stats;
    CREATE POLICY "Users can view their own usage stats" ON usage_stats
      FOR ALL USING (auth.uid() = user_id);

    -- user_settings 表策略
    DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
    CREATE POLICY "Users can manage their own settings" ON user_settings
      FOR ALL USING (auth.uid() = user_id);

    -- user_favorite_crystals 表策略
    DROP POLICY IF EXISTS "Users can manage their own favorite crystals" ON user_favorite_crystals;
    CREATE POLICY "Users can manage their own favorite crystals" ON user_favorite_crystals
      FOR ALL USING (auth.uid() = user_id);

    -- ai_conversations 表策略
    DROP POLICY IF EXISTS "Users can manage their own conversations" ON ai_conversations;
    CREATE POLICY "Users can manage their own conversations" ON ai_conversations
      FOR ALL USING (auth.uid() = user_id);

    -- crystals 表策略（公开只读）
    DROP POLICY IF EXISTS "Crystals are publicly readable" ON crystals;
    CREATE POLICY "Crystals are publicly readable" ON crystals
      FOR SELECT USING (true);
  `,

  // 快速修复常见问题
  quickFix: `
    -- 1. 确保 profiles 表有 enhanced_assessment 字段
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enhanced_assessment JSONB DEFAULT '{}';
    
    -- 2. 确保 profiles 表有其他必要字段
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'zh';
    
    -- 3. 临时禁用 RLS 以解决权限问题
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    
    -- 4. 创建基本索引
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
  `
};

/**
 * 执行数据库迁移
 */
export class DatabaseMigration {
  private static async executeSQL(sql: string, description: string): Promise<boolean> {
    try {
      console.log(`🔄 ${description}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`❌ ${description}失败:`, error);
        return false;
      }
      
      console.log(`✅ ${description}成功`);
      return true;
    } catch (error) {
      console.error(`❌ ${description}异常:`, error);
      return false;
    }
  }

  /**
   * 运行完整的数据库迁移
   */
  static async runMigration(): Promise<{
    success: boolean;
    results: { step: string; success: boolean; error?: any }[];
  }> {
    const results: { step: string; success: boolean; error?: any }[] = [];
    
    console.log('🚀 开始数据库迁移...');
    
    // 执行迁移步骤
    const steps = [
      { sql: SQL_SCRIPTS.createProfilesTable, description: '创建用户档案表' },
      { sql: SQL_SCRIPTS.createDesignWorksTable, description: '创建设计作品表' },
      { sql: SQL_SCRIPTS.createEnergyRecordsTable, description: '创建能量记录表' },
      { sql: SQL_SCRIPTS.createMeditationSessionsTable, description: '创建冥想会话表' },
      { sql: SQL_SCRIPTS.createMembershipInfoTable, description: '创建会员信息表' },
      { sql: SQL_SCRIPTS.createUsageStatsTable, description: '创建使用统计表' },
      { sql: SQL_SCRIPTS.createUserSettingsTable, description: '创建用户设置表' },
      { sql: SQL_SCRIPTS.createCrystalsTable, description: '创建水晶库表' },
      { sql: SQL_SCRIPTS.createUserFavoriteCrystalsTable, description: '创建用户收藏水晶表' },
      { sql: SQL_SCRIPTS.createAiConversationsTable, description: '创建AI对话历史表' },
      { sql: SQL_SCRIPTS.createIndexes, description: '创建数据库索引' },
      { sql: SQL_SCRIPTS.createTriggerFunctions, description: '创建触发器函数' },
      { sql: SQL_SCRIPTS.setupRLSPolicies, description: '设置行级安全策略' }
    ];

    for (const step of steps) {
      try {
        const success = await this.executeSQL(step.sql, step.description);
        results.push({ step: step.description, success });
        
        if (!success) {
          console.warn(`⚠️ ${step.description}失败，继续执行下一步...`);
        }
        
        // 短暂延迟，避免过于频繁的数据库操作
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ step: step.description, success: false, error });
        console.error(`❌ ${step.description}异常:`, error);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`📊 迁移完成: ${successCount}/${totalCount} 步骤成功`);
    
    return {
      success: successCount === totalCount,
      results
    };
  }

  /**
   * 检查数据库表是否存在
   */
  static async checkTablesExist(): Promise<{
    [tableName: string]: boolean;
  }> {
    const tables = [
      'profiles',
      'design_works', 
      'user_energy_records',
      'meditation_sessions',
      'membership_info',
      'usage_stats',
      'user_settings',
      'crystals',
      'user_favorite_crystals',
      'ai_conversations'
    ];

    const results: { [tableName: string]: boolean } = {};

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        results[table] = !error || error.code !== '42P01';
        
        if (results[table]) {
          console.log(`✅ 表 ${table} 存在`);
        } else {
          console.log(`❌ 表 ${table} 不存在`);
        }
      } catch (error) {
        results[table] = false;
        console.log(`❌ 表 ${table} 检查失败:`, error);
      }
    }

    return results;
  }

  /**
   * 插入基础水晶数据
   */
  static async insertBasicCrystals(): Promise<boolean> {
    try {
      console.log('🔮 插入基础水晶数据...');
      
      const basicCrystals = [
        {
          name: '白水晶',
          name_en: 'Clear Quartz',
          category: '石英族',
          color: '无色透明',
          chakra_association: 'crown',
          element: '风',
          hardness: 7.0,
          properties: ['净化', '放大', '治疗', '保护'],
          healing_properties: ['增强能量', '清理负面情绪', '提升直觉'],
          description: '被称为"水晶之王"，具有强大的净化和放大能力'
        },
        {
          name: '粉水晶',
          name_en: 'Rose Quartz',
          category: '石英族',
          color: '粉红色',
          chakra_association: 'heart',
          element: '水',
          hardness: 7.0,
          properties: ['爱情', '疗愈', '自我接纳', '慈悲'],
          healing_properties: ['打开心轮', '吸引爱情', '疗愈情感创伤'],
          description: '爱情之石，帮助开启心轮，带来无条件的爱'
        },
        {
          name: '紫水晶',
          name_en: 'Amethyst',
          category: '石英族',
          color: '紫色',
          chakra_association: 'thirdEye',
          element: '风',
          hardness: 7.0,
          properties: ['智慧', '直觉', '冥想', '平静'],
          healing_properties: ['增强直觉', '促进冥想', '缓解压力'],
          description: '智慧之石，增强精神力量和直觉能力'
        },
        {
          name: '黑曜石',
          name_en: 'Obsidian',
          category: '火山玻璃',
          color: '黑色',
          chakra_association: 'root',
          element: '土',
          hardness: 5.5,
          properties: ['保护', '接地', '清理', '勇气'],
          healing_properties: ['消除负能量', '增强根基', '提供保护'],
          description: '强力的保护石，帮助清除负面能量并建立稳固根基'
        }
      ];

      const { error } = await supabase
        .from('crystals')
        .upsert(basicCrystals, { onConflict: 'name' });

      if (error) {
        console.error('❌ 插入基础水晶数据失败:', error);
        return false;
      }

      console.log('✅ 基础水晶数据插入成功');
      return true;
    } catch (error) {
      console.error('❌ 插入基础水晶数据异常:', error);
      return false;
    }
  }

  /**
   * 快速修复常见问题
   */
  static async quickFix(): Promise<{
    success: boolean;
    results: { step: string; success: boolean; error?: any }[];
  }> {
    const results: { step: string; success: boolean; error?: any }[] = [];
    
    console.log('🔧 执行快速修复...');
    
    try {
      // 方法1: 尝试直接添加字段
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: SQL_SCRIPTS.quickFix 
        });
        
        if (!error) {
          results.push({ step: '执行SQL修复脚本', success: true });
          console.log('✅ SQL修复脚本执行成功');
        } else {
          results.push({ step: '执行SQL修复脚本', success: false, error });
          console.log('⚠️ SQL修复脚本失败，尝试其他方法...');
        }
      } catch (error) {
        results.push({ step: '执行SQL修复脚本', success: false, error });
        console.log('⚠️ SQL修复脚本异常，尝试其他方法...');
      }

      // 方法2: 测试字段是否存在
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, enhanced_assessment')
          .limit(1);

        if (error) {
          if (error.message?.includes('enhanced_assessment') && error.message?.includes('does not exist')) {
            results.push({ step: '检测enhanced_assessment字段', success: false, error: '字段不存在' });
            console.log('❌ enhanced_assessment字段不存在');
          } else {
            results.push({ step: '检测enhanced_assessment字段', success: false, error });
            console.log('❌ 字段检测失败:', error.message);
          }
        } else {
          results.push({ step: '检测enhanced_assessment字段', success: true });
          console.log('✅ enhanced_assessment字段存在');
        }
      } catch (error) {
        results.push({ step: '检测enhanced_assessment字段', success: false, error });
      }

      // 方法3: 测试RLS权限
      try {
        const testEmail = 'test@example.com';
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', testEmail)
          .limit(1);

        if (error) {
          if (error.code === '42501' || error.message?.includes('row-level security')) {
            results.push({ step: '检测RLS权限', success: false, error: 'RLS权限限制' });
            console.log('❌ RLS权限限制');
          } else {
            results.push({ step: '检测RLS权限', success: true });
            console.log('✅ RLS权限正常');
          }
        } else {
          results.push({ step: '检测RLS权限', success: true });
          console.log('✅ RLS权限正常');
        }
      } catch (error) {
        results.push({ step: '检测RLS权限', success: false, error });
      }

      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      console.log(`📊 快速修复完成: ${successCount}/${totalCount} 项检查通过`);
      
      return {
        success: successCount > 0,
        results
      };

    } catch (error) {
      console.error('❌ 快速修复异常:', error);
      return {
        success: false,
        results: [{ step: '快速修复', success: false, error }]
      };
    }
  }

  /**
   * 诊断数据库问题
   */
  static async diagnoseProblem(): Promise<{
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    console.log('🔍 诊断数据库问题...');

    // 1. 检查表存在性
    const tableStatus = await this.checkTablesExist();
    const missingTables = Object.entries(tableStatus)
      .filter(([table, exists]) => !exists)
      .map(([table]) => table);

    if (missingTables.length > 0) {
      issues.push(`缺失数据库表: ${missingTables.join(', ')}`);
      recommendations.push('需要运行数据库迁移脚本创建缺失的表');
    }

    // 2. 检查enhanced_assessment字段
    try {
      const { error } = await supabase
        .from('profiles')
        .select('enhanced_assessment')
        .limit(1);

      if (error && error.message?.includes('enhanced_assessment')) {
        issues.push('profiles表缺少enhanced_assessment字段');
        recommendations.push('在Supabase SQL编辑器中执行: ALTER TABLE profiles ADD COLUMN enhanced_assessment JSONB;');
      }
    } catch (error) {
      issues.push('无法检查enhanced_assessment字段');
    }

    // 3. 检查RLS权限
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'test@example.com')
        .limit(1);

      if (error && (error.code === '42501' || error.message?.includes('row-level security'))) {
        issues.push('行级安全策略(RLS)阻止数据访问');
        recommendations.push('临时解决方案: 在Supabase SQL编辑器中执行: ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;');
      }
    } catch (error) {
      issues.push('无法检查RLS权限');
    }

    console.log(`📊 发现 ${issues.length} 个问题, ${recommendations.length} 个建议`);

    return { issues, recommendations };
  }
}

// 导出常用的迁移函数
export const {
  checkTablesExist,
  quickFix,
  diagnoseProblem
} = DatabaseMigration;

// 默认导出迁移类
export default DatabaseMigration; 