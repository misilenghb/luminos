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
  // 拼接对话历史
  const messages = input.history.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
  const prompt = `${messages}\nAssistant:`;
  const model = getTextModel();
  const token = getPollinationsToken();
  const res = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model, token }),
  });
  if (!res.ok) throw new Error('Pollinations 文本API请求失败');
  const response = await res.text();
  return { response };
}
