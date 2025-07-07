'use server';
/**
 * @fileOverview A conversational AI agent for the creative workshop.
 * 支持多模型和Token切换，调用Pollinations文本API。
 *
 * - getCreativeGuidance - A function that handles conversational guidance for design.
 */

import { z } from 'zod';

export type CreativeConversationInput = {
  history: { role: 'user' | 'model'; content: string }[];
  language?: 'en' | 'zh';
  model?: string;
};
export type CreativeConversationOutput = {
  response: string;
};
import { getPollinationsToken, getTextModel } from '../pollinations';

export async function getCreativeGuidance(input: CreativeConversationInput): Promise<CreativeConversationOutput> {
  try {
    // 拼接对话历史
    const messages = input.history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
    const prompt = `${messages}\nAssistant:`;
    const model = getTextModel();
    const token = getPollinationsToken();

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
      return { response: text || '我正在为您思考最佳的创意建议...' };
    }

    // 方法2: 尝试POST请求
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        model: model || 'openai',
        ...(token && { token })
      }),
    });

    if (res.ok) {
      const response = await res.text();
      return { response: response || '感谢您的耐心，我正在为您准备创意指导...' };
    }

    // 如果API调用失败，返回默认响应
    return {
      response: '抱歉，AI服务暂时不可用。请稍后再试，或者您可以描述更多细节，我会尽力为您提供建议。'
    };

  } catch (error) {
    console.error('Creative guidance error:', error);
    return {
      response: '很抱歉遇到了技术问题。请稍后重试，或者您可以详细描述您的设计需求，我会为您提供替代建议。'
    };
  }
}
