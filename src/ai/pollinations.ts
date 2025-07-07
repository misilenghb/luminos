// Pollinations API 统一调用封装
import type { RefineImageInput, RefineImageOutput } from './schemas/refine-image-schemas';
import type { AnalyzeInspirationImageInput, AnalyzeInspirationImageOutput } from './schemas/inspiration-schemas';
import type { DesignSuggestionsInput, DesignSuggestionsOutput } from './schemas/design-schemas';
import { z } from 'zod';

// 文本API
const POLLINATIONS_TEXT_API_URL = 'https://text.pollinations.ai';
// 图片API
const POLLINATIONS_IMAGE_API_URL = 'https://image.pollinations.ai';

// 创建缓存管理器实例（仅在客户端）
let cacheManager: any = null;
  if (typeof window !== 'undefined') {
  try {
    const CacheManagerModule = require('@/lib/cache-manager');
    cacheManager = new CacheManagerModule.CacheManager();
  } catch (error) {
    console.warn('CacheManager初始化失败，将使用降级模式:', error);
  }
}

// API配额管理
class APIQuotaManager {
  private quotas: Map<string, { count: number; resetTime: number }> = new Map();
  private limits = {
    free: { hourly: 10, daily: 50 },
    premium: { hourly: 100, daily: 1000 },
    ultimate: { hourly: 500, daily: 10000 }
  };

  async checkQuota(userId: string, membershipType: 'free' | 'premium' | 'ultimate'): Promise<boolean> {
    const now = Date.now();
    const hourKey = `${userId}-${Math.floor(now / (1000 * 60 * 60))}`;
    const dayKey = `${userId}-${Math.floor(now / (1000 * 60 * 60 * 24))}`;
    
    const hourlyUsage = this.quotas.get(hourKey) || { count: 0, resetTime: now + 1000 * 60 * 60 };
    const dailyUsage = this.quotas.get(dayKey) || { count: 0, resetTime: now + 1000 * 60 * 60 * 24 };
    
    const limits = this.limits[membershipType];
    
    if (hourlyUsage.count >= limits.hourly || dailyUsage.count >= limits.daily) {
      return false;
    }
    
    // 增加使用次数
    this.quotas.set(hourKey, { ...hourlyUsage, count: hourlyUsage.count + 1 });
    this.quotas.set(dayKey, { ...dailyUsage, count: dailyUsage.count + 1 });
    
    return true;
  }
  
  getQuotaStatus(userId: string, membershipType: 'free' | 'premium' | 'ultimate') {
    const now = Date.now();
    const hourKey = `${userId}-${Math.floor(now / (1000 * 60 * 60))}`;
    const dayKey = `${userId}-${Math.floor(now / (1000 * 60 * 60 * 24))}`;
    
    const hourlyUsage = this.quotas.get(hourKey) || { count: 0, resetTime: now + 1000 * 60 * 60 };
    const dailyUsage = this.quotas.get(dayKey) || { count: 0, resetTime: now + 1000 * 60 * 60 * 24 };
    
    const limits = this.limits[membershipType];
    
    return {
      hourly: { used: hourlyUsage.count, limit: limits.hourly },
      daily: { used: dailyUsage.count, limit: limits.daily }
    };
  }
}

// 创建配额管理器实例
const quotaManager = new APIQuotaManager();

// 智能重试机制
async function withRetry<T>(fn: () => Promise<T>, maxRetries: number = 3, delay: number = 1000): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // 如果是4xx错误，不重试
      if (error instanceof Error && error.message.includes('400')) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(2, attempt - 1); // 指数退避
        console.log(`尝试 ${attempt} 失败，${waitTime}ms后重试...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError!;
}

// 获取配置函数
function getPollinationsToken(): string | undefined {
  return process.env.POLLINATIONS_API_TOKEN || process.env.POLLINATIONS_API_TOKEN;
}

function getTextModel(): string {
  return process.env.POLLINATIONS_TEXT_MODEL || 'openai';
}

function getImageModel(): string {
  return process.env.POLLINATIONS_IMAGE_MODEL || 'flux';
}

// 导出配置函数
export { getPollinationsToken, getTextModel, getImageModel };

// 导出主要函数
export async function pollinationsDesignSuggestions(input: DesignSuggestionsInput & { model?: string }): Promise<DesignSuggestionsOutput> {
  // 生成缓存键
  const cacheKey = `design-suggestions:${JSON.stringify(input)}`;
  
  // 检查缓存（仅在客户端可用）
  if (cacheManager) {
    try {
      const cached = await cacheManager.get(cacheKey);
      if (cached && cached.data) {
        console.log('从缓存返回设计建议');
        return cached.data;
      }
    } catch (error) {
      console.warn('缓存检查失败，继续API调用:', error);
    }
  }
  
  // 检查配额
  const userId = (input as any).userId || 'anonymous';
  const membershipType = (input as any).membershipType || 'free';
  
  const hasQuota = await quotaManager.checkQuota(userId, membershipType);
  if (!hasQuota) {
    const status = quotaManager.getQuotaStatus(userId, membershipType);
    throw new Error(`设计建议配额已达上限。当前配额：每小时${status.hourly.used}/${status.hourly.limit}，每日${status.daily.used}/${status.daily.limit}`);
  }
  
  // 根据应用平台调整提示词格式
  const platform = input.applicationPlatform || 'flux';
  let promptSuffix = '';
  
  switch (platform) {
    case 'midjourney':
      promptSuffix = ', professional jewelry photography, clean white background, studio lighting --ar 3:4 --v 6';
      break;
    case 'dalle':
      promptSuffix = '. Professional jewelry photography with clean white background and studio lighting.';
      break;
    case 'local-comfyui':
    case 'local-automatic1111':
    case 'local-invokeai':
      promptSuffix = ', professional jewelry photography, clean white background, studio lighting, high quality, detailed';
      break;
    case 'custom':
      promptSuffix = '';
      break;
    default:
      // flux 和其他 Pollinations 模型
      promptSuffix = ', professional jewelry photography, clean white background, studio lighting, high quality, 4k';
      break;
  }

  const prompt = `You are a professional crystal jewelry designer and metaphysical expert. Based on the following user requirements, provide comprehensive design suggestions.

Requirements:
- Design category: ${input.designCategory}
- Overall design style: ${input.overallDesignStyle}
- Main stones: ${input.mainStones}
- User intent: ${input.userIntent || 'personal wear'}
- Metal type: ${input.metalType || 'silver'}
- Color system: ${JSON.stringify(input.colorSystem)}
- Compositional aesthetics: ${JSON.stringify(input.compositionalAesthetics)}
- Accessories: ${input.accessories || 'minimal'}
- Photography settings: ${input.photographySettings || 'standard studio setup'}
- Application platform: ${platform}
- Language: ${input.language || 'zh'}

Please respond in valid JSON format with this structure:
{
  "personalizedIntroduction": "Brief personalized introduction",
  "designConcept": "Core design concept and theme",
  "designSchemes": [
    {
      "schemeTitle": "Scheme name",
      "mainStoneDescription": "Main stone details",
      "auxiliaryStonesDescription": "Auxiliary stones (optional)",
      "chainOrStructureDescription": "Structure details (optional)",
      "otherDetails": "Additional details (optional)",
      "imageGenerationPrompt": "Detailed English prompt for ${platform}${promptSuffix}"
    }
  ],
  "accessorySuggestions": "General accessory recommendations",
  "photographySettingSuggestions": "Photography setup suggestions",
  "concludingRemarks": "Polite conclusion (optional)"
}

Important:
- Provide 1-3 design schemes
- Use Chinese if language is 'zh', English if 'en'
- Include detailed image generation prompts optimized for ${platform}
- Consider the specified color system and compositional aesthetics`;

  try {
    const result = await withRetry(async () => {
      // 方法1: 尝试直接URL调用
      const encodedPrompt = encodeURIComponent(prompt);
      const directUrl = `https://text.pollinations.ai/${encodedPrompt}`;

      const directResponse = await fetch(directUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (compatible; CrystalCalendar/1.0)',
        },
      });

      if (directResponse.ok) {
        const text = await directResponse.text();
        try {
          return JSON.parse(text);
        } catch {
          // 如果不是JSON，生成一个基本的响应
          return {
            suggestions: [{
              title: "创意设计方案",
              description: text.substring(0, 200) || "基于您的需求，我为您准备了精美的设计建议。",
              imagePrompt: `${input.designCategory} design with ${input.mainStones}, ${input.overallDesignStyle} style`,
              reasoning: "根据您选择的水晶和风格特点定制"
            }],
            language: input.language || 'zh'
          };
        }
      }

      // 方法2: 尝试POST请求
      const response = await fetch(POLLINATIONS_TEXT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getPollinationsToken() && { 'Authorization': `Bearer ${getPollinationsToken()}` }),
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: input.model || getTextModel(),
          seed: Math.floor(Math.random() * 1000000),
          temperature: 0.8
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      
      // 尝试解析JSON
      let parsedResult: DesignSuggestionsOutput;
      try {
        parsedResult = JSON.parse(text);
      } catch {
        // 如果直接解析失败，尝试从markdown代码块中提取
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[1]);
        } catch {
            throw new Error('AI返回的JSON格式有误，无法解析');
          }
        } else {
          // 降级处理：创建基本结构
          return {
            personalizedIntroduction: '',
            designConcept: text,
            designSchemes: [],
            accessorySuggestions: '',
            photographySettingSuggestions: '',
            concludingRemarks: '',
          };
        }
      }

      // 验证并清理数据
      const result: DesignSuggestionsOutput = {
        personalizedIntroduction: parsedResult.personalizedIntroduction || '',
        designConcept: parsedResult.designConcept || '设计概念待完善',
        designSchemes: Array.isArray(parsedResult.designSchemes) 
          ? parsedResult.designSchemes.map(scheme => ({
              schemeTitle: scheme.schemeTitle || '未命名方案',
              mainStoneDescription: scheme.mainStoneDescription || '主石描述待补充',
              auxiliaryStonesDescription: scheme.auxiliaryStonesDescription,
              chainOrStructureDescription: scheme.chainOrStructureDescription,
              otherDetails: scheme.otherDetails,
              imageGenerationPrompt: scheme.imageGenerationPrompt || '图片生成提示待完善',
            }))
          : [],
        accessorySuggestions: parsedResult.accessorySuggestions || '配件建议待补充',
        photographySettingSuggestions: parsedResult.photographySettingSuggestions || '摄影建议待补充',
        concludingRemarks: parsedResult.concludingRemarks,
      };

      return result;
    });

    // 缓存结果（仅在客户端可用）
    if (cacheManager) {
      try {
        await cacheManager.set(cacheKey, result, 60 * 60 * 1000); // 缓存1小时
      } catch (error) {
        console.warn('缓存保存失败:', error);
      }
    }

    return result;
  } catch (error) {
    console.error('Pollinations设计建议API错误:', error);

    // 返回默认的设计建议而不是抛出错误
    const fallbackResult: DesignSuggestionsOutput = {
      personalizedIntroduction: input.language === 'zh'
        ? `为您精心设计的${input.designCategory}方案，融合${input.overallDesignStyle}风格特色。`
        : `Carefully designed ${input.designCategory} featuring ${input.overallDesignStyle} style elements.`,
      designConcept: input.language === 'zh'
        ? `基于您选择的${input.mainStones}，我们为您打造独特的设计理念，体现水晶的天然美感与能量特质。`
        : `Based on your selected ${input.mainStones}, we create a unique design concept that showcases the natural beauty and energy properties of crystals.`,
      designSchemes: [
        {
          schemeTitle: input.language === 'zh' ? '经典优雅方案' : 'Classic Elegant Design',
          mainStoneDescription: input.language === 'zh'
            ? `选用${input.mainStones}作为主石，展现其独特的色彩与光泽。`
            : `Features ${input.mainStones} as the main stone, showcasing its unique color and brilliance.`,
          auxiliaryStonesDescription: input.language === 'zh'
            ? '搭配精选辅石，增强整体设计的层次感。'
            : 'Complemented by carefully selected auxiliary stones for enhanced design depth.',
          chainOrStructureDescription: input.language === 'zh'
            ? `采用${input.overallDesignStyle}风格的结构设计，确保佩戴舒适性。`
            : `Features ${input.overallDesignStyle} style structural design for optimal comfort.`,
          otherDetails: input.language === 'zh'
            ? '精工细作，每个细节都体现匠心工艺。'
            : 'Meticulously crafted with attention to every detail.',
          imageGenerationPrompt: `elegant ${input.designCategory} jewelry design, ${input.overallDesignStyle} style, featuring ${input.mainStones}, professional photography, high quality, detailed craftsmanship, beautiful lighting`
        }
      ],
      accessorySuggestions: input.language === 'zh'
        ? '建议搭配简约的配饰，突出主石的美感。可选择同色系的耳环或手链进行呼应。'
        : 'Recommend pairing with minimalist accessories to highlight the main stone. Consider matching earrings or bracelets in similar tones.',
      photographySettingSuggestions: input.language === 'zh'
        ? '建议在自然光下拍摄，使用中性背景，突出水晶的透明度和色彩。'
        : 'Recommend shooting in natural light with neutral background to highlight crystal transparency and color.',
      concludingRemarks: input.language === 'zh'
        ? '这个设计方案将为您带来独特的美感体验和正向能量。'
        : 'This design will bring you a unique aesthetic experience and positive energy.'
    };

    return fallbackResult;
  }
}

// 精细化图像处理
export async function pollinationsRefineImage(input: RefineImageInput): Promise<RefineImageOutput> {
  const cacheKey = `refine-image:${JSON.stringify(input)}`;
  
  // 检查缓存
  if (cacheManager) {
    try {
      const cached = await cacheManager.get(cacheKey);
      if (cached && cached.data) {
        console.log('从缓存返回精细化图像');
        return cached.data;
      }
    } catch (error) {
      console.warn('缓存检查失败，继续API调用:', error);
    }
  }
  
  try {
    const result = await withRetry(async () => {
      const response = await fetch(POLLINATIONS_IMAGE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input.prompt,
          model: getImageModel(),
          seed: Math.floor(Math.random() * 1000000),
          width: 1024,
          height: 1024,
          enhance: true,
          nologo: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`图像精细化API请求失败: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      
      return {
        imageUrl,
      };
    });

    // 缓存结果
    if (cacheManager) {
      try {
        await cacheManager.set(cacheKey, result, 60 * 60 * 1000); // 缓存1小时
      } catch (error) {
        console.warn('缓存保存失败:', error);
      }
    }

    return result;
  } catch (error) {
    console.error('Pollinations精细化图像API错误:', error);
    throw new Error(`图像精细化失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 配饰建议功能
export async function pollinationsAccessorySuggestions(input: {
  designCategory: string;
  mainStones: string;
  userIntent: string;
  language?: string;
  userId?: string;
  membershipType?: 'free' | 'premium' | 'ultimate';
}) {
  const cacheKey = `accessory-suggestions:${JSON.stringify(input)}`;
  
  // 检查缓存
  if (cacheManager) {
    try {
      const cached = await cacheManager.get(cacheKey);
      if (cached && cached.data) {
        console.log('从缓存返回配饰建议');
        return cached.data;
      }
    } catch (error) {
      console.warn('缓存检查失败，继续API调用:', error);
    }
  }
  
  // 检查配额
  const userId = input.userId || 'anonymous';
  const membershipType = input.membershipType || 'free';
  
  const hasQuota = await quotaManager.checkQuota(userId, membershipType);
  if (!hasQuota) {
    const status = quotaManager.getQuotaStatus(userId, membershipType);
    throw new Error(`配饰建议配额已达上限。当前配额：每小时${status.hourly.used}/${status.hourly.limit}，每日${status.daily.used}/${status.daily.limit}`);
  }

  const prompt = `You are a professional crystal jewelry and accessory expert. Based on the following jewelry design, provide comprehensive accessory suggestions.

Design Details:
- Design category: ${input.designCategory}
- Main stones: ${input.mainStones}
- User intent: ${input.userIntent}
- Language: ${input.language || 'zh'}

Please respond in valid JSON format with this structure:
{
  "introduction": "Brief introduction to accessory pairing",
  "suggestions": [
    {
      "category": "Accessory category",
      "items": ["item1", "item2", "item3"],
      "description": "Why these accessories work well",
      "occasions": ["occasion1", "occasion2"]
    }
  ],
  "stylingTips": "General styling tips",
  "conclusion": "Closing remarks"
}

Important:
- Provide 3-5 accessory categories
- Use Chinese if language is 'zh', English if 'en'
- Consider the crystal properties and metaphysical aspects
- Include both jewelry and non-jewelry accessories`;

  try {
    const result = await withRetry(async () => {
      const response = await fetch(POLLINATIONS_TEXT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [{ role: 'user', content: prompt }],
          model: getTextModel(),
          seed: Math.floor(Math.random() * 1000000),
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const text = await response.text();
      
      // 尝试解析JSON
      let parsedResult: any;
      try {
        parsedResult = JSON.parse(text);
      } catch {
        // 如果直接解析失败，尝试从markdown代码块中提取
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[1]);
          } catch {
            throw new Error('AI返回的JSON格式有误，无法解析');
          }
        } else {
          // 降级处理：创建基本结构
          return {
            introduction: '',
            suggestions: [],
            stylingTips: text,
            conclusion: '',
          };
        }
      }

      return parsedResult;
    });

    // 缓存结果
    if (cacheManager) {
      try {
        await cacheManager.set(cacheKey, result, 60 * 60 * 1000); // 缓存1小时
    } catch (error) {
        console.warn('缓存保存失败:', error);
      }
    }

    return result;
  } catch (error) {
    console.error('Pollinations配饰建议API错误:', error);
    throw new Error(`配饰建议生成失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 灵感图片分析
export async function pollinationsAnalyzeInspiration(input: AnalyzeInspirationImageInput & { model?: string }): Promise<AnalyzeInspirationImageOutput> {
  // 构造 prompt，使用 photoDataUri 字段
  const prompt = `You are a professional crystal jewelry designer. Analyze the following inspiration image (base64 data URI) and generate a detailed English prompt for a new jewelry design.\n\nPhoto Data URI: ${input.photoDataUri}`;
  try {
    const response = await fetch('https://text.pollinations.ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: input.model || getTextModel(),
        temperature: 0.7
      })
    });
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    // 尝试解析JSON
    let parsed: AnalyzeInspirationImageOutput;
    try {
      parsed = JSON.parse(text);
    } catch {
      // 降级处理
      parsed = { prompt: text } as AnalyzeInspirationImageOutput;
    }
    return parsed;
  } catch (error) {
    console.error('Pollinations灵感分析API错误:', error);
    throw new Error(`灵感分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

// 导出配额管理器和工具函数供其他模块使用
export { quotaManager, withRetry }; 