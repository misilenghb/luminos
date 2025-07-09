# Luminos 水晶日历 - 全栈身心灵能量管理系统

## 📋 项目概述

Luminos是一个基于现代Web技术栈构建的全栈身心灵能量管理系统，融合了MBTI人格分析、脉轮能量理论、水晶能量学和AI智能推荐，为用户提供个性化的身心灵成长指导和能量管理解决方案。

### 🎯 核心价值
- **个性化体验**: 基于MBTI和用户行为数据的深度个性化
- **科学理论**: 结合心理学、能量学和现代数据分析
- **智能推荐**: AI驱动的个性化建议和内容生成
- **全面追踪**: 多维度能量状态监测和成长轨迹记录

## 🏗️ 系统架构

### 技术栈概览
```
前端层: Next.js 15 + React 18 + TypeScript + Tailwind CSS
状态管理: React Context + Custom Hooks
UI组件: Radix UI + Framer Motion + Lucide Icons
数据可视化: Recharts + D3.js + 自定义图表组件
后端服务: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
AI集成: Google Genkit + 自定义AI流程 + 缓存优化
测试框架: Jest + React Testing Library + 端到端测试
部署平台: Vercel + Firebase Hosting + GitHub Actions
```

### 系统分层架构
```
┌─────────────────────────────────────────────────────────────┐
│                    用户界面层 (UI Layer)                      │
├─────────────────────────────────────────────────────────────┤
│                   业务逻辑层 (Business Layer)                 │
├─────────────────────────────────────────────────────────────┤
│                   数据访问层 (Data Access Layer)              │
├─────────────────────────────────────────────────────────────┤
│                   基础设施层 (Infrastructure Layer)           │
└─────────────────────────────────────────────────────────────┘
```

## 🌟 核心功能模块

### 1. 🏠 智能首页系统
**文件位置**: `src/app/page.tsx`
- **个性化欢迎界面**: 基于用户MBTI类型和时间的动态问候
- **今日能量概览**: 实时能量状态展示和趋势分析
- **智能导航**: 根据用户行为模式推荐功能模块
- **快速操作**: 一键访问常用功能和设置

### 2. 🎯 今日专注模块
**文件位置**: `src/app/daily-focus/page.tsx`
- **个性化任务推荐**: AI分析用户习惯生成专注任务
- **能量状态评估**: 实时监测和调整建议
- **专注时间追踪**: 番茄钟技术结合能量管理
- **成就系统**: 激励用户持续专注和成长

### 3. 🔍 能量探索中心
**文件位置**: `src/app/energy-exploration/page.tsx`
- **八维能量分析**: 全方位能量状态评估
- **水晶推荐系统**: 基于能量状态的个性化水晶建议
- **冥想指导**: 专业的冥想练习和能量调节
- **能量日历**: 长期能量变化追踪和模式识别

### 4. 🎨 创意工坊
**文件位置**: `src/app/creative-workshop/page.tsx`
- **AI辅助创作**: 智能内容生成和创意启发
- **灵感记录**: 多媒体灵感收集和整理
- **创意分享**: 社区互动和作品展示
- **创作分析**: 创意模式和偏好分析

### 5. 📊 个性化仪表板
**文件位置**: `src/app/dashboard/page.tsx`
- **综合数据概览**: 多维度数据聚合展示
- **趋势分析**: 长期成长轨迹和模式识别
- **目标管理**: 个人成长目标设定和追踪
- **报告生成**: 自动化成长报告和洞察

## 🧩 核心组件系统

### 1. 能量分析组件
**文件位置**: `src/components/core/EnergyCore/`
```typescript
// 能量分析核心组件
EnergyAnalysisHub.tsx - 能量分析中心
FiveDimensionalEnergyChart.tsx - 五维能量雷达图
EnergyTrendChart.tsx - 能量趋势图表
SimpleEnergyChart.tsx - 简化能量图表
```

### 2. 用户档案组件
**文件位置**: `src/components/core/ProfileCore/`
```typescript
// 用户档案核心组件
ProfileDisplayHub.tsx - 档案展示中心
ProfileSummaryCard.tsx - 档案摘要卡片
PersonalizedDashboard.tsx - 个性化仪表板
```

### 3. 水晶系统组件
**文件位置**: `src/components/core/CrystalCore/`
```typescript
// 水晶系统核心组件
CrystalDayPicker.tsx - 水晶日历选择器
DailyCrystalRecommendation.tsx - 每日水晶推荐
CrystalMeditation.tsx - 水晶冥想指导
```

### 4. 智能组件系统
**文件位置**: `src/components/smart/`
```typescript
// 智能组件
ContentAggregator.tsx - 内容聚合器
AIInsightEngine.tsx - AI洞察引擎
SmartScheduleRecommendation.tsx - 智能日程推荐
```

## 🔧 开发工具和配置

### 1. 开发环境配置
```bash
# 环境要求
Node.js: 18.0.0+
npm: 9.0.0+
TypeScript: 5.0.0+
```

### 2. 项目配置文件
```
next.config.ts - Next.js配置
tailwind.config.ts - Tailwind CSS配置
tsconfig.json - TypeScript配置
jest.config.cjs - Jest测试配置
eslint.config.js - ESLint代码规范
postcss.config.mjs - PostCSS配置
```

### 3. 开发脚本
```json
{
  "dev": "next dev -p 9004",
  "build": "next build",
  "start": "next start",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "lint": "next lint",
  "type-check": "tsc --noEmit"
}
```

## 🗄️ 数据库设计

### Supabase数据库架构
```sql
-- 用户表
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  mbti_type TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- 能量记录表
energy_records (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  energy_data JSONB,
  recorded_at TIMESTAMP
)

-- 水晶推荐表
crystal_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  crystal_type TEXT,
  recommendation_reason TEXT,
  created_at TIMESTAMP
)

-- 用户偏好表
user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  preferences JSONB,
  updated_at TIMESTAMP
)
```

## 🤖 AI集成系统

### 1. Google Genkit集成
**文件位置**: `src/ai/`
```typescript
// AI流程配置
flows/creative-conversation-flow.ts - 创意对话流程
pollinations.ts - AI图像生成集成
```

### 2. 缓存优化系统
**文件位置**: `src/lib/`
```typescript
// 缓存管理
cache-manager.ts - 缓存管理器
ml-prediction-cache.ts - ML预测缓存
ai-cache/ - AI响应缓存系统
```

### 3. Edge Functions
**文件位置**: `supabase/functions/`
```typescript
// 边缘函数
ai-cache/index.ts - AI缓存边缘函数
```

## 🎨 UI/UX设计系统

### 1. 设计原则
- **一致性**: 统一的视觉语言和交互模式
- **可访问性**: 符合WCAG 2.1标准的无障碍设计
- **响应式**: 适配多种设备和屏幕尺寸
- **性能优化**: 流畅的动画和快速的加载体验

### 2. 主题系统
**文件位置**: `src/styles/`
```css
/* 主题配置 */
globals.css - 全局样式
crystal-calendar.css - 水晶日历专用样式
```

### 3. 组件库
**文件位置**: `src/components/ui/`
```typescript
// UI组件库
button.tsx - 按钮组件
card.tsx - 卡片组件
dialog.tsx - 对话框组件
calendar.tsx - 日历组件
toast.tsx - 提示组件
```

## 🌐 国际化系统

### 多语言支持
**文件位置**: `src/locales/`
```json
// 语言文件
zh.json - 中文翻译
en.json - 英文翻译
```

### 语言切换机制
**文件位置**: `src/contexts/LanguageContext.tsx`
- 动态语言切换
- 本地存储偏好
- 自动语言检测

## 🧪 测试策略

### 1. 单元测试
**文件位置**: `__tests__/`
```typescript
// 测试文件
components.test.tsx - 组件测试
```

### 2. 测试配置
```javascript
// Jest配置
jest.config.cjs - Jest配置文件
jest.setup.js - 测试环境设置
```

### 3. 测试覆盖率目标
- 组件测试覆盖率: >80%
- 工具函数测试覆盖率: >90%
- 关键业务逻辑测试覆盖率: >95%

## 📱 PWA功能

### 1. 离线支持
**文件位置**: `public/`
```javascript
// PWA配置
manifest.json - 应用清单
sw.js - Service Worker
```

### 2. 安装提示
**文件位置**: `src/components/PWAInstallPrompt.tsx`
- 智能安装提示
- 跨平台兼容
- 用户体验优化

## 🚀 部署和运维

### 1. 部署配置
```yaml
# Vercel配置
vercel.json - Vercel部署配置

# Firebase配置
apphosting.yaml - Firebase应用托管配置
```

### 2. 环境变量
```bash
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GENKIT_API_KEY=your_genkit_api_key
```

### 3. 监控和分析
**文件位置**: `src/lib/`
```typescript
// 监控系统
enhanced-monitoring.ts - 增强监控
system-health-check.ts - 系统健康检查
ab-testing-framework.ts - A/B测试框架
```

## 📊 性能优化

### 1. 代码分割
- 路由级别的代码分割
- 组件懒加载
- 动态导入优化

### 2. 缓存策略
- 浏览器缓存
- CDN缓存
- API响应缓存
- 静态资源缓存

### 3. 性能监控
**文件位置**: `src/components/PerformanceOptimizer.tsx`
- 实时性能监控
- 用户体验指标追踪
- 自动性能优化

## 🔒 安全措施

### 1. 数据安全
- Row Level Security (RLS)
- 数据加密传输
- 敏感信息脱敏

### 2. 认证授权
- Supabase Auth集成
- JWT令牌管理
- 角色权限控制

### 3. 安全配置
```typescript
// 安全配置
next.config.ts - 安全头配置
middleware.ts - 中间件安全检查
```

## 📈 数据分析

### 1. 用户行为分析
- 页面访问统计
- 功能使用频率
- 用户路径分析

### 2. 业务指标
- 用户留存率
- 功能转化率
- 用户满意度

### 3. 性能指标
- 页面加载时间
- API响应时间
- 错误率监控

## 🔄 持续集成/持续部署

### 1. GitHub Actions
```yaml
# CI/CD配置
.github/workflows/ - GitHub Actions工作流
```

### 2. 自动化流程
- 代码质量检查
- 自动化测试
- 自动部署
- 性能监控

## 📚 文档系统

### 1. 开发文档
```markdown
# 项目文档
README.md - 项目说明
docs/blueprint.md - 系统蓝图
各种优化报告和实现文档
```

### 2. API文档
- Supabase API文档
- 自定义API接口文档
- 第三方服务集成文档

## 🤝 团队协作

### 1. 代码规范
- ESLint配置
- Prettier格式化
- TypeScript严格模式
- Git提交规范

### 2. 版本管理
- 语义化版本控制
- 分支管理策略
- 代码审查流程

## 🎯 未来规划

### 1. 功能扩展
- 社区功能
- 高级分析
- 移动应用
- 企业版本

### 2. 技术升级
- React 19升级
- Next.js新特性
- AI能力增强
- 性能优化

### 3. 生态建设
- 插件系统
- 开放API
- 第三方集成
- 开发者社区

## 🚀 快速开始

### 1. 环境准备
```bash
# 检查Node.js版本
node --version  # 需要 18.0.0+

# 检查npm版本
npm --version   # 需要 9.0.0+
```

### 2. 项目安装
```bash
# 克隆项目
git clone https://github.com/misilenghb/luminos.git
cd luminos

# 安装依赖
npm install

# 复制环境变量模板
cp .env.example .env.local
```

### 3. 环境配置
编辑 `.env.local` 文件，添加必要的API密钥：
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GENKIT_API_KEY=your_genkit_api_key
```

### 4. 启动开发服务器
```bash
# 启动开发服务器
npm run dev

# 访问应用
# 浏览器打开 http://localhost:9004
```

### 5. 运行测试
```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

### 6. 构建生产版本
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📞 联系信息

- **项目仓库**: https://github.com/misilenghb/luminos
- **在线演示**: https://luminos.vercel.app
- **技术支持**: 通过GitHub Issues
- **开发团队**: Luminos Development Team

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者、设计师和用户。特别感谢：

- **开源社区**: 提供了优秀的工具和库
- **测试用户**: 提供了宝贵的反馈和建议
- **技术顾问**: 在架构设计和技术选型上的指导

---

**Luminos** - 用科技点亮内在智慧，用数据平衡身心能量 ✨

---

*本文档最后更新时间: 2025年1月7日*
*文档版本: v1.0.0*
```
