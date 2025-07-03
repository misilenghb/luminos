'use server';

/**
 * @fileOverview A simple text translation flow.
 *
 * - translateText - A function that handles text translation.
 */
import {
  type TranslateTextOutput
} from '@/ai/schemas/translate-schemas';

export interface TranslateTextInput {
  text: string;
  targetLanguage: string;
  model?: string;
}

const POLLINATIONS_TOKEN = 'il05Qcr-VQMGovbi';
function getTextModel(inputModel?: string) {
  if (inputModel) return inputModel;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pollinations_text_model') || 'openai';
  }
  return 'openai';
}

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  // 拼接翻译prompt
  const prompt = `Translate the following text to ${input.targetLanguage}. Return ONLY the translated text.\n\n---\n\n${input.text}\n\n---`;
  const model = getTextModel(input.model);
  const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${model}&token=${POLLINATIONS_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Pollinations 文本API请求失败');
  const translatedText = await res.text();
  return { translatedText };
}
