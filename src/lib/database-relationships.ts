import { supabase } from './supabase';

/**
 * 数据库关联关系管理
 * 负责建立和维护表之间的外键关联
 */

export interface DatabaseRelationship {
  childTable: string;
  childColumn: string;
  parentTable: string;
  parentColumn: string;
  constraintName: string;
  onDelete?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
  onUpdate?: 'CASCADE' | 'SET NULL' | 'RESTRICT';
}

// 定义所有需要的数据库关联关系
const REQUIRED_RELATIONSHIPS: DatabaseRelationship[] = [
  // profiles 表关联
  {
    childTable: 'profiles',
    childColumn: 'user_id',
    parentTable: 'auth.users',
    parentColumn: 'id',
    constraintName: 'fk_profiles_user_id',
    onDelete: 'CASCADE'
  },
  
  // design_works 表关联
  {
    childTable: 'design_works',
    childColumn: 'user_id',
    parentTable: 'auth.users',
    parentColumn: 'id',
    constraintName: 'fk_design_works_user_id',
    onDelete: 'CASCADE'
  },
  {
    childTable: 'design_works',
    childColumn: 'profile_id',
    parentTable: 'profiles',
    parentColumn: 'id',
    constraintName: 'fk_design_works_profile_id',
    onDelete: 'CASCADE'
  },

  // user_energy_records 表关联
  {
    childTable: 'user_energy_records',
    childColumn: 'user_id',
    parentTable: 'auth.users',
    parentColumn: 'id',
    constraintName: 'fk_energy_records_user_id',
    onDelete: 'CASCADE'
  },
  {
    childTable: 'user_energy_records',
    childColumn: 'profile_id',
    parentTable: 'profiles',
    parentColumn: 'id',
    constraintName: 'fk_energy_records_profile_id',
    onDelete: 'CASCADE'
  },

  // meditation_sessions 表关联
  {
    childTable: 'meditation_sessions',
    childColumn: 'user_id',
    parentTable: 'auth.users',
    parentColumn: 'id',
    constraintName: 'fk_meditation_sessions_user_id',
    onDelete: 'CASCADE'
  },
  {
    childTable: 'meditation_sessions',
    childColumn: 'profile_id',
    parentTable: 'profiles',
    parentColumn: 'id',
    constraintName: 'fk_meditation_sessions_profile_id',
    onDelete: 'CASCADE'
  },

  // membership_info 表关联
  {
    childTable: 'membership_info',
    childColumn: 'user_id',
    parentTable: 'auth.users',
    parentColumn: 'id',
    constraintName: 'fk_membership_info_user_id',
    onDelete: 'CASCADE'
  },
  {
    childTable: 'membership_info',
    childColumn: 'profile_id',
    parentTable: 'profiles',
    parentColumn: 'id',
    constraintName: 'fk_membership_info_profile_id',
    onDelete: 'CASCADE'
  },

  // user_favorite_crystals 表关联
  {
    childTable: 'user_favorite_crystals',
    childColumn: 'user_id',
    parentTable: 'auth.users',
    parentColumn: 'id',
    constraintName: 'fk_favorite_crystals_user_id',
    onDelete: 'CASCADE'
  },
  {
    childTable: 'user_favorite_crystals',
    childColumn: 'crystal_id',
    parentTable: 'crystals',
    parentColumn: 'id',
    constraintName: 'fk_favorite_crystals_crystal_id',
    onDelete: 'CASCADE'
  }
];

export class DatabaseRelationshipManager {
  /**
   * 检查表之间的关联关系是否存在
   */
  static async checkRelationships(): Promise<{
    existing: DatabaseRelationship[];
    missing: DatabaseRelationship[];
    total: number;
  }> {
    const existing: DatabaseRelationship[] = [];
    const missing: DatabaseRelationship[] = [];

    for (const relationship of REQUIRED_RELATIONSHIPS) {
      try {
        // 检查外键约束是否存在
        const { data, error } = await supabase.rpc('check_foreign_key_exists', {
          constraint_name: relationship.constraintName,
          table_name: relationship.childTable
        });

        if (error) {
          console.warn(`检查关联关系失败: ${relationship.constraintName}`, error);
          missing.push(relationship);
        } else if (data) {
          existing.push(relationship);
        } else {
          missing.push(relationship);
        }
      } catch (error) {
        console.warn(`检查关联关系异常: ${relationship.constraintName}`, error);
        missing.push(relationship);
      }
    }

    return {
      existing,
      missing,
      total: REQUIRED_RELATIONSHIPS.length
    };
  }

  /**
   * 创建缺失的关联关系
   */
  static async createMissingRelationships(): Promise<{
    success: boolean;
    created: DatabaseRelationship[];
    failed: { relationship: DatabaseRelationship; error: any }[];
  }> {
    const created: DatabaseRelationship[] = [];
    const failed: { relationship: DatabaseRelationship; error: any }[] = [];

    // 首先检查哪些关联关系缺失
    const { missing } = await this.checkRelationships();

    console.log(`🔗 发现 ${missing.length} 个缺失的关联关系`);

    for (const relationship of missing) {
      try {
        const sql = this.generateForeignKeySQL(relationship);
        console.log(`🔧 创建关联关系: ${relationship.constraintName}`);
        
        const { error } = await supabase.rpc('exec_sql', { sql });

        if (error) {
          console.error(`❌ 创建关联关系失败: ${relationship.constraintName}`, error);
          failed.push({ relationship, error });
        } else {
          console.log(`✅ 创建关联关系成功: ${relationship.constraintName}`);
          created.push(relationship);
        }
      } catch (error) {
        console.error(`❌ 创建关联关系异常: ${relationship.constraintName}`, error);
        failed.push({ relationship, error });
      }
    }

    return {
      success: failed.length === 0,
      created,
      failed
    };
  }

  /**
   * 生成外键约束 SQL
   */
  private static generateForeignKeySQL(relationship: DatabaseRelationship): string {
    const { childTable, childColumn, parentTable, parentColumn, constraintName, onDelete, onUpdate } = relationship;
    
    let sql = `ALTER TABLE ${childTable} ADD CONSTRAINT ${constraintName} `;
    sql += `FOREIGN KEY (${childColumn}) REFERENCES ${parentTable}(${parentColumn})`;
    
    if (onDelete) {
      sql += ` ON DELETE ${onDelete}`;
    }
    
    if (onUpdate) {
      sql += ` ON UPDATE ${onUpdate}`;
    }
    
    sql += ';';
    
    return sql;
  }

  /**
   * 修复表结构中的关联问题
   */
  static async repairTableRelationships(): Promise<{
    success: boolean;
    results: { step: string; success: boolean; error?: any }[];
  }> {
    const results: { step: string; success: boolean; error?: any }[] = [];

    try {
      // 1. 检查现有关联关系
      console.log('🔍 检查数据库关联关系...');
      const relationshipStatus = await this.checkRelationships();
      
      results.push({
        step: `检查关联关系 (${relationshipStatus.existing.length}/${relationshipStatus.total} 存在)`,
        success: true
      });

      // 2. 创建缺失的关联关系
      if (relationshipStatus.missing.length > 0) {
        console.log('🔧 创建缺失的关联关系...');
        const createResult = await this.createMissingRelationships();
        
        results.push({
          step: `创建关联关系 (${createResult.created.length}/${relationshipStatus.missing.length} 成功)`,
          success: createResult.success,
          error: createResult.failed.length > 0 ? createResult.failed : undefined
        });
      } else {
        results.push({
          step: '所有关联关系都已存在',
          success: true
        });
      }

      // 3. 验证关联关系完整性
      console.log('✅ 验证关联关系完整性...');
      const finalStatus = await this.checkRelationships();
      
      results.push({
        step: `验证完整性 (${finalStatus.existing.length}/${finalStatus.total} 正常)`,
        success: finalStatus.missing.length === 0
      });

      const overallSuccess = results.every(r => r.success);
      
      console.log(`📊 关联关系修复${overallSuccess ? '成功' : '部分成功'}`);
      
      return {
        success: overallSuccess,
        results
      };

    } catch (error) {
      console.error('❌ 修复关联关系失败:', error);
      
      results.push({
        step: '修复关联关系',
        success: false,
        error
      });

      return {
        success: false,
        results
      };
    }
  }

  /**
   * 获取关联关系报告
   */
  static async getRelationshipReport(): Promise<{
    summary: {
      total: number;
      existing: number;
      missing: number;
      healthScore: number;
    };
    details: {
      existing: DatabaseRelationship[];
      missing: DatabaseRelationship[];
    };
    recommendations: string[];
  }> {
    const { existing, missing, total } = await this.checkRelationships();
    const healthScore = total > 0 ? Math.round((existing.length / total) * 100) : 0;

    const recommendations: string[] = [];

    if (missing.length > 0) {
      recommendations.push(`需要创建 ${missing.length} 个缺失的关联关系`);
      recommendations.push('执行"修复关联关系"功能来自动创建这些关联');
    }

    if (healthScore < 80) {
      recommendations.push('数据库关联完整性较低，建议尽快修复');
    }

    if (missing.some(r => r.childTable === 'profiles')) {
      recommendations.push('profiles表的关联问题可能影响用户数据访问');
    }

    return {
      summary: {
        total,
        existing: existing.length,
        missing: missing.length,
        healthScore
      },
      details: {
        existing,
        missing
      },
      recommendations
    };
  }
}

// 导出主要功能
export const {
  checkRelationships,
  createMissingRelationships,
  repairTableRelationships,
  getRelationshipReport
} = DatabaseRelationshipManager;

export default DatabaseRelationshipManager; 