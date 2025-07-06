import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 初始化环境变量
config();

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 创建Supabase客户端（使用服务角色密钥）
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testRLS() {
  console.log('🔍 开始测试RLS策略...');

  try {
    // 1. 检查design_works表是否有is_public字段
    console.log('1️⃣ 检查design_works表结构...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'design_works' AND column_name = 'is_public';
        `
      });

    if (tableError) {
      console.error('❌ 检查表结构失败:', tableError);
      return;
    }

    if (!tableInfo || tableInfo.length === 0) {
      console.log('⚠️ design_works表缺少is_public字段，正在添加...');
      const { error: alterError } = await supabase
        .rpc('exec_sql', {
          sql: `ALTER TABLE design_works ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;`
        });

      if (alterError) {
        console.error('❌ 添加is_public字段失败:', alterError);
        return;
      }
      console.log('✅ 已添加is_public字段');
    } else {
      console.log('✅ is_public字段已存在');
    }

    // 2. 检查RLS策略
    console.log('2️⃣ 检查RLS策略...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT policyname, permissive, roles, cmd, qual
          FROM pg_policies
          WHERE tablename = 'design_works';
        `
      });

    if (policiesError) {
      console.error('❌ 检查RLS策略失败:', policiesError);
      return;
    }

    console.log('📋 当前RLS策略:');
    console.table(policies);

    // 3. 修复RLS策略
    console.log('3️⃣ 修复RLS策略...');
    const { error: fixError } = await supabase
      .rpc('exec_sql', {
        sql: `
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
        `
      });

    if (fixError) {
      console.error('❌ 修复RLS策略失败:', fixError);
      return;
    }
    console.log('✅ RLS策略已修复');

    // 4. 验证RLS策略
    console.log('4️⃣ 验证RLS策略...');
    const { data: updatedPolicies, error: updatedPoliciesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT policyname, permissive, roles, cmd, qual
          FROM pg_policies
          WHERE tablename = 'design_works';
        `
      });

    if (updatedPoliciesError) {
      console.error('❌ 验证RLS策略失败:', updatedPoliciesError);
      return;
    }

    console.log('📋 更新后的RLS策略:');
    console.table(updatedPolicies);

    console.log('🎉 RLS策略测试完成！');
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
}

// 运行测试
testRLS(); 