import { supabase } from './supabase';

/**
 * 数据库结构修复脚本
 * 确保数据库表结构与代码期望的结构一致
 */

// 修复 profiles 表的 RLS 策略
export const fixProfilesRLS = async () => {
  try {
    console.log('🔧 修复 profiles 表的 RLS 策略...');
    
    const sql = `
      -- 1. 临时禁用 RLS 以确保我们可以修改策略
      ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

      -- 2. 删除现有的策略
      DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;
      DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
      DROP POLICY IF EXISTS "Service role can manage all profiles" ON profiles;

      -- 3. 创建新的多层策略
      -- 允许服务角色管理所有档案
      CREATE POLICY "Service role can manage all profiles" ON profiles
        FOR ALL USING (
          current_user = 'postgres' OR
          current_user = 'service_role'
        );

      -- 允许用户管理自己的档案（通过 user_id 或 email）
      CREATE POLICY "Users can manage their own profiles" ON profiles
        FOR ALL USING (
          auth.uid() = user_id OR 
          email = auth.jwt() ->> 'email'
        );

      -- 允许公开查看档案（如果需要的话）
      CREATE POLICY "Public profiles are viewable" ON profiles
        FOR SELECT USING (true);

      -- 4. 重新启用 RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ 修复 RLS 策略失败:', {
        message: error.message || '未知错误',
        code: error.code || '无错误代码',
        details: error.details || '无详细信息',
        hint: error.hint || '无提示信息'
      });
      return false;
    }
    
    console.log('✅ RLS 策略修复成功');
    return true;
  } catch (error) {
    console.error('❌ 修复 RLS 策略异常:', error);
    return false;
  }
};

export const ensureEnhancedAssessmentColumn = async () => {
  try {
    console.log('🔧 检查并修复数据库结构...');
    
    // 检查 enhanced_assessment 列是否存在
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' });
    
    if (columnError) {
      console.warn('⚠️ 无法检查数据库列结构，可能是权限问题:', columnError.message);
      return false;
    }
    
    const hasEnhancedAssessment = columns?.some((col: any) => col.column_name === 'enhanced_assessment');
    
    if (!hasEnhancedAssessment) {
      console.log('🔨 添加 enhanced_assessment 列到 profiles 表...');
      
      // 尝试添加列（这可能需要管理员权限）
      const { error: alterError } = await supabase
        .rpc('add_enhanced_assessment_column');
      
      if (alterError) {
        console.warn('⚠️ 无法自动添加数据库列，请手动执行以下SQL:', alterError.message);
        console.log(`
          ALTER TABLE profiles 
          ADD COLUMN IF NOT EXISTS enhanced_assessment JSONB;
        `);
        return false;
      }
      
      console.log('✅ enhanced_assessment 列添加成功');
    } else {
      console.log('✅ enhanced_assessment 列已存在');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 数据库结构检查失败:', error);
    return false;
  }
};

/**
 * 检查用户档案完整性
 */
export const checkUserProfileIntegrity = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, enhanced_assessment')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('档案完整性检查失败:', error);
      return null;
    }
    
    return {
      exists: !!data,
      hasEnhancedAssessment: !!data?.enhanced_assessment,
      profileId: data?.id
    };
  } catch (error) {
    console.error('档案完整性检查异常:', error);
    return null;
  }
};

/**
 * 修复 design_works 表的 RLS 策略
 */
export const fixDesignWorksRLS = async () => {
  try {
    console.log('🔧 修复 design_works 表的 RLS 策略...');
    
    const sql = `
      -- 0. 确保design_works表有is_public字段
      ALTER TABLE design_works ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
      
      -- 1. 临时禁用 RLS 以确保我们可以修改策略
      ALTER TABLE design_works DISABLE ROW LEVEL SECURITY;

      -- 2. 删除现有的策略
      DROP POLICY IF EXISTS "Users can manage their own designs" ON design_works;
      DROP POLICY IF EXISTS "Public designs are viewable" ON design_works;
      DROP POLICY IF EXISTS "Service role can manage all designs" ON design_works;

      -- 3. 创建新的多层策略
      -- 允许服务角色管理所有设计
      CREATE POLICY "Service role can manage all designs" ON design_works
        FOR ALL USING (
          current_user = 'postgres' OR
          current_user = 'service_role'
        );

      -- 允许用户管理自己的设计
      CREATE POLICY "Users can manage their own designs" ON design_works
        FOR ALL USING (
          auth.uid() = user_id
        );

      -- 允许查看公开的设计
      CREATE POLICY "Public designs are viewable" ON design_works
        FOR SELECT USING (
          is_public = true OR 
          auth.uid() = user_id
        );

      -- 4. 重新启用 RLS
      ALTER TABLE design_works ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ 修复 design_works RLS 策略失败:', {
        message: error.message || '未知错误',
        code: error.code || '无错误代码',
        details: error.details || '无详细信息',
        hint: error.hint || '无提示信息'
      });
      return false;
    }
    
    console.log('✅ design_works RLS 策略修复成功');
    return true;
  } catch (error) {
    console.error('❌ 修复 design_works RLS 策略异常:', error);
    return false;
  }
};

// 临时禁用 design_works 表的 RLS
export const disableDesignWorksRLS = async () => {
  try {
    console.log('🔓 临时禁用 design_works 表的 RLS...');
    
    const sql = `
      ALTER TABLE design_works DISABLE ROW LEVEL SECURITY;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ 禁用 design_works RLS 失败:', {
        message: error.message || '未知错误',
        code: error.code || '无错误代码'
      });
      return false;
    }
    
    console.log('✅ design_works RLS 已临时禁用');
    return true;
  } catch (error) {
    console.error('❌ 禁用 design_works RLS 异常:', error);
    return false;
  }
};

/**
 * 临时禁用RLS策略
 * 注意：这是一个紧急措施，仅用于修复数据问题，完成后应立即重新启用RLS
 */
export const temporarilyDisableRLS = async () => {
  try {
    console.log('⚠️ 临时禁用所有表的RLS策略...');
    
    const sql = `
      -- 禁用主要表的RLS
      ALTER TABLE design_works DISABLE ROW LEVEL SECURITY;
      ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
      ALTER TABLE energy_readings DISABLE ROW LEVEL SECURITY;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ 临时禁用RLS失败:', {
        message: error.message || '未知错误',
        code: error.code || '无错误代码',
        details: error.details || '无详细信息',
        hint: error.hint || '无提示信息'
      });
      return false;
    }
    
    console.log('✅ 所有表的RLS策略已临时禁用');
    return true;
  } catch (error) {
    console.error('❌ 临时禁用RLS异常:', error);
    return false;
  }
};

/**
 * 重新启用RLS策略
 */
export const enableRLS = async () => {
  try {
    console.log('🔒 重新启用所有表的RLS策略...');
    
    const sql = `
      -- 重新启用主要表的RLS
      ALTER TABLE design_works ENABLE ROW LEVEL SECURITY;
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE energy_readings ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('❌ 重新启用RLS失败:', {
        message: error.message || '未知错误',
        code: error.code || '无错误代码',
        details: error.details || '无详细信息',
        hint: error.hint || '无提示信息'
      });
      return false;
    }
    
    console.log('✅ 所有表的RLS策略已重新启用');
    return true;
  } catch (error) {
    console.error('❌ 重新启用RLS异常:', error);
    return false;
  }
};

/**
 * 手动修复数据库的简单方法（无需RPC）
 */
export const manualDatabaseFix = {
  /**
   * 检查是否可以更新enhanced_assessment字段
   */
  async testEnhancedAssessmentUpdate(email: string) {
    try {
      // 尝试获取现有档案
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!profile) {
        console.log('❌ 未找到用户档案');
        return false;
      }
      
      // 尝试更新enhanced_assessment字段
      const { error } = await supabase
        .from('profiles')
        .update({ 
          enhanced_assessment: { test: true },
          updated_at: new Date().toISOString()
        })
        .eq('email', email);
      
      if (error) {
        console.error('❌ enhanced_assessment字段更新失败:', {
          message: error.message || '未知错误',
          code: error.code || '无错误代码',
          details: error.details || '无详细信息',
          hint: error.hint || '无提示信息',
          fullError: error
        });
        
        // 如果是字段不存在的错误
        if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          console.log(`
            📋 请在 Supabase 控制台手动执行以下 SQL:
            
            ALTER TABLE profiles 
            ADD COLUMN enhanced_assessment JSONB;
          `);
        }
        
        // 如果是行级安全策略错误
        if (error.code === '42501' || error.message?.includes('row-level security')) {
          console.log(`
            🔒 数据库行级安全策略（RLS）阻止了操作
            
            解决方案：
            1. 在 Supabase 控制台中关闭 profiles 表的 RLS：
               ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
            
            2. 或者更新 RLS 策略允许当前用户访问：
               CREATE POLICY "Allow all operations for authenticated users" 
               ON profiles FOR ALL 
               USING (true);
            
            3. 或者确保用户已正确登录并有权限访问该记录
          `);
        }
        
        return false;
      }
      
      console.log('✅ enhanced_assessment字段可以正常更新');
      return true;
    } catch (error) {
      console.error('❌ 测试更新失败:', error);
      return false;
    }
  }
};

/**
 * 测试增强评估数据保存功能
 * 检查并确保profiles表中的enhanced_assessment字段存在且可以正常更新
 */
export const testEnhancedAssessmentSaving = async (email: string): Promise<{
  success: boolean;
  hasField: boolean;
  canUpdate: boolean;
  message: string;
}> => {
  try {
    console.log('🔍 测试增强评估数据保存功能...');
    
    // 1. 检查字段是否存在
    const { data: columns, error: columnError } = await supabase
      .rpc('get_table_columns', { table_name: 'profiles' });
    
    if (columnError) {
      console.error('❌ 检查数据库列结构失败:', columnError);
      return {
        success: false,
        hasField: false,
        canUpdate: false,
        message: `检查数据库列结构失败: ${columnError.message}`
      };
    }
    
    const hasEnhancedAssessment = columns?.some((col: any) => col.column_name === 'enhanced_assessment');
    
    if (!hasEnhancedAssessment) {
      console.log('⚠️ profiles表中缺少enhanced_assessment字段');
      return {
        success: false,
        hasField: false,
        canUpdate: false,
        message: '数据库结构不完整，缺少enhanced_assessment字段'
      };
    }
    
    // 2. 尝试更新字段
    if (!email) {
      return {
        success: false,
        hasField: true,
        canUpdate: false,
        message: '未提供用户邮箱，无法测试更新功能'
      };
    }
    
    // 先获取用户档案
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (profileError) {
      console.error('❌ 获取用户档案失败:', profileError);
      return {
        success: false,
        hasField: true,
        canUpdate: false,
        message: `获取用户档案失败: ${profileError.message}`
      };
    }
    
    if (!profile) {
      return {
        success: false,
        hasField: true,
        canUpdate: false,
        message: '未找到用户档案'
      };
    }
    
    // 尝试更新字段
    const testData = {
      test: true,
      timestamp: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ enhanced_assessment: testData })
      .eq('email', email);
    
    if (updateError) {
      console.error('❌ 更新enhanced_assessment字段失败:', updateError);
      return {
        success: false,
        hasField: true,
        canUpdate: false,
        message: `更新字段失败: ${updateError.message}`
      };
    }
    
    console.log('✅ 增强评估数据保存功能测试成功');
    return {
      success: true,
      hasField: true,
      canUpdate: true,
      message: '增强评估数据保存功能正常'
    };
  } catch (error) {
    console.error('❌ 测试增强评估数据保存功能异常:', error);
    return {
      success: false,
      hasField: false,
      canUpdate: false,
      message: `测试过程中发生异常: ${error instanceof Error ? error.message : '未知错误'}`
    };
  }
}; 