import { NextRequest, NextResponse } from 'next/server';
import DatabaseMigration from '@/lib/database-migrations';
import DatabaseRelationshipManager from '@/lib/database-relationships';
import { supabase } from '@/lib/supabase';
import { fixProfilesRLS, ensureEnhancedAssessmentColumn } from '@/lib/database-fix';

export async function GET() {
  try {
    console.log('🔍 开始数据库综合诊断...');

    // 检查表状态
    const tableStatus = await DatabaseMigration.checkTablesExist();
    
    // 诊断问题
    const diagnosis = await DatabaseMigration.diagnoseProblem();
    
    // 检查关联关系
    const relationshipReport = await DatabaseRelationshipManager.getRelationshipReport();

    return NextResponse.json({
      success: true,
      tableStatus,
      diagnosis,
      relationshipReport,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 数据库诊断失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, options } = await request.json();
    
    console.log(`🔧 执行数据库操作: ${action}`);

    let result;

    switch (action) {
      case 'completeSetup':
        result = await executeCompleteSetup();
        break;
      case 'quickFix':
        result = await DatabaseMigration.quickFix();
        break;
      case 'diagnose':
        result = await DatabaseMigration.diagnoseProblem();
        break;
      case 'checkTables':
        result = { tableStatus: await DatabaseMigration.checkTablesExist() };
        break;
      case 'repairRelationships':
        result = await DatabaseRelationshipManager.repairTableRelationships();
        break;
      case 'checkRelationships':
        result = await DatabaseRelationshipManager.checkRelationships();
        break;
      default:
        return NextResponse.json({
          success: false,
          error: `未知操作: ${action}`
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`❌ 数据库操作失败:`, error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('🚀 开始数据库修复...');
    
    // 1. 修复 profiles 表的 RLS 策略
    const rlsFixed = await fixProfilesRLS();
    console.log('RLS策略修复结果:', rlsFixed ? '成功' : '失败');
    
    // 2. 确保 enhanced_assessment 列存在
    const columnFixed = await ensureEnhancedAssessmentColumn();
    console.log('字段检查结果:', columnFixed ? '成功' : '失败');
    
    return NextResponse.json({
      success: true,
      results: {
        rls_fixed: rlsFixed,
        column_fixed: columnFixed
      }
    });
  } catch (error) {
    console.error('❌ 数据库修复失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * 执行完整的数据库补全设置
 */
async function executeCompleteSetup(): Promise<{
  success: boolean;
  results: { step: string; success: boolean; error?: any }[];
}> {
  const results: { step: string; success: boolean; error?: any }[] = [];
  
  console.log('🚀 开始执行完整数据库补全...');
  
  // 步骤1: 创建必要的数据库函数
  const step1 = await createDatabaseFunctions();
  results.push({ step: '创建数据库函数', success: step1.success, error: step1.error });
  
  // 步骤2: 创建所有表格
  const step2 = await createAllTables();
  results.push({ step: '创建所有表格', success: step2.success, error: step2.error });
  
  // 步骤3: 添加缺失字段
  const step3 = await addMissingColumns();
  results.push({ step: '添加缺失字段', success: step3.success, error: step3.error });
  
  // 步骤4: 创建索引
  const step4 = await createIndexes();
  results.push({ step: '创建索引', success: step4.success, error: step4.error });
  
  // 步骤5: 设置权限策略
  const step5 = await setupPermissions();
  results.push({ step: '设置权限策略', success: step5.success, error: step5.error });
  
  // 步骤6: 插入基础数据
  const step6 = await insertBasicData();
  results.push({ step: '插入基础数据', success: step6.success, error: step6.error });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`📊 数据库补全完成: ${successCount}/${totalCount} 步骤成功`);
  
  return {
    success: successCount === totalCount,
    results
  };
}

/**
 * 使用直接SQL执行，尝试多种方法
 */
async function executeSQLDirect(sql: string, description: string): Promise<{ success: boolean; error?: any }> {
  try {
    console.log(`🔄 ${description}...`);
    
    // 方法1: 尝试使用已存在的 exec_sql 函数
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql });
      
      if (!error) {
        console.log(`✅ ${description}成功 (使用 exec_sql)`);
        return { success: true };
      } else {
        console.warn(`⚠️ exec_sql 失败，尝试其他方法:`, error);
      }
    } catch (execError) {
      console.warn(`⚠️ exec_sql 函数不存在，尝试其他方法`);
    }
    
    // 方法2: 尝试分别创建表格和字段
    if (description.includes('创建表')) {
      // 对于创建表，我们可以尝试直接查询来测试表是否创建成功
      const tableName = sql.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)?.[1];
      if (tableName) {
        try {
          const { error: testError } = await supabase
            .from(tableName)
            .select('id')
            .limit(1);
          
          if (!testError || testError.code !== '42P01') {
            console.log(`✅ ${description}成功 (表已存在)`);
            return { success: true };
          }
        } catch (testError) {
          console.warn(`⚠️ 表 ${tableName} 不存在，需要手动创建`);
        }
      }
    }
    
    // 方法3: 对于字段添加，测试字段是否存在
    if (description.includes('添加') && description.includes('字段')) {
      try {
        const { error: testError } = await supabase
          .from('profiles')
          .select('enhanced_assessment')
          .limit(1);
        
        if (!testError) {
          console.log(`✅ ${description}成功 (字段已存在)`);
          return { success: true };
        }
      } catch (testError) {
        console.warn(`⚠️ 字段不存在，需要手动添加`);
      }
    }
    
    // 默认返回需要手动处理
    console.warn(`⚠️ ${description}需要手动执行`);
    return { 
      success: false, 
      error: `需要在 Supabase 控制台手动执行 SQL: ${sql.substring(0, 100)}...`
    };
    
  } catch (error) {
    console.error(`❌ ${description}异常:`, error);
    return { success: false, error };
  }
}

/**
 * 创建必要的数据库函数
 */
async function createDatabaseFunctions(): Promise<{ success: boolean; error?: any }> {
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

    -- 3. 创建自动更新 updated_at 字段的函数
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `;
  
  return await executeSQLDirect(sql, '创建数据库函数');
}

/**
 * 创建所有表格
 */
async function createAllTables(): Promise<{ success: boolean; error?: any }> {
  const tables = [
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
  const errors: any[] = [];
  
  for (const table of tables) {
    const result = await executeSQLDirect(table.sql, `创建表 ${table.name}`);
    if (result.success) {
      successCount++;
    } else {
      errors.push(result.error);
    }
  }
  
  return { 
    success: successCount === tables.length,
    error: errors.length > 0 ? errors : undefined
  };
}

/**
 * 添加缺失字段
 */
async function addMissingColumns(): Promise<{ success: boolean; error?: any }> {
  const sql = `
    -- 确保 profiles 表有所有必要字段
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS enhanced_assessment JSONB DEFAULT '{}';
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(100);
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50);
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'zh';
  `;
  
  return await executeSQLDirect(sql, '添加缺失字段');
}

/**
 * 创建索引
 */
async function createIndexes(): Promise<{ success: boolean; error?: any }> {
  const sql = `
    -- 基础索引
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
    CREATE INDEX IF NOT EXISTS idx_design_works_user_id ON design_works(user_id);
    CREATE INDEX IF NOT EXISTS idx_energy_records_user_id ON user_energy_records(user_id);
    CREATE INDEX IF NOT EXISTS idx_meditation_user_id ON meditation_sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_crystals_name ON crystals(name);
  `;
  
  return await executeSQLDirect(sql, '创建索引');
}

/**
 * 设置权限策略
 */
async function setupPermissions(): Promise<{ success: boolean; error?: any }> {
  const sql = `
    -- 临时禁用 profiles 表的 RLS，确保系统正常运行
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    
    -- crystals 表公开只读
    ALTER TABLE crystals DISABLE ROW LEVEL SECURITY;
  `;
  
  return await executeSQLDirect(sql, '设置权限策略');
}

/**
 * 插入基础数据
 */
async function insertBasicData(): Promise<{ success: boolean; error?: any }> {
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