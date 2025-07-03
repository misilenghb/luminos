import { z } from 'zod';

export const CrystalEnergyReadingInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo for energy analysis, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  crystalTypes: z.string().describe("A comma-separated list of crystal names provided by the user (e.g., 'Amethyst, Rose Quartz')."),
  language: z.enum(['en', 'zh']).optional().describe('The desired language for the AI response (en for English, zh for Chinese). Defaults to English if not provided.')
});
export type CrystalEnergyReadingInput = z.infer<typeof CrystalEnergyReadingInputSchema>;

const MetaphysicalAssociationsSchema = z.object({
    zodiacSigns: z.string().describe("Inferred Zodiac signs that resonate with the combined energy, with reasoning. Use \\n\\n for paragraphs."),
    westernElements: z.string().describe("Inferred Western Elements (Fire, Water, Air, Earth, Storm) that resonate, with reasoning. Use \\n\\n for paragraphs."),
    fiveElements: z.string().describe("Inferred Chinese Five Elements (五行: Wood, Fire, Earth, Metal, Water) that resonate, with reasoning. Use \\n\\n for paragraphs."),
    mbtiProfile: z.string().describe("Inferred MBTI personality archetypes that might be drawn to this energy, with reasoning. Use \\n\\n for paragraphs.")
});

export const CrystalEnergyReadingOutputSchema = z.object({
  holisticSummary: z.string().describe("A concise, insightful summary synthesizing the combined energy of the image and the crystals. Use \\n\\n for paragraphs."),
  energyFieldAnalysis: z.string().describe("Detailed observations about the overall energetic aura or field, as influenced by the image and crystals. Use \\n\\n for paragraphs."),
  chakraAnalysis: z.string().describe("An analysis of how the image and crystals associate with the chakras, with reasoning. Use \\n\\n for paragraphs."),
  metaphysicalAssociations: MetaphysicalAssociationsSchema.describe("A collection of various metaphysical associations derived from the analysis."),
});
export type CrystalEnergyReadingOutput = z.infer<typeof CrystalEnergyReadingOutputSchema>;
