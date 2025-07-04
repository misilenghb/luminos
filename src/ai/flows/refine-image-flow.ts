'use server';

/**
 * @fileOverview An AI flow that refines an existing image based on a text prompt.
 *
 * - refineImage - A function that handles the image refinement process.
 */

import { pollinationsRefineImage } from '@/ai/pollinations';
import type { RefineImageInput as RawRefineImageInput, RefineImageOutput } from '../schemas/refine-image-schemas';

export type RefineImageInput = RawRefineImageInput;

function getRefineImageModel(overrideModel?: string) {
  if (overrideModel) return overrideModel;
  if (typeof window !== 'undefined') {
    const local = window.localStorage.getItem('pollinations_refine_model');
    if (local) return local;
  }
  return 'flux';
}

export async function refineImage(input: RefineImageInput): Promise<RefineImageOutput> {
  return pollinationsRefineImage(input);
}

export default refineImage;
