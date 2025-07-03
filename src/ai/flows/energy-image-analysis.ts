'use server';
/**
 * @fileOverview An AI agent that provides a holistic metaphysical reading based on an image and user-provided crystal types.
 *
 * - analyzeEnergyImage - A function that handles the comprehensive energy reading process.
 */

import { getPollinationsToken, getTextModel } from '../pollinations';
import type { CrystalEnergyReadingInput, CrystalEnergyReadingOutput } from '../schemas/energy-image-analysis-schemas';

export async function analyzeEnergyImage(input: CrystalEnergyReadingInput): Promise<CrystalEnergyReadingOutput> {
  const prompt = `你是一位水晶能量解读专家，请根据以下图片（Base64）和水晶类型，生成详细的能量解读，返回JSON结构，字段包括：holisticSummary, energyFieldAnalysis, chakraAnalysis, metaphysicalAssociations（zodiacSigns, westernElements, fiveElements, mbtiProfile），所有内容为中文。图片Base64：${input.photoDataUri}，水晶类型：${input.crystalTypes}，语言：${input.language || 'zh'}。`;
  const messages = [{ role: 'user', content: prompt }];
  const token = getPollinationsToken();
  const model = getTextModel();
  const res = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, model, token }),
  });
  if (!res.ok) throw new Error('Pollinations能量解读API请求失败');
  const text = await res.text();
  let result: CrystalEnergyReadingOutput;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error('AI未返回有效JSON结构，原始内容：' + text);
  }
  return result;
}
