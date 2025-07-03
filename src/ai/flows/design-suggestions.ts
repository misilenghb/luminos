'use server';

/**
 * @fileOverview 设计建议AI流程，调用Pollinations API，支持多模型和Token切换。
 * It allows users to receive AI-powered design suggestions based on their preferences and inputs,
 * returning a structured JSON object.
 * - designSuggestions - A function that handles the design suggestion process.
 * - DesignSuggestionsInput - The input type for the designSuggestions function.
 * - DesignSuggestionsOutput - The return type for the designSuggestions function (structured JSON).
 */

import {
    DesignSuggestionsInput as RawDesignSuggestionsInput,
    DesignSuggestionsOutput
} from '@/ai/schemas/design-schemas';
import { pollinationsDesignSuggestions } from '../pollinations';

export type DesignSuggestionsInput = RawDesignSuggestionsInput & { model?: string };

// 推荐模型：openai
function getDesignModel(overrideModel?: string) {
  if (overrideModel) return overrideModel;
  if (typeof window !== 'undefined') {
    const local = window.localStorage.getItem('pollinations_design_model');
    if (local) return local;
  }
  return 'openai';
}

export async function designSuggestions(input: DesignSuggestionsInput, modelOverride?: string): Promise<DesignSuggestionsOutput> {
  const model = getDesignModel(modelOverride);
  // 假设pollinationsDesignSuggestions支持传入模型参数，如不支持请补充
  const output = await pollinationsDesignSuggestions({ ...input, model });
  if (!output) {
    throw new Error("Pollinations未返回设计建议结果。");
  }
  // 字段清洗逻辑
  function cleanStringField(text?: string): string | undefined {
    if (!text) return undefined;
    const paragraphs = text.split('\n\n');
    const uniqueParagraphs = [...new Set(paragraphs)];
    let cleanedText = uniqueParagraphs.join('\n\n');
    cleanedText = cleanedText.replace(/(?<!\n\s*(\*|-)\s)(?<!\*)\*(?!\s*\*|\s)(.*?)(?<!\s)\*(?!\*)/g, '$2');
    cleanedText = cleanedText.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n\n').replace(/\n\s*\n/g, '\n\n');
    cleanedText = cleanedText.replace(/\n\s*([*-])\s*/g, '\n$1 ');
    cleanedText = cleanedText.split('\n\n').map(p => p.split('\n').map(line => line.trim()).join('\n')).join('\n\n').trim();
    return cleanedText;
  }
  return {
    personalizedIntroduction: cleanStringField(output.personalizedIntroduction) || '',
    designConcept: cleanStringField(output.designConcept) || '',
    designSchemes: (output.designSchemes as Array<any>).map((scheme: any) => ({
      schemeTitle: cleanStringField(scheme.schemeTitle) || '',
      mainStoneDescription: cleanStringField(scheme.mainStoneDescription) || '',
      auxiliaryStonesDescription: cleanStringField(scheme.auxiliaryStonesDescription) || '',
      chainOrStructureDescription: cleanStringField(scheme.chainOrStructureDescription) || '',
      otherDetails: cleanStringField(scheme.otherDetails) || '',
      imageGenerationPrompt: scheme.imageGenerationPrompt || ''
    })),
    accessorySuggestions: cleanStringField(output.accessorySuggestions) || '',
    photographySettingSuggestions: cleanStringField(output.photographySettingSuggestions) || '',
    concludingRemarks: cleanStringField(output.concludingRemarks) || '',
  };
}
