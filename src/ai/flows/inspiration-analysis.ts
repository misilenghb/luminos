'use server';

/**
 * @fileOverview An AI agent that analyzes an inspiration image and generates a detailed image prompt in English for a crystal jewelry design.
 *
 * - analyzeInspirationImage - A function that handles the image analysis and prompt generation.
 */

import { pollinationsAnalyzeInspiration } from '../pollinations';
import type { AnalyzeInspirationImageInput, AnalyzeInspirationImageOutput } from '../schemas/inspiration-schemas';

export type AnalyzeInspirationImageInputWithModel = AnalyzeInspirationImageInput & { model?: string };

function getInspirationModel(overrideModel?: string) {
  if (overrideModel) return overrideModel;
  if (typeof window !== 'undefined') {
    const local = window.localStorage.getItem('pollinations_inspiration_model');
    if (local) return local;
  }
  return 'flux';
}

export async function analyzeInspirationImage(input: AnalyzeInspirationImageInputWithModel, modelOverride?: string) {
  const model = getInspirationModel(modelOverride);
  return pollinationsAnalyzeInspiration({ ...input, model });
}
