import { z } from 'zod';

export const AnalyzeInspirationImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo for design inspiration, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeInspirationImageInput = z.infer<typeof AnalyzeInspirationImageInputSchema>;

export const AnalyzeInspirationImageOutputSchema = z.object({
  prompt: z.string().describe('A detailed prompt for generating a crystal jewelry image based on the inspiration image.'),
});
export type AnalyzeInspirationImageOutput = z.infer<typeof AnalyzeInspirationImageOutputSchema>;
