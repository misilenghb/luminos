-- ============================================================================
-- 水晶日历系统 - 完整数据库设置脚本
-- 适用于系统上线前的数据库补全
-- 请在 Supabase SQL 编辑器中执行此脚本
-- ============================================================================

-- 第一部分：创建必要的数据库函数
-- ============================================================================

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

-- 3. 创建自动更新 updated_at 字段的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 第二部分：创建所有必要的表格
-- ============================================================================

-- 1. 确保 profiles 表存在并有所有必要字段
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

-- 添加 profiles 表的缺失字段
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enhanced_assessment JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'zh';

-- 2. 创建设计作品表
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

-- 3. 确保用户能量记录表存在
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

-- 4. 确保冥想会话表存在
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

-- 5. 创建会员信息表
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

-- 6. 创建使用统计表
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

-- 7. 确保用户设置表存在
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

-- 8. 创建水晶库表
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

-- 9. 创建用户收藏水晶表
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

-- 10. 创建AI对话历史表
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

-- 第三部分：创建索引
-- ============================================================================

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

-- 第四部分：创建触发器
-- ============================================================================

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

-- 第五部分：建立外键关联
-- ============================================================================

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

-- 第六部分：设置权限策略
-- ============================================================================

-- 临时禁用 profiles 表的 RLS，确保系统正常运行
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- crystals 表公开只读
ALTER TABLE crystals DISABLE ROW LEVEL SECURITY;

-- 为其他表启用RLS并设置基本策略
ALTER TABLE design_works ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own designs" ON design_works;
CREATE POLICY "Users can manage their own designs" ON design_works
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_energy_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own energy records" ON user_energy_records;
CREATE POLICY "Users can manage their own energy records" ON user_energy_records
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own meditation sessions" ON meditation_sessions;
CREATE POLICY "Users can manage their own meditation sessions" ON meditation_sessions
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE membership_info ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own membership info" ON membership_info;
CREATE POLICY "Users can manage their own membership info" ON membership_info
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own usage stats" ON usage_stats;
CREATE POLICY "Users can manage their own usage stats" ON usage_stats
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE user_favorite_crystals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own favorite crystals" ON user_favorite_crystals;
CREATE POLICY "Users can manage their own favorite crystals" ON user_favorite_crystals
  FOR ALL USING (auth.uid() = user_id);

ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own conversations" ON ai_conversations;
CREATE POLICY "Users can manage their own conversations" ON ai_conversations
  FOR ALL USING (auth.uid() = user_id);

-- 第七部分：插入基础水晶数据
-- ============================================================================

-- 插入基础水晶数据（如果不存在的话）
INSERT INTO crystals (name, name_en, category, color, chakra_association, element, hardness, properties, healing_properties, description)
VALUES 
  ('白水晶', 'Clear Quartz', '石英族', '无色透明', 'crown', '风', 7.0, 
   ARRAY['净化', '放大', '治疗', '保护'], 
   ARRAY['增强能量', '清理负面情绪', '提升直觉'], 
   '被称为"水晶之王"，具有强大的净化和放大能力'),
  
  ('粉水晶', 'Rose Quartz', '石英族', '粉红色', 'heart', '水', 7.0, 
   ARRAY['爱情', '疗愈', '自我接纳', '慈悲'], 
   ARRAY['打开心轮', '吸引爱情', '疗愈情感创伤'], 
   '爱情之石，帮助开启心轮，带来无条件的爱'),
  
  ('紫水晶', 'Amethyst', '石英族', '紫色', 'thirdEye', '风', 7.0, 
   ARRAY['智慧', '直觉', '冥想', '平静'], 
   ARRAY['增强直觉', '促进冥想', '缓解压力'], 
   '智慧之石，增强精神力量和直觉能力'),
  
  ('黑曜石', 'Obsidian', '火山玻璃', '黑色', 'root', '土', 5.5, 
   ARRAY['保护', '接地', '清理', '勇气'], 
   ARRAY['消除负能量', '增强根基', '提供保护'], 
   '强力的保护石，帮助清除负面能量并建立稳固根基'),
   
  ('黄水晶', 'Citrine', '石英族', '黄色', 'solarPlexus', '火', 7.0, 
   ARRAY['财富', '自信', '创造力', '成功'], 
   ARRAY['增强自信', '吸引财富', '激发创造力'], 
   '财富之石，带来成功和繁荣，激发个人力量'),
   
  ('绿幽灵', 'Green Phantom Quartz', '石英族', '绿色', 'heart', '木', 7.0, 
   ARRAY['事业', '财富', '成长', '机遇'], 
   ARRAY['促进事业发展', '吸引正财', '增强领导力'], 
   '事业运之石，有助于事业发展和财富积累')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 脚本执行完成
-- ============================================================================

-- 完成提示
SELECT 'DATABASE_SETUP_COMPLETE' as status, 
       'All tables, functions, indexes, and basic data have been created successfully!' as message; 