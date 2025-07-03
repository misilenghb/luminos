import { z } from 'zod';
import { UserProfileDataSchema } from './user-profile-schemas';

/**
 * Input schema for the daily guidance flow.
 * It wraps the user's profile data and includes the desired language.
 */
export const DailyGuidanceInputSchema = z.object({
  profile: UserProfileDataSchema.describe("The user's complete energy profile data."),
  language: z.enum(['en', 'zh']).optional().describe('The desired language for the AI response. Defaults to English.'),
  targetDate: z.string().describe("The target date for the guidance in YYYY-MM-DD format."),
  temperature: z.number().optional().describe('Controls randomness. 0 for deterministic, 1 for max creative.'),
});
export type DailyGuidanceInput = z.infer<typeof DailyGuidanceInputSchema>;


/**
 * The schema for the "crystal fortune" part of the daily guidance.
 */
const CrystalFortuneSchema = z.object({
  crystalName: z.string().describe("The name of the single recommended crystal for the day."),
  reason: z.string().describe("A brief, insightful reason for the crystal recommendation, tailored to the user's profile.")
});


/**
 * Output schema for the daily guidance flow.
 * It contains three distinct pieces of personalized guidance.
 */
export const DailyGuidanceOutputSchema = z.object({
  crystalFortune: CrystalFortuneSchema.describe("The daily crystal recommendation."),
  meditationScript: z.string().describe("A short, personalized meditation or mindfulness script for the day."),
  energyReminder: z.string().describe("A concise, thought-provoking energy insight or reminder for the day.")
});
export type DailyGuidanceOutput = z.infer<typeof DailyGuidanceOutputSchema>;
