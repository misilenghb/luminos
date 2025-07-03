import { supabase } from './supabase';

/**
 * 数据库结构修复脚本
 * 确保数据库表结构与代码期望的结构一致
 */

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