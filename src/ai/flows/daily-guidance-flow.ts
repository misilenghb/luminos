'use server';
/**
 * @fileOverview An AI flow that generates daily personalized guidance for a user.
 * It takes a user's energy profile and a target date, then returns a daily crystal, a short meditation script,
 * and an energy reminder, all tailored to the user's current state, goals, and the specific date's energetic context.
 *
 * - getDailyGuidance - Function to generate the daily guidance.
 */

import { getPollinationsToken, getTextModel } from '../pollinations';

export async function getDailyGuidance(input: { userProfile: any; targetDate: string; language?: string }): Promise<{ guidance: string; meditationPrompt: string; date: string; language: string }> {
  // 构建prompt
  const prompt = `你是一位水晶疗愈与能量指导专家，请根据以下用户画像和目标日期，生成今日专属能量建议、冥想引导语。输出JSON格式：{ guidance: string, meditationPrompt: string, date: string, language: string }，所有内容为中文。\n\n【用户画像】${JSON.stringify(input.userProfile)}\n【目标日期】${input.targetDate}\n【语言】${input.language || 'zh'}\n\n请直接返回JSON。`;
  
  try {
    // 方法1: 尝试使用直接的 URL 调用方式（Pollinations 支持的标准方式）
    const encodedPrompt = encodeURIComponent(prompt);
    const directUrl = `https://text.pollinations.ai/${encodedPrompt}`;
    
    const directResponse = await fetch(directUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (compatible; LuminosApp/1.0)',
      },
    });

    if (directResponse.ok) {
      const text = await directResponse.text();
      let result;
      try {
        result = JSON.parse(text);
        return result;
      } catch {
        // 如果不是 JSON，生成一个基本的响应
        return {
          guidance: text.substring(0, 500) || '今日能量建议：保持内心平静，专注当下的美好。',
          meditationPrompt: '闭上眼睛，深呼吸三次，感受内心的宁静与力量。',
          date: input.targetDate,
          language: input.language || 'zh'
        };
      }
    }
  } catch (error) {
    console.warn('Direct URL approach failed:', error);
  }

  try {
    // 方法2: 尝试使用 POST 请求到正确的端点
    const messages = [{ role: 'user', content: prompt }];
    const token = getPollinationsToken();
    const model = getTextModel();
    
    const response = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ 
        messages, 
        model: model || 'openai',
        ...(token && { token }) 
      }),
    });

    if (response.ok) {
      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
        return result;
      } catch {
        return {
          guidance: text.substring(0, 500) || '今日能量建议：专注内在成长，拥抱正向能量。',
          meditationPrompt: '深呼吸，让心灵与宇宙能量连接，感受当下的和谐。',
          date: input.targetDate,
          language: input.language || 'zh'
        };
      }
    }
  } catch (error) {
    console.warn('POST method failed:', error);
  }

  // 如果所有方法都失败，返回备用内容
  console.log('All API methods failed, returning fallback content');
  return {
    guidance: `【${input.targetDate} 能量指引】今日是一个充满可能性的日子。建议你保持开放的心态，专注于内在的平衡与和谐。无论遇到什么挑战，都要相信自己拥有克服困难的力量。`,
    meditationPrompt: `今日冥想引导：找一个安静的地方坐下，闭上眼睛，深呼吸三次。想象一道温暖的光芒从头顶缓缓流下，充满整个身体，带来平静与力量。保持这种感觉5-10分钟。`,
    date: input.targetDate,
    language: input.language || 'zh'
  };
}
