'use server';

/**
 * @fileOverview An AI flow that suggests jewelry accessories based on a given design style.
 *
 * - suggestAccessories - A function that handles the accessory suggestion process.
 */

import { z } from 'zod';
import { pollinationsAccessorySuggestions } from '../pollinations';

const AccessorySuggestionInputSchema = z.object({
  style: z.string().describe('The design style for which to suggest accessories (e.g., "Bohemian", "Gothic").'),
  category: z.string().optional().describe('The design category (e.g., "bracelet", "necklace").'),
  mainStones: z.array(z.object({
    type: z.string().describe('Crystal type'),
    color: z.string().optional().describe('Crystal color'),
    shape: z.string().optional().describe('Crystal shape')
  })).optional().describe('Main stones in the design'),
  colorSystem: z.string().optional().describe('Main color system'),
  userIntent: z.string().optional().describe('User intent for the jewelry'),
  structure: z.string().optional().describe('Overall structure of the design'),
  language: z.enum(['en', 'zh']).optional().describe('The language for the suggestions.'),
  model: z.string().optional().describe('AI模型名称'),
});
export type AccessorySuggestionInput = z.infer<typeof AccessorySuggestionInputSchema>;

const AccessorySuggestionOutputSchema = z.object({
  suggestions: z.string().describe('A concise, comma-separated list of recommended accessories.'),
});
export type AccessorySuggestionOutput = z.infer<typeof AccessorySuggestionOutputSchema>;

// 推荐模型：openai
function getAccessoryModel(overrideModel?: string) {
  if (overrideModel) return overrideModel;
  if (typeof window !== 'undefined') {
    const local = window.localStorage.getItem('pollinations_accessory_model');
    if (local) return local;
  }
  return 'openai';
}

export async function suggestAccessories(input: AccessorySuggestionInput, modelOverride?: string): Promise<AccessorySuggestionOutput> {
  const model = getAccessoryModel(modelOverride);
  // 这里假设pollinationsAccessorySuggestions支持传入模型参数，如不支持请补充
  return await pollinationsAccessorySuggestions({ ...input, model });
}
