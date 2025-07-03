/**
 * @fileOverview AI flow for analyzing user questionnaire responses to generate a personalized energy profile and crystal recommendations.
 * This version (v14) introduces a 'coreEnergyInsights' field and structures crystal recommendation reasoning.
 * It adapts to receive raw answers from a 28-question MBTI-like questionnaire
 * (or a pre-calculated type) and 28 Chakra assessment questions (which are locally calculated into average scores per chakra).
 * It uses schemas defined in '@/ai/schemas/user-profile-schemas.ts'.
 * It emphasizes providing meaningful text for all string fields, and handles skipped/incomplete Chakra/MBTI sections.
 * 'coreEnergyInsights' is a primary displayed field.
 * Crystal recommendation reasoning is now an object with 'personalityFit', 'chakraSupport', 'goalAlignment', and 'holisticSynergy'.
 *
 * - analyzeUserProfile - Function to process questionnaire data.
 *                        Input type: FullQuestionnaireDataInput (from '@/ai/schemas/user-profile-schemas.ts')
 *                        Output type: UserProfileDataOutput (from '@/ai/schemas/user-profile-schemas.ts')
 */

import {
  FullQuestionnaireDataInput,
  UserProfileDataOutput
} from '@/ai/schemas/user-profile-schemas';
import { getPollinationsToken, getTextModel } from '../pollinations';

// 备用的模拟用户画像生成器
function generateFallbackProfile(input: FullQuestionnaireDataInput): UserProfileDataOutput {
  const name = input.basicInfo?.name || '用户';
  const birthDate = input.basicInfo?.birthDate;
  
  // 基于生日推测星座
  let zodiac = '白羊座';
  if (birthDate) {
    const [year, month, day] = birthDate.split('-').map(Number);
    const monthDay = month * 100 + day;
    if (monthDay >= 321 && monthDay <= 419) zodiac = '白羊座';
    else if (monthDay >= 420 && monthDay <= 520) zodiac = '金牛座';
    else if (monthDay >= 521 && monthDay <= 620) zodiac = '双子座';
    else if (monthDay >= 621 && monthDay <= 722) zodiac = '巨蟹座';
    else if (monthDay >= 723 && monthDay <= 822) zodiac = '狮子座';
    else if (monthDay >= 823 && monthDay <= 922) zodiac = '处女座';
    else if (monthDay >= 923 && monthDay <= 1022) zodiac = '天秤座';
    else if (monthDay >= 1023 && monthDay <= 1121) zodiac = '天蝎座';
    else if (monthDay >= 1122 && monthDay <= 1221) zodiac = '射手座';
    else if (monthDay >= 1222 || monthDay <= 119) zodiac = '摩羯座';
    else if (monthDay >= 120 && monthDay <= 218) zodiac = '水瓶座';
    else if (monthDay >= 219 && monthDay <= 320) zodiac = '双鱼座';
  }

  // 基于问卷回答推测个性特质
  const mbtiAnswers = input.mbtiAnswers;
  const lifestylePrefs = input.lifestylePreferences;
  
  // 简单的MBTI推测逻辑
  let mbtiType = '直觉感知型';
  if (mbtiAnswers && (mbtiAnswers.eiAnswers || mbtiAnswers.snAnswers || mbtiAnswers.tfAnswers || mbtiAnswers.jpAnswers)) {
    // 这里可以添加更复杂的MBTI计算逻辑
    mbtiType = '感性直觉型，重视内心体验和精神成长';
  }

  // 基于生活偏好推测五行元素
  let element = '木';
  const colorPrefs = lifestylePrefs?.colorPreferences || [];
  if (colorPrefs.includes('red') || colorPrefs.includes('orange')) {
    element = '火';
  } else if (colorPrefs.includes('yellow') || colorPrefs.includes('brown')) {
    element = '土';
  } else if (colorPrefs.includes('white') || colorPrefs.includes('silver')) {
    element = '金';
  } else if (colorPrefs.includes('blue') || colorPrefs.includes('black')) {
    element = '水';
  }

  return {
    name,
    coreEnergyInsights: `${name}展现出独特的能量特质，根据您的问卷回答分析，您拥有敏感的直觉力和深刻的内省能力。您的能量场显示出对精神成长的渴望和对美好事物的追求。\n\n建议您通过定期的水晶冥想和能量清理来保持内在平衡，特别是在面对压力和挑战时，水晶能够帮助您找回内心的宁静和力量。\n\n您的能量类型适合渐进式的成长方式，避免过于激进的改变，而是通过持续的实践来提升整体振动频率。`,
    inferredZodiac: zodiac,
    inferredChineseZodiac: birthDate ? (() => {
      const year = parseInt(birthDate.split('-')[0]);
      const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
      return zodiacAnimals[(year - 4) % 12];
    })() : '无法判断',
    inferredElement: element,
    inferredPlanet: zodiac.includes('金牛') || zodiac.includes('天秤') ? '金星' : 
                   zodiac.includes('白羊') || zodiac.includes('天蝎') ? '火星' :
                   zodiac.includes('双子') || zodiac.includes('处女') ? '水星' : '月亮',
    mbtiLikeType: mbtiType + '\n\n您具有丰富的内在世界和敏锐的感知能力，善于理解他人的情感需求。这种特质使您天然地吸引具有治疗和安抚能量的水晶，如粉水晶、月光石等温和类型的宝石。\n\n建议您在日常生活中多关注直觉的声音，相信自己的第一感觉，同时保持开放的心态去接受新的体验和学习。',
    chakraAnalysis: '通过问卷分析，您的脉轮系统显示出以下特点：\n\n**心轮（第四脉轮）** - 较为活跃，显示出强烈的爱与同情心，但有时可能过于敏感，需要适当的保护和边界设定。建议使用绿色或粉色水晶。\n\n**喉轮（第五脉轮）** - 有一定的阻塞，在表达真实自我方面可能存在困难。蓝色水晶如蓝晶石、青金石能够帮助开启表达能力。\n\n**眉心轮（第六脉轮）** - 天然活跃，直觉力强，但需要更多的开发和信任。紫色水晶如紫水晶、萤石能够增强第三眼的能力。',
    recommendedCrystals: [
      {
        name: '紫水晶',
        reasoningDetails: {
          personalityFit: '适合内向思考型人格，能够增强直觉和冥想能力',
          chakraSupport: '对应顶轮，帮助精神层面的提升和觉醒',
          goalAlignment: '支持个人成长和内在平衡的目标',
          holisticSynergy: '与您的整体能量场产生和谐共振'
        },
        matchScore: 8.5
      },
      {
        name: '粉水晶',
        reasoningDetails: {
          personalityFit: '增强情感表达和人际关系能力',
          chakraSupport: '激活心轮，促进爱与慈悲的能量流动',
          goalAlignment: '帮助实现情感平衡和关系和谐',
          holisticSynergy: '温和的能量适合日常佩戴和使用'
        },
        matchScore: 8.0
      }
    ],
    crystalCombinations: [
      {
        combination: ['紫水晶', '粉水晶'],
        synergyEffect: '这个组合能够平衡精神追求与情感需求，紫水晶提供智慧洞察，粉水晶带来温暖的爱的能量，两者相辅相成，创造内外兼修的和谐状态。'
      }
    ]
  };
}

export async function analyzeUserProfile(input: FullQuestionnaireDataInput): Promise<UserProfileDataOutput> {
  // 导入必要的函数
  const { quotaManager } = await import('../pollinations');
  const { CacheManager } = await import('@/lib/cache-manager');
  const cacheManager = new CacheManager();
  
  // 生成缓存键
  const cacheKey = `user-profile:${JSON.stringify(input)}`;
  
  // 检查缓存
  const cached = await cacheManager.get<UserProfileDataOutput>(cacheKey);
  if (cached && cached.data) {
    console.log('从缓存返回用户画像分析');
    return cached.data;
  }
  
  // 检查配额
  const userId = (input as any).userId || 'anonymous';
  const membershipType = (input as any).membershipType || 'free';
  
  const hasQuota = await quotaManager.checkQuota(userId, membershipType);
  if (!hasQuota) {
    const status = quotaManager.getQuotaStatus(userId, membershipType);
    throw new Error(`用户画像分析配额已达上限。当前配额：每小时${status.hourly.used}/${status.hourly.limit}，每日${status.daily.used}/${status.daily.limit}`);
  }
  
  // 构建prompt，严格遵循原有详细结构和字段要求
  const prompt = `你是一位精通整体健康、水晶疗愈、占星和数字能量的专家，善于解读详细问卷数据。请根据以下用户问卷答案，生成全面、个性化的能量画像分析，所有输出字段均需严格遵循JSON格式，字段如下：\n\n{
  "name": string, // 用户姓名
  "coreEnergyInsights": string, // 能量核心洞察，段落分明
  "inferredZodiac": string, // 西方星座
  "inferredChineseZodiac": string, // 生肖
  "inferredElement": string, // 五行
  "inferredPlanet": string, // 行星
  "mbtiLikeType": string, // MBTI人格分析
  "chakraAnalysis": string, // 脉轮分析
  "recommendedCrystals": [
    {
      "name": string,
      "reasoningDetails": {
        "personalityFit": string,
        "chakraSupport": string,
        "goalAlignment": string,
        "holisticSynergy": string
      },
      "matchScore": number
    }
  ],
  "crystalCombinations": [
    {
      "combination": string[],
      "synergyEffect": string
    }
  ]
}\n\n所有分析字段必须为中文，且内容详实、分段清晰。若信息缺失请合理推断或说明无法判断。\n\n【用户问卷数据】\n基本信息：${JSON.stringify(input.basicInfo)}\nMBTI答题：${JSON.stringify(input.mbtiAnswers)}\n本地MBTI类型：${input.calculatedMbtiType || ''}\n脉轮评估：${JSON.stringify(input.chakraAssessment)}\n生活偏好：${JSON.stringify(input.lifestylePreferences)}\n当前状态：${JSON.stringify(input.currentStatus)}\n语言：${input.language || 'zh'}\n\n请直接返回严格符合上述JSON结构的内容。`;

  const messages = [
    { role: 'user', content: prompt }
  ];
  const token = getPollinationsToken();
  const model = getTextModel();
  
  // 使用智能重试机制
  const { withRetry } = await import('../pollinations');
  
  try {
    const result = await withRetry(async () => {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages, 
          model: model || 'openai',
          seed: Math.floor(Math.random() * 1000000),
          temperature: 0.7
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Pollinations用户画像API错误:`, res.status, errorText);
        
        if (res.status === 429) {
          throw new Error('API请求频率超限，请稍后再试');
        } else if (res.status >= 500) {
          throw new Error('Pollinations服务器暂时不可用，请稍后再试');
        } else {
          throw new Error(`API请求失败: ${res.status} ${errorText}`);
        }
      }

      const text = await res.text();
      let result: UserProfileDataOutput;
      
      // 尝试解析JSON，如果失败则尝试提取markdown代码块中的JSON
      try {
        result = JSON.parse(text);
      } catch {
        // 尝试从markdown代码块中提取JSON
        const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[1]);
          } catch {
            throw new Error('AI返回的JSON格式有误，无法解析。原始内容：' + text);
          }
        } else {
          throw new Error('AI未返回有效JSON结构，原始内容：' + text);
        }
      }
      
      // 字段兜底与清洗
      result.coreEnergyInsights = result.coreEnergyInsights?.replace(/\n/g, '\n\n') || '';
      result.mbtiLikeType = result.mbtiLikeType?.replace(/\n/g, '\n\n') || '';
      result.chakraAnalysis = result.chakraAnalysis?.replace(/\n/g, '\n\n') || '';
      if (!result.name) result.name = input.basicInfo?.name || '用户';
      if (!result.inferredZodiac) result.inferredZodiac = '无法判断';
      if (!result.inferredChineseZodiac) result.inferredChineseZodiac = '无法判断';
      if (!result.inferredElement) result.inferredElement = '无法判断';
      if (!result.inferredPlanet) result.inferredPlanet = '无法判断';
      if (!result.recommendedCrystals) result.recommendedCrystals = [];
      if (!result.crystalCombinations) result.crystalCombinations = [];
      
      return result;
    });
    
    // 缓存结果
    cacheManager.set(cacheKey, result, 60 * 60 * 1000); // 缓存1小时
    
    return result;
  } catch (error) {
    // 所有重试都失败，使用备用方案
    console.warn('Pollinations API不可用，使用备用画像生成器');
    return generateFallbackProfile(input);
  }
}

// Pollinations API 文本生成接口
async function callPollinationsUserProfileAPI(input: FullQuestionnaireDataInput, model: string, token: string): Promise<UserProfileDataOutput> {
  const res = await fetch('https://api.pollinations.ai/v1/text', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: '你是一个水晶能量与心理分析专家，请根据用户的问卷数据，生成结构化的用户画像。' },
        { role: 'user', content: JSON.stringify(input) }
      ],
      model,
      stream: false
    })
  });
  if (!res.ok) throw new Error('Pollinations 用户画像API请求失败');
  const data = await res.json();
  // 假设API返回格式为 { result: { ...UserProfileDataOutput } }
  return data.result as UserProfileDataOutput;
}

// 对外导出：根据问卷数据生成用户画像
export async function generateUserProfileByPollinations(input: FullQuestionnaireDataInput, model: string, token: string): Promise<UserProfileDataOutput> {
  return await callPollinationsUserProfileAPI(input, model, token);
}
