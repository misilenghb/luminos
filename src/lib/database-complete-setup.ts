import { supabase } from './supabase';

/**
 * 水晶日历系统 - 完整数据库补全脚本
 * 这个脚本将创建所有必要的函数、表格、索引和基础数据
 * 适用于系统上线前的最终数据库准备
 */

export class DatabaseCompleteSetup {
  
  /**
   * 执行完整的数据库补全
   */
  static async executeCompleteSetup(): Promise<{
    success: boolean;
    results: { step: string; success: boolean; error?: any }[];
  }> {
    const results: { step: string; success: boolean; error?: any }[] = [];
    
    console.log('🚀 开始执行完整数据库补全...');
    
    // 步骤1: 创建必要的数据库函数
    const step1 = await this.createDatabaseFunctions();
    results.push({ step: '创建数据库函数', success: step1.success, error: step1.error });
    
    // 步骤2: 创建所有表格
    const step2 = await this.createAllTables();
    results.push({ step: '创建所有表格', success: step2.success, error: step2.error });
    
    // 步骤3: 添加缺失字段
    const step3 = await this.addMissingColumns();
    results.push({ step: '添加缺失字段', success: step3.success, error: step3.error });
    
    // 步骤4: 创建索引
    const step4 = await this.createIndexes();
    results.push({ step: '创建索引', success: step4.success, error: step4.error });
    
    // 步骤5: 建立外键关联
    const step5 = await this.createForeignKeys();
    results.push({ step: '建立外键关联', success: step5.success, error: step5.error });
    
    // 步骤6: 设置权限策略
    const step6 = await this.setupPermissions();
    results.push({ step: '设置权限策略', success: step6.success, error: step6.error });
    
    // 步骤7: 插入基础数据
    const step7 = await this.insertBasicData();
    results.push({ step: '插入基础数据', success: step7.success, error: step7.error });
    
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`📊 数据库补全完成: ${successCount}/${totalCount} 步骤成功`);
    
    return {
      success: successCount === totalCount,
      results
    };
  }
  
  /**
   * 步骤1: 创建必要的数据库函数
   */
  private static async createDatabaseFunctions(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🔧 创建数据库函数...');
      
      const sql = `
        -- 1. 创建 exec_sql 函数，用于执行动态SQL
        CREATE OR REPLACE FUNCTION public.exec_sql(sql TEXT)
        RETURNS TEXT
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
          RETURN 'SUCCESS';
        EXCEPTION
          WHEN OTHERS THEN
            RETURN 'ERROR: ' || SQLERRM;
        END;
        $$;

        -- 2. 创建 check_foreign_key_exists 函数，用于检查外键约束
        CREATE OR REPLACE FUNCTION public.check_foreign_key_exists(
          constraint_name TEXT,
          table_name TEXT
        )
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          exists_count INTEGER;
        BEGIN
          SELECT COUNT(*)
          INTO exists_count
          FROM information_schema.table_constraints
          WHERE constraint_type = 'FOREIGN KEY'
            AND constraint_name = check_foreign_key_exists.constraint_name
            AND table_name = check_foreign_key_exists.table_name;
          
          RETURN exists_count > 0;
        END;
        $$;

        -- 3. 创建 check_table_exists 函数，用于检查表是否存在
        CREATE OR REPLACE FUNCTION public.check_table_exists(table_name TEXT)
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          exists_count INTEGER;
        BEGIN
          SELECT COUNT(*)
          INTO exists_count
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = check_table_exists.table_name;
          
          RETURN exists_count > 0;
        END;
        $$;

        -- 4. 创建 check_column_exists 函数，用于检查字段是否存在
        CREATE OR REPLACE FUNCTION public.check_column_exists(
          table_name TEXT,
          column_name TEXT
        )
        RETURNS BOOLEAN
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          exists_count INTEGER;
        BEGIN
          SELECT COUNT(*)
          INTO exists_count
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = check_column_exists.table_name
            AND column_name = check_column_exists.column_name;
          
          RETURN exists_count > 0;
        END;
        $$;

        -- 5. 创建自动更新 updated_at 字段的函数
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `;
      
      // 直接使用 Supabase 的 SQL 执行
      const { error } = await supabase.rpc('query', { query: sql });
      
      if (error) {
        console.error('❌ 创建数据库函数失败:', error);
        return { success: false, error };
      }
      
      console.log('✅ 数据库函数创建成功');
      return { success: true };
      
    } catch (error) {
      console.error('❌ 创建数据库函数异常:', error);
      return { success: false, error };
    }
  }
  
  /**
   * 步骤2: 创建所有表格
   */
  private static async createAllTables(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📋 创建所有表格...');
      
      const tables = [
        {
          name: 'profiles',
          sql: `
            CREATE TABLE IF NOT EXISTS profiles (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID,
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
          `
        },
        {
          name: 'design_works',
          sql: `
            CREATE TABLE IF NOT EXISTS design_works (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID,
              profile_id UUID,
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
          `
        },
        {
          name: 'user_energy_records',
          sql: `
            CREATE TABLE IF NOT EXISTS user_energy_records (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID,
              profile_id UUID,
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
          `
        },
        {
          name: 'meditation_sessions',
          sql: `
            CREATE TABLE IF NOT EXISTS meditation_sessions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID,
              profile_id UUID,
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
          `
        },
        {
          name: 'membership_info',
          sql: `
            CREATE TABLE IF NOT EXISTS membership_info (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID UNIQUE,
              profile_id UUID,
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
          `
        },
        {
          name: 'usage_stats',
          sql: `
            CREATE TABLE IF NOT EXISTS usage_stats (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID,
              profile_id UUID,
              month DATE NOT NULL,
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
          `
        },
        {
          name: 'user_settings',
          sql: `
            CREATE TABLE IF NOT EXISTS user_settings (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID UNIQUE,
              profile_id UUID,
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
          `
        },
        {
          name: 'crystals',
          sql: `
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
          `
        },
        {
          name: 'user_favorite_crystals',
          sql: `
            CREATE TABLE IF NOT EXISTS user_favorite_crystals (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID,
              profile_id UUID,
              crystal_id UUID,
              notes TEXT,
              personal_experience TEXT,
              effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              UNIQUE(user_id, crystal_id)
            );
          `
        },
        {
          name: 'ai_conversations',
          sql: `
            CREATE TABLE IF NOT EXISTS ai_conversations (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID,
              profile_id UUID,
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
          `
        }
      ];
      
      let successCount = 0;
      
      for (const table of tables) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: table.sql });
          
          if (error) {
            console.error(`❌ 创建表 ${table.name} 失败:`, error);
          } else {
            console.log(`✅ 表 ${table.name} 创建成功`);
            successCount++;
          }
        } catch (error) {
          console.error(`❌ 创建表 ${table.name} 异常:`, error);
        }
      }
      
      console.log(`📊 表格创建完成: ${successCount}/${tables.length} 个表格成功`);
      
      return { 
        success: successCount === tables.length,
        error: successCount < tables.length ? `只有 ${successCount}/${tables.length} 个表格创建成功` : undefined
      };
      
    } catch (error) {
      console.error('❌ 创建表格异常:', error);
      return { success: false, error };
    }
  }
  
  /**
   * 步骤3: 添加缺失字段
   */
  private static async addMissingColumns(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🔧 添加缺失字段...');
      
      const sql = `
        -- 确保 profiles 表有所有必要字段
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enhanced_assessment JSONB DEFAULT '{}';
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'zh';
        
        -- 为所有表添加更新时间触发器
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
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error('❌ 添加字段失败:', error);
        return { success: false, error };
      }
      
      console.log('✅ 字段添加成功');
      return { success: true };
      
    } catch (error) {
      console.error('❌ 添加字段异常:', error);
      return { success: false, error };
    }
  }
  
  /**
   * 步骤4: 创建索引
   */
  private static async createIndexes(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('📋 创建索引...');
      
      const sql = `
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
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error('❌ 创建索引失败:', error);
        return { success: false, error };
      }
      
      console.log('✅ 索引创建成功');
      return { success: true };
      
    } catch (error) {
      console.error('❌ 创建索引异常:', error);
      return { success: false, error };
    }
  }
  
  /**
   * 步骤5: 建立外键关联
   */
  private static async createForeignKeys(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🔗 建立外键关联...');
      
      const sql = `
        -- profiles 表外键
        ALTER TABLE profiles 
        ADD CONSTRAINT IF NOT EXISTS fk_profiles_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

        -- design_works 表外键
        ALTER TABLE design_works 
        ADD CONSTRAINT IF NOT EXISTS fk_design_works_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        ALTER TABLE design_works 
        ADD CONSTRAINT IF NOT EXISTS fk_design_works_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

        -- user_energy_records 表外键
        ALTER TABLE user_energy_records 
        ADD CONSTRAINT IF NOT EXISTS fk_energy_records_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        ALTER TABLE user_energy_records 
        ADD CONSTRAINT IF NOT EXISTS fk_energy_records_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

        -- meditation_sessions 表外键
        ALTER TABLE meditation_sessions 
        ADD CONSTRAINT IF NOT EXISTS fk_meditation_sessions_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        ALTER TABLE meditation_sessions 
        ADD CONSTRAINT IF NOT EXISTS fk_meditation_sessions_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

        -- membership_info 表外键
        ALTER TABLE membership_info 
        ADD CONSTRAINT IF NOT EXISTS fk_membership_info_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        ALTER TABLE membership_info 
        ADD CONSTRAINT IF NOT EXISTS fk_membership_info_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

        -- usage_stats 表外键
        ALTER TABLE usage_stats 
        ADD CONSTRAINT IF NOT EXISTS fk_usage_stats_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        ALTER TABLE usage_stats 
        ADD CONSTRAINT IF NOT EXISTS fk_usage_stats_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

        -- user_settings 表外键
        ALTER TABLE user_settings 
        ADD CONSTRAINT IF NOT EXISTS fk_user_settings_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        ALTER TABLE user_settings 
        ADD CONSTRAINT IF NOT EXISTS fk_user_settings_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

        -- user_favorite_crystals 表外键
        ALTER TABLE user_favorite_crystals 
        ADD CONSTRAINT IF NOT EXISTS fk_favorite_crystals_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        ALTER TABLE user_favorite_crystals 
        ADD CONSTRAINT IF NOT EXISTS fk_favorite_crystals_crystal_id 
        FOREIGN KEY (crystal_id) REFERENCES crystals(id) ON DELETE CASCADE;

        -- ai_conversations 表外键
        ALTER TABLE ai_conversations 
        ADD CONSTRAINT IF NOT EXISTS fk_ai_conversations_user_id 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        ALTER TABLE ai_conversations 
        ADD CONSTRAINT IF NOT EXISTS fk_ai_conversations_profile_id 
        FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error('❌ 建立外键关联失败:', error);
        return { success: false, error };
      }
      
      console.log('✅ 外键关联建立成功');
      return { success: true };
      
    } catch (error) {
      console.error('❌ 建立外键关联异常:', error);
      return { success: false, error };
    }
  }
  
  /**
   * 步骤6: 设置权限策略
   */
  private static async setupPermissions(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('🔐 设置权限策略...');
      
      const sql = `
        -- 启用行级安全（对于需要保护的表）
        ALTER TABLE design_works ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_energy_records ENABLE ROW LEVEL SECURITY;
        ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE membership_info ENABLE ROW LEVEL SECURITY;
        ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_favorite_crystals ENABLE ROW LEVEL SECURITY;
        ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

        -- profiles 表策略（暂时禁用RLS，允许系统正常运行）
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

        -- crystals 表策略（公开只读）
        ALTER TABLE crystals DISABLE ROW LEVEL SECURITY;

        -- 为需要RLS的表创建基本策略
        DROP POLICY IF EXISTS "Users can manage their own designs" ON design_works;
        CREATE POLICY "Users can manage their own designs" ON design_works
          FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own energy records" ON user_energy_records;
        CREATE POLICY "Users can manage their own energy records" ON user_energy_records
          FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own meditation sessions" ON meditation_sessions;
        CREATE POLICY "Users can manage their own meditation sessions" ON meditation_sessions
          FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own membership info" ON membership_info;
        CREATE POLICY "Users can manage their own membership info" ON membership_info
          FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own usage stats" ON usage_stats;
        CREATE POLICY "Users can manage their own usage stats" ON usage_stats
          FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
        CREATE POLICY "Users can manage their own settings" ON user_settings
          FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own favorite crystals" ON user_favorite_crystals;
        CREATE POLICY "Users can manage their own favorite crystals" ON user_favorite_crystals
          FOR ALL USING (auth.uid() = user_id);

        DROP POLICY IF EXISTS "Users can manage their own conversations" ON ai_conversations;
        CREATE POLICY "Users can manage their own conversations" ON ai_conversations
          FOR ALL USING (auth.uid() = user_id);
      `;
      
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error('❌ 设置权限策略失败:', error);
        return { success: false, error };
      }
      
      console.log('✅ 权限策略设置成功');
      return { success: true };
      
    } catch (error) {
      console.error('❌ 设置权限策略异常:', error);
      return { success: false, error };
    }
  }
  
  /**
   * 步骤7: 插入基础数据
   */
  private static async insertBasicData(): Promise<{ success: boolean; error?: any }> {
    try {
      console.log('💎 插入基础水晶数据...');
      
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
        },
        {
          name: '黄水晶',
          name_en: 'Citrine',
          category: '石英族',
          color: '黄色',
          chakra_association: 'solarPlexus',
          element: '火',
          hardness: 7.0,
          properties: ['财富', '自信', '创造力', '成功'],
          healing_properties: ['增强自信', '吸引财富', '激发创造力'],
          description: '财富之石，带来成功和繁荣，激发个人力量'
        },
        {
          name: '绿幽灵',
          name_en: 'Green Phantom Quartz',
          category: '石英族',
          color: '绿色',
          chakra_association: 'heart',
          element: '木',
          hardness: 7.0,
          properties: ['事业', '财富', '成长', '机遇'],
          healing_properties: ['促进事业发展', '吸引正财', '增强领导力'],
          description: '事业运之石，有助于事业发展和财富积累'
        }
      ];

      const { error } = await supabase
        .from('crystals')
        .upsert(basicCrystals, { onConflict: 'name' });

      if (error) {
        console.error('❌ 插入基础水晶数据失败:', error);
        return { success: false, error };
      }

      console.log('✅ 基础水晶数据插入成功');
      return { success: true };
      
    } catch (error) {
      console.error('❌ 插入基础数据异常:', error);
      return { success: false, error };
    }
  }
}

export default DatabaseCompleteSetup; 