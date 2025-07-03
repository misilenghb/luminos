import { z } from 'zod';

export const RefineImageInputSchema = z.object({
  baseImageDataUri: z
    .string()
    .describe(
      "The base image to refine, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('A detailed text prompt describing the desired refinements or changes.'),
  language: z.enum(['en', 'zh']).optional().describe('The language of the prompt, for context. Defaults to English.')
});
export type RefineImageInput = z.infer<typeof RefineImageInputSchema>;

export const RefineImageOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI for the refined, newly generated image.'),
});
export type RefineImageOutput = z.infer<typeof RefineImageOutputSchema>;
